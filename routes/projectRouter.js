const express = require("express");
const multer = require("multer");
const path = require("path");
const db = require("../conf/db");
const fs = require("fs");

const router = express.Router();

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + "-" + file.originalname.replace(/\s/g, "")),
});
const upload = multer({ storage });

// CREATE
router.post("/", upload.array("images[]"), (req, res) => {
  const { name, text } = req.body;
  const imageFiles = req.files || [];
  const imageFilenames = imageFiles.map((file) => file.filename);

  if (!name || !text) {
    return res.status(400).json({ error: "Name and text are required" });
  }

  const query = `
    INSERT INTO projects (name, text, images)
    VALUES (?, ?, ?)
  `;
  db.query(
    query,
    [name, text, JSON.stringify(imageFilenames)],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.sqlMessage || err });
      res.json({ message: "Project created", id: result.insertId });
    }
  );
});

// READ ALL
router.get("/", (req, res) => {
  db.query("SELECT * FROM projects ORDER BY id DESC", (err, rows) => {
    if (err) return res.status(500).json({ error: err.sqlMessage || err });
    res.json(
      rows.map((row) => ({
        ...row,
        images: row.images ? JSON.parse(row.images) : [],
      }))
    );
  });
});

// READ ONE
router.get("/:id", (req, res) => {
  db.query(
    "SELECT * FROM projects WHERE id = ?",
    [req.params.id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.sqlMessage || err });
      if (!rows.length) return res.status(404).json({ error: "Not found" });

      const project = rows[0];
      project.images = project.images ? JSON.parse(project.images) : [];
      res.json(project);
    }
  );
});

// UPDATE
router.put("/:id", upload.array("images[]"), (req, res) => {
  const { name, text, oldImages } = req.body;
  const newImageFiles = req.files || [];

  const oldList = oldImages ? JSON.parse(oldImages) : [];
  const newList = newImageFiles.map((file) => file.filename);
  const finalImages = [...oldList, ...newList];

  if (!name || !text) {
    return res.status(400).json({ error: "Name and text are required" });
  }

  const query = `
    UPDATE projects
    SET name = ?, text = ?, images = ?
    WHERE id = ?
  `;
  db.query(
    query,
    [name, text, JSON.stringify(finalImages), req.params.id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.sqlMessage || err });
      if (result.affectedRows === 0)
        return res.status(404).json({ error: "Project not found" });
      res.json({ message: "Project updated" });
    }
  );
});

// DELETE
router.delete("/:id", (req, res) => {
  db.query(
    "SELECT images FROM projects WHERE id = ?",
    [req.params.id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.sqlMessage || err });
      if (!rows.length) return res.status(404).json({ error: "Not found" });

      const imageList = rows[0].images ? JSON.parse(rows[0].images) : [];
      imageList.forEach((img) => {
        const imgPath = path.join(__dirname, "../uploads", img);
        if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
      });

      db.query(
        "DELETE FROM projects WHERE id = ?",
        [req.params.id],
        (err2, result) => {
          if (err2)
            return res.status(500).json({ error: err2.sqlMessage || err2 });
          res.json({ message: "Project deleted" });
        }
      );
    }
  );
});

module.exports = router;
