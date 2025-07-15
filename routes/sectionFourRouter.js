const express = require("express");
const multer = require("multer");
const path = require("path");
const db = require("../conf/db");

const router = express.Router();

// Setup multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + "-" + file.originalname.replace(/\s/g, "")),
});
const upload = multer({ storage });

// CREATE
router.post("/", upload.single("image"), (req, res) => {
  const { category_id, title, info, path: redirectPath, color } = req.body;
  const image = req.file ? req.file.filename : null;

  if (!category_id || !title) {
    return res
      .status(400)
      .json({ error: "category_id and title are required" });
  }

  const query = `
    INSERT INTO sectionfour (category_id, image, title, info, path, color)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  db.query(
    query,
    [category_id, image, title, info, redirectPath, color],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.sqlMessage || err });
      res.json({ message: "Section Four item created", id: result.insertId });
    }
  );
});

// READ all by category
router.get("/category/:category_id", (req, res) => {
  db.query(
    "SELECT * FROM sectionfour WHERE category_id = ? ORDER BY id DESC",
    [req.params.category_id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.sqlMessage || err });
      res.json(rows);
    }
  );
});

// READ one by id
router.get("/:id", (req, res) => {
  db.query(
    "SELECT * FROM sectionfour WHERE id = ?",
    [req.params.id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.sqlMessage || err });
      if (!rows.length) return res.status(404).json({ error: "Not found" });
      res.json(rows[0]);
    }
  );
});

// UPDATE by id
router.put("/:id", upload.single("image"), (req, res) => {
  const { title, info, path: redirectPath, color } = req.body;
  const image = req.file ? req.file.filename : null;

  // Build dynamic query depending on whether image was uploaded or not
  let query = "UPDATE sectionfour SET title = ?, info = ?, path = ?, color = ?";
  let params = [title, info, redirectPath, color];

  if (image) {
    query += ", image = ?";
    params.push(image);
  }

  query += " WHERE id = ?";
  params.push(req.params.id);

  db.query(query, params, (err, result) => {
    if (err) return res.status(500).json({ error: err.sqlMessage || err });
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Not found" });
    res.json({ message: "Section Four item updated" });
  });
});

// DELETE by id
router.delete("/:id", (req, res) => {
  db.query(
    "DELETE FROM sectionfour WHERE id = ?",
    [req.params.id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.sqlMessage || err });
      if (result.affectedRows === 0)
        return res.status(404).json({ error: "Not found" });
      res.json({ message: "Section Four item deleted" });
    }
  );
});

module.exports = router;
