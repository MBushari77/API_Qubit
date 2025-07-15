const express = require("express");
const multer = require("multer");
const path = require("path");
const db = require("../conf/db");

const router = express.Router();

// Multer setup for single file upload (image/video)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// CREATE
router.post("/", upload.single("file"), (req, res) => {
  const { category_id, headline } = req.body;
  const media_file = req.file ? req.file.filename : null;

  if (!media_file) {
    return res.status(400).json({ error: "File upload required" });
  }

  const query =
    "INSERT INTO sectiontwo (category_id, headline, media_file) VALUES (?, ?, ?)";
  const values = [category_id, headline, media_file];

  db.query(query, values, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Section Two created", id: result.insertId });
  });
});

// READ ALL
router.get("/", (req, res) => {
  db.query("SELECT * FROM sectiontwo", (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});
router.get("/category/:category_id", (req, res) => {
  db.query(
    "SELECT * FROM sectiontwo WHERE category_id = ?",
    [req.params.category_id],
    (err, results) => {
      if (err) return res.status(500).json(err);
      res.json(results);
    }
  );
});
// READ ONE by ID
router.get("/:id", (req, res) => {
  db.query(
    "SELECT * FROM sectiontwo WHERE id = ?",
    [req.params.id],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json(result[0]);
    }
  );
});

// UPDATE by ID
router.put("/:id", upload.single("file"), (req, res) => {
  const { category_id, headline, oldMediaFile } = req.body;

  // Use new uploaded file or fallback to old media filename
  const media_file = req.file ? req.file.filename : oldMediaFile;

  if (!media_file) {
    return res.status(400).json({ error: "File upload required" });
  }

  const query = `
    UPDATE sectiontwo SET
      category_id = ?,
      headline = ?,
      media_file = ?
    WHERE id = ?
  `;

  const values = [category_id, headline, media_file, req.params.id];

  db.query(query, values, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Section Two updated" });
  });
});

// DELETE by ID
router.delete("/:id", (req, res) => {
  db.query("DELETE FROM sectiontwo WHERE id = ?", [req.params.id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Section Two deleted" });
  });
});

module.exports = router;
