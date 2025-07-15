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
router.post("/", upload.single("icon"), (req, res) => {
  console.log(req.body);
  const { category_id, title, text, path } = req.body;
  const icon = req.file ? req.file.filename : null;

  if (!category_id || !title || !text || !path) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const query = `
    INSERT INTO project_cycle (category_id, icon, title, text, path)
    VALUES (?, ?, ?, ?, ?)
  `;
  db.query(query, [category_id, icon, title, text, path], (err, result) => {
    if (err) return res.status(500).json({ error: err.sqlMessage || err });
    res.json({ message: "Item created", id: result.insertId });
  });
});

// READ all items (no filter)
router.get("/", (req, res) => {
  db.query("SELECT * FROM project_cycle ORDER BY id DESC", (err, rows) => {
    if (err) return res.status(500).json({ error: err.sqlMessage || err });
    res.json(rows);
  });
});

// READ all by category
router.get("/category/:category_id", (req, res) => {
  db.query(
    "SELECT * FROM project_cycle WHERE category_id = ? ORDER BY id DESC",
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
    "SELECT * FROM project_cycle WHERE id = ?",
    [req.params.id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.sqlMessage || err });
      if (!rows.length) return res.status(404).json({ error: "Not found" });
      res.json(rows[0]);
    }
  );
});

// UPDATE by id
router.put("/:id", upload.single("icon"), (req, res) => {
  const { title, text, path: path } = req.body;
  const icon = req.file ? req.file.filename : null;

  let query = "UPDATE project_cycle SET title = ?, text = ?, path = ?";
  const params = [title, text, path];

  if (icon) {
    query += ", icon = ?";
    params.push(icon);
  }

  query += " WHERE id = ?";
  params.push(req.params.id);

  db.query(query, params, (err, result) => {
    if (err) return res.status(500).json({ error: err.sqlMessage || err });
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Not found" });
    res.json({ message: "Item updated" });
  });
});

// DELETE by id
router.delete("/:id", (req, res) => {
  db.query(
    "DELETE FROM project_cycle WHERE id = ?",
    [req.params.id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.sqlMessage || err });
      if (result.affectedRows === 0)
        return res.status(404).json({ error: "Not found" });
      res.json({ message: "Item deleted" });
    }
  );
});

module.exports = router;
