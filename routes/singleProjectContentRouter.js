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
  const { category_id, title, subtitle, text, path } = req.body;
  const icon = req.file ? req.file.filename : null;

  if (!category_id || !title || !subtitle || !text || !path) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const query = `
    INSERT INTO single_project_content (category_id, icon, title, subtitle, text, path)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  db.query(
    query,
    [category_id, icon, title, subtitle, text, path],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.sqlMessage || err });
      res.json({ message: "Project created", id: result.insertId });
    }
  );
});

// READ all items
router.get("/", (req, res) => {
  db.query("SELECT * FROM single_project_content", (err, rows) => {
    if (err) return res.status(500).json({ error: err.sqlMessage || err });
    res.json(rows);
  });
});

// READ by category
router.get("/category/:category_id", (req, res) => {
  db.query(
    "SELECT * FROM single_project_content WHERE category_id = ?",
    [req.params.category_id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.sqlMessage || err });
      res.json(rows);
    }
  );
});

// READ one by ID
router.get("/:id", (req, res) => {
  db.query(
    "SELECT * FROM single_project_content WHERE id = ?",
    [req.params.id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.sqlMessage || err });
      if (!rows.length) return res.status(404).json({ error: "Not found" });
      res.json(rows[0]);
    }
  );
});

// UPDATE
router.put("/:id", upload.single("icon"), (req, res) => {
  const { title, subtitle, text, path } = req.body;
  const icon = req.file ? req.file.filename : null;

  let query =
    "UPDATE single_project_content SET title = ?, subtitle = ?, text = ?, path = ?";
  const params = [title, subtitle, text, path];

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
    res.json({ message: "Project updated" });
  });
});

// DELETE
router.delete("/:id", (req, res) => {
  db.query(
    "DELETE FROM single_project_content WHERE id = ?",
    [req.params.id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.sqlMessage || err });
      if (result.affectedRows === 0)
        return res.status(404).json({ error: "Not found" });
      res.json({ message: "Project deleted" });
    }
  );
});

module.exports = router;
