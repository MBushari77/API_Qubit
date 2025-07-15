const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const db = require("../conf/db");

const router = express.Router();

// Multer setup for icon uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

/** CREATE - Add new category */
router.post("/add", upload.single("icon"), (req, res) => {
  const { name } = req.body;
  const icon = req.file?.filename;

  if (!name || !icon) {
    return res.status(400).json({ error: "Name and icon are required" });
  }

  const sql = "INSERT INTO categories (name, icon) VALUES (?, ?)";
  db.query(sql, [name, icon], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Category created", id: result.insertId });
  });
});

/** READ - Get all categories */
router.get("/", (req, res) => {
  db.query("SELECT * FROM categories", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

/** READ - Get one category by ID */
router.get("/:id", (req, res) => {
  db.query(
    "SELECT * FROM categories WHERE id = ?",
    [req.params.id],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      if (results.length === 0)
        return res.status(404).json({ error: "Not found" });
      res.json(results[0]);
    }
  );
});

/** UPDATE - Edit a category (with optional icon update) */
router.put("/:id", upload.single("icon"), (req, res) => {
  const { name } = req.body;
  const newIcon = req.file?.filename;

  db.query(
    "SELECT icon FROM categories WHERE id = ?",
    [req.params.id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      if (rows.length === 0)
        return res.status(404).json({ error: "Not found" });

      const oldIcon = rows[0].icon;
      const sql = "UPDATE categories SET name = ?, icon = ? WHERE id = ?";
      const iconToUse = newIcon || oldIcon;

      db.query(sql, [name, iconToUse, req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });

        // Remove old icon if new one was uploaded
        if (newIcon && oldIcon) {
          fs.unlink(`uploads/${oldIcon}`, (err) => {
            if (err) console.warn("Failed to delete old icon:", err.message);
          });
        }

        res.json({ message: "Category updated" });
      });
    }
  );
});

/** DELETE - Remove a category */
router.delete("/delete/:id", (req, res) => {
  db.query(
    "SELECT icon FROM categories WHERE id = ?",
    [req.params.id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      if (rows.length === 0)
        return res.status(404).json({ error: "Not found" });

      const icon = rows[0].icon;

      db.query(
        "DELETE FROM categories WHERE id = ?",
        [req.params.id],
        (err) => {
          if (err) return res.status(500).json({ error: err.message });

          // Delete the icon from filesystem
          fs.unlink(`uploads/${icon}`, (err) => {
            if (err) console.warn("Icon not deleted:", err.message);
          });

          res.json({ message: "Category deleted" });
        }
      );
    }
  );
});

module.exports = router;
