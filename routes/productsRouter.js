const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const db = require("../conf/db");

const router = express.Router();

// Storage Config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads"),
  filename: (req, file, cb) => cb(null, Date.now() + "_" + file.originalname),
});

const upload = multer({ storage });

// Upload multiple files: image, banner, specsheet, features images[]
const productUpload = upload.fields([
  { name: "image", maxCount: 1 },
  { name: "banner", maxCount: 1 },
  { name: "specsheet", maxCount: 1 },
  { name: "feature_images" }, // dynamically mapped to titles
]);

// CREATE
router.post("/", productUpload, (req, res) => {
  const { name, description } = req.body;
  const image = req.files.image?.[0]?.filename || null;
  const banner = req.files.banner?.[0]?.filename || null;
  const specsheet = req.files.specsheet?.[0]?.filename || null;

  // Features
  const featureTitles = JSON.parse(req.body.feature_titles || "[]");
  const featureImages = req.files["feature_images"] || [];

  const features = featureTitles.map((title, index) => ({
    title,
    image: featureImages[index] ? featureImages[index].filename : null,
  }));

  const query = `
    INSERT INTO products (name, description, image, banner, specsheet, features)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  const values = [
    name,
    description,
    image,
    banner,
    specsheet,
    JSON.stringify(features),
  ];

  db.query(query, values, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Product created", id: result.insertId });
  });
});

// READ ALL
router.get("/", (req, res) => {
  db.query("SELECT * FROM products ORDER BY id DESC", (err, results) => {
    if (err) return res.status(500).json(err);
    results.forEach((p) => {
      try {
        p.features = JSON.parse(p.features || "[]");
      } catch {
        p.features = [];
      }
    });
    res.json(results);
  });
});

// READ ONE
router.get("/:id", (req, res) => {
  db.query(
    "SELECT * FROM products WHERE id = ?",
    [req.params.id],
    (err, result) => {
      if (err) return res.status(500).json(err);
      const data = result[0];
      try {
        data.features = JSON.parse(data.features || "[]");
      } catch {
        data.features = [];
      }
      res.json(data);
    }
  );
});

// UPDATE
router.put("/:id", productUpload, (req, res) => {
  const { name, description, oldImage, oldBanner, oldSpecsheet } = req.body;

  const image = req.files.image?.[0]?.filename || oldImage;
  const banner = req.files.banner?.[0]?.filename || oldBanner;
  const specsheet = req.files.specsheet?.[0]?.filename || oldSpecsheet;

  const featureTitles = JSON.parse(req.body.feature_titles || "[]");
  const featureImages = req.files["feature_images"] || [];

  const features = featureTitles.map((title, index) => ({
    title,
    image: featureImages[index] ? featureImages[index].filename : null,
  }));

  const query = `
    UPDATE products SET
      name = ?, description = ?, image = ?, banner = ?, specsheet = ?, features = ?
    WHERE id = ?
  `;

  const values = [
    name,
    description,
    image,
    banner,
    specsheet,
    JSON.stringify(features),
    req.params.id,
  ];

  db.query(query, values, (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Product updated" });
  });
});

// DELETE
router.delete("/:id", (req, res) => {
  db.query("DELETE FROM products WHERE id = ?", [req.params.id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Product deleted" });
  });
});

module.exports = router;
