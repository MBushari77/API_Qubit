const express = require("express");
const multer = require("multer");
const path = require("path");
const db = require("../conf/db");

const router = express.Router();

// Setup multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + "-" + file.originalname.replace(/\s/g, "")),
});
const upload = multer({ storage });

// Helper to parse JSON safely
const safeJSON = (value) => {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

// CREATE
router.post("/", upload.single("image"), (req, res) => {
  const { name, title, text, link, moreInfo, icons, features, sizes } =
    req.body;
  const image = req.file ? req.file.filename : null;

  if (!name) return res.status(400).json({ error: "Name is required" });

  const query = `
    INSERT INTO projects_product 
    (name, title, text, link, image, icons, features, sizes, moreInfo)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const values = [
    name,
    title || null,
    text || null,
    link || null,
    image,
    icons || null,
    features || null,
    sizes || null,
    moreInfo || null,
  ];

  db.query(query, values, (err, result) => {
    if (err) return res.status(500).json({ error: err.sqlMessage || err });
    res.json({ message: "Project created", id: result.insertId });
  });
});

// READ ALL
router.get("/", (req, res) => {
  db.query("SELECT * FROM projects_product ORDER BY id DESC", (err, rows) => {
    if (err) return res.status(500).json({ error: err.sqlMessage || err });
    res.json(rows);
  });
});

// READ ONE
router.get("/:id", (req, res) => {
  db.query(
    "SELECT * FROM projects_product WHERE id = ?",
    [req.params.id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.sqlMessage || err });
      if (!rows.length) return res.status(404).json({ error: "Not found" });
      res.json(rows[0]);
    }
  );
});

// UPDATE
router.put("/:id", upload.single("image"), (req, res) => {
  const { name, title, text, link, moreInfo, icons, features, sizes } =
    req.body;
  const image = req.file ? req.file.filename : null;

  let query = `
    UPDATE projects_product SET 
      name = ?, title = ?, text = ?, link = ?, moreInfo = ?, 
      icons = ?, features = ?, sizes = ?
  `;
  const values = [
    name,
    title || null,
    text || null,
    link || null,
    moreInfo || null,
    icons || null,
    features || null,
    sizes || null,
  ];

  if (image) {
    query += `, image = ?`;
    values.push(image);
  }

  query += ` WHERE id = ?`;
  values.push(req.params.id);

  db.query(query, values, (err, result) => {
    if (err) return res.status(500).json({ error: err.sqlMessage || err });
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Not found" });
    res.json({ message: "Project updated" });
  });
});

// DELETE
router.delete("/:id", (req, res) => {
  db.query(
    "DELETE FROM projects_product WHERE id = ?",
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
