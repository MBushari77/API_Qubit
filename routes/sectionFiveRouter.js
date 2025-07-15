const express = require("express");
const multer = require("multer");
const path = require("path");
const db = require("../conf/db");

const router = express.Router();

// Multer Setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// ➕ Add New Item
router.post("/", upload.single("image"), (req, res) => {
  const { category_id, name, paragraph } = req.body;
  const image = req.file ? req.file.filename : null;

  const q = `
    INSERT INTO sectionfive (category_id, image, name, paragraph)
    VALUES (?, ?, ?, ?)
  `;
  db.query(q, [category_id, image, name, paragraph], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res
      .status(201)
      .json({ id: result.insertId, category_id, name, paragraph, image });
  });
});

// 📥 Get All Items
router.get("/", (req, res) => {
  db.query("SELECT * FROM sectionfive ORDER BY id DESC", (err, data) => {
    if (err) return res.status(500).json({ error: err });
    res.json(data);
  });
});

// 📥 Get Items by Category
router.get("/category/:id", (req, res) => {
  db.query(
    "SELECT * FROM sectionfive WHERE category_id = ? ORDER BY id DESC",
    [req.params.id],
    (err, data) => {
      if (err) return res.status(500).json({ error: err });
      res.json(data);
    }
  );
});

// 📥 Get Single Item
router.get("/:id", (req, res) => {
  db.query(
    "SELECT * FROM sectionfive WHERE id = ?",
    [req.params.id],
    (err, data) => {
      if (err) return res.status(500).json({ error: err });
      res.json(data[0]);
    }
  );
});

// ✏️ Update Item
router.put("/:id", upload.single("image"), (req, res) => {
  const { name, paragraph } = req.body;
  const image = req.file ? req.file.filename : null;

  const q = image
    ? "UPDATE sectionfive SET name = ?, paragraph = ?, image = ? WHERE id = ?"
    : "UPDATE sectionfive SET name = ?, paragraph = ? WHERE id = ?";

  const values = image
    ? [name, paragraph, image, req.params.id]
    : [name, paragraph, req.params.id];

  db.query(q, values, (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ success: true });
  });
});

// 🗑️ Delete Item
router.delete("/:id", (req, res) => {
  db.query("DELETE FROM sectionfive WHERE id = ?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ success: true });
  });
});

module.exports = router;
