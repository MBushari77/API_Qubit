const express = require("express");
const multer = require("multer");
const path = require("path");
const db = require("../conf/db");
const fs = require("fs");

const router = express.Router();

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// CREATE Hero Banner
router.post("/add", upload.single("image"), (req, res) => {
  const { active, link, title, info } = req.body;
  const image = req.file?.filename || null;

  const sql = `
    INSERT INTO bodyslider (image, active, link, title, info)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [image, Number(active), link || null, title || null, info || null],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({
        success: true,
        message: "Hero banner created successfully",
        id: result.insertId,
      });
    }
  );
});

// READ one Hero Banner
router.get("/:id", (req, res) => {
  const { id } = req.params;
  db.query("SELECT * FROM bodyslider WHERE id = ?", [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.length === 0)
      return res.status(404).json({ message: "Hero banner not found" });
    res.json({ success: true, banner: result[0] });
  });
});

// READ all Hero Banners
router.get("", (req, res) => {
  db.query("SELECT * FROM bodyslider", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, banners: results });
  });
});

// UPDATE Hero Banner
router.put("/:id", upload.single("image"), (req, res) => {
  const { id } = req.params;
  const { active, link, title, info } = req.body;

  // check existing banner
  db.query("SELECT image FROM bodyslider WHERE id = ?", [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.length === 0)
      return res.status(404).json({ message: "Hero banner not found" });

    let newImage = result[0].image;
    if (req.file) {
      newImage = req.file.filename;

      // remove old file
      if (result[0].image) {
        const oldFilePath = path.join(__dirname, "../uploads", result[0].image);
        fs.unlink(oldFilePath, (fsErr) => {
          if (fsErr && fsErr.code !== "ENOENT") {
            console.error("Error deleting old image:", fsErr);
          }
        });
      }
    }

    const sql = `
      UPDATE bodyslider SET image = ?, active = ?, link = ?, title = ?, info = ?
      WHERE id = ?
    `;
    db.query(
      sql,
      [newImage, Number(active), link || null, title || null, info || null, id],
      (updateErr) => {
        if (updateErr)
          return res.status(500).json({ error: updateErr.message });
        res.json({
          success: true,
          message: "Hero banner updated successfully",
        });
      }
    );
  });
});

// DELETE one Hero Banner
router.delete("/:id", (req, res) => {
  const { id } = req.params;

  db.query("SELECT image FROM bodyslider WHERE id = ?", [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.length === 0)
      return res.status(404).json({ message: "Hero banner not found" });

    const sql = "DELETE FROM bodyslider WHERE id = ?";
    db.query(sql, [id], (deleteErr) => {
      if (deleteErr) return res.status(500).json({ error: deleteErr.message });

      // remove file
      if (result[0].image) {
        const filePath = path.join(__dirname, "../uploads", result[0].image);
        fs.unlink(filePath, (fsErr) => {
          if (fsErr && fsErr.code !== "ENOENT") {
            console.error("Error deleting image:", fsErr);
          }
        });
      }

      res.json({
        success: true,
        message: "Hero banner deleted successfully",
      });
    });
  });
});

// BATCH delete hero banners
router.delete("", (req, res) => {
  const { ids } = req.body;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res
      .status(400)
      .json({ message: "You must provide an array of banner IDs in 'ids'" });
  }

  const placeholders = ids.map(() => "?").join(",");
  const selectSql = `SELECT image FROM bodyslider WHERE id IN (${placeholders})`;

  db.query(selectSql, ids, (selectErr, results) => {
    if (selectErr) return res.status(500).json({ error: selectErr.message });
    if (results.length === 0)
      return res
        .status(404)
        .json({ message: "No banners found for the provided IDs" });

    const deleteSql = `DELETE FROM bodyslider WHERE id IN (${placeholders})`;
    db.query(deleteSql, ids, (deleteErr) => {
      if (deleteErr) return res.status(500).json({ error: deleteErr.message });

      results.forEach((banner) => {
        if (banner.image) {
          const filePath = path.join(__dirname, "../uploads", banner.image);
          fs.unlink(filePath, (fsErr) => {
            if (fsErr && fsErr.code !== "ENOENT") {
              console.error("Error deleting file:", fsErr);
            }
          });
        }
      });

      res.json({
        success: true,
        message: `Deleted ${results.length} hero banners successfully`,
      });
    });
  });
});

module.exports = router;
