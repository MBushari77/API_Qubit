const express = require("express");
const multer = require("multer");
const path = require("path");
const db = require("../conf/db");

const router = express.Router();

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// ➕ Add new SectionSix item
router.post("/", upload.single("image"), (req, res) => {
  const { category_id, title, paragraph } = req.body;
  const image = req.file ? req.file.filename : null;

  const q = `
    INSERT INTO sectionsix (category_id, image, title, paragraph)
    VALUES (?, ?, ?, ?)
  `;
  db.query(q, [category_id, image, title, paragraph], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.status(201).json({
      id: result.insertId,
      category_id,
      title,
      paragraph,
      image,
    });
  });
});

// 📥 Get all items
router.get("/", (req, res) => {
  db.query("SELECT * FROM sectionsix ORDER BY id DESC", (err, data) => {
    if (err) return res.status(500).json({ error: err });
    res.json(data);
  });
});

// 📥 Get by category ID
router.get("/category/:id", (req, res) => {
  db.query(
    "SELECT * FROM sectionsix WHERE category_id = ? ORDER BY id DESC",
    [req.params.id],
    (err, data) => {
      if (err) return res.status(500).json({ error: err });
      res.json(data);
    }
  );
});

// 📥 Get one by ID
router.get("/:id", (req, res) => {
  db.query(
    "SELECT * FROM sectionsix WHERE id = ?",
    [req.params.id],
    (err, data) => {
      if (err) return res.status(500).json({ error: err });
      res.json(data[0]);
    }
  );
});

// ✏️ Update item
router.put("/:id", upload.single("image"), (req, res) => {
  const { title, paragraph } = req.body;
  const image = req.file ? req.file.filename : null;

  const q = image
    ? "UPDATE sectionsix SET title = ?, paragraph = ?, image = ? WHERE id = ?"
    : "UPDATE sectionsix SET title = ?, paragraph = ? WHERE id = ?";

  const values = image
    ? [title, paragraph, image, req.params.id]
    : [title, paragraph, req.params.id];

  db.query(q, values, (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ success: true });
  });
});

// ❌ Delete item
router.delete("/:id", (req, res) => {
  db.query("DELETE FROM sectionsix WHERE id = ?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ success: true });
  });
});

module.exports = router;
