const express = require("express");
const multer = require("multer");
const path = require("path");
const db = require("../conf/db");

const router = express.Router();

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + "-" + file.originalname.replace(/\s/g, "")),
});
const upload = multer({ storage });

// CREATE sub-category
router.post(
  "/",
  upload.fields([
    { name: "banner", maxCount: 1 },
    { name: "specsheet", maxCount: 1 },
  ]),
  (req, res) => {
    const { name, title, text, path: subPath } = req.body;
    const banner = req.files["banner"] ? req.files["banner"][0].filename : null;
    const specsheet = req.files["specsheet"]
      ? req.files["specsheet"][0].filename
      : null;

    if (!name || !title || !text || !subPath) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const query = `
      INSERT INTO sub_category (name, banner, title, text, path, specsheet)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(
      query,
      [name, banner, title, text, subPath, specsheet],
      (err, result) => {
        if (err) return res.status(500).json({ error: err.sqlMessage || err });
        res.json({ message: "Sub-category created", id: result.insertId });
      }
    );
  }
);

// READ all sub-categories
router.get("/", (req, res) => {
  db.query("SELECT * FROM sub_category ORDER BY id DESC", (err, rows) => {
    if (err) return res.status(500).json({ error: err.sqlMessage || err });
    res.json(rows);
  });
});

// READ single sub-category by ID
router.get("/:id", (req, res) => {
  db.query(
    "SELECT * FROM sub_category WHERE id = ?",
    [req.params.id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.sqlMessage || err });
      if (!rows.length)
        return res.status(404).json({ error: "Sub-category not found" });
      res.json(rows[0]);
    }
  );
});

// UPDATE sub-category
router.put(
  "/:id",
  upload.fields([
    { name: "banner", maxCount: 1 },
    { name: "specsheet", maxCount: 1 },
  ]),
  (req, res) => {
    const { name, title, text, path: subPath } = req.body;
    const newBanner = req.files["banner"]
      ? req.files["banner"][0].filename
      : null;
    const newSpecsheet = req.files["specsheet"]
      ? req.files["specsheet"][0].filename
      : null;

    // Get existing files first
    db.query(
      "SELECT banner, specsheet FROM sub_category WHERE id = ?",
      [req.params.id],
      (err, rows) => {
        if (err) return res.status(500).json({ error: err.sqlMessage || err });
        if (!rows.length)
          return res.status(404).json({ error: "Sub-category not found" });

        const existing = rows[0];
        const banner = newBanner || existing.banner;
        const specsheet = newSpecsheet || existing.specsheet;

        const updateQuery = `
        UPDATE sub_category 
        SET name = ?, banner = ?, title = ?, text = ?, path = ?, specsheet = ?
        WHERE id = ?
      `;

        db.query(
          updateQuery,
          [name, banner, title, text, subPath, specsheet, req.params.id],
          (err, result) => {
            if (err)
              return res.status(500).json({ error: err.sqlMessage || err });
            res.json({ message: "Sub-category updated" });
          }
        );
      }
    );
  }
);

// DELETE sub-category
router.delete("/:id", (req, res) => {
  db.query(
    "DELETE FROM sub_category WHERE id = ?",
    [req.params.id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.sqlMessage || err });
      if (result.affectedRows === 0)
        return res.status(404).json({ error: "Sub-category not found" });
      res.json({ message: "Sub-category deleted" });
    }
  );
});

module.exports = router;
