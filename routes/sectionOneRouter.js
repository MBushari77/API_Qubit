const express = require("express");
const multer = require("multer");
const path = require("path");
const db = require("../conf/db");

const router = express.Router();

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// Upload fields including images and specsheets
const uploadFields = upload.fields([
  { name: "image", maxCount: 1 },
  { name: "product1_specsheet", maxCount: 1 },
  { name: "product2_specsheet", maxCount: 1 },
  { name: "product1_image", maxCount: 1 },
  { name: "product2_image", maxCount: 1 },
]);

// CREATE
router.post("/", uploadFields, (req, res) => {
  const {
    category_id,
    headline,
    product1_name,
    product1_description,
    product1_feature1,
    product1_feature2,
    product1_link,
    product2_name,
    product2_description,
    product2_feature1,
    product2_feature2,
    product2_link,
  } = req.body;

  const image = req.files["image"]?.[0]?.filename || null;
  const product1_specsheet =
    req.files["product1_specsheet"]?.[0]?.filename || null;
  const product2_specsheet =
    req.files["product2_specsheet"]?.[0]?.filename || null;
  const product1_image = req.files["product1_image"]?.[0]?.filename || null;
  const product2_image = req.files["product2_image"]?.[0]?.filename || null;

  const query = `
    INSERT INTO section_one (
      category_id, headline, image,
      product1_name, product1_description, product1_feature1, product1_feature2, product1_link, product1_specsheet, product1_image,
      product2_name, product2_description, product2_feature1, product2_feature2, product2_link, product2_specsheet, product2_image
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    category_id,
    headline,
    image,
    product1_name,
    product1_description,
    product1_feature1,
    product1_feature2,
    product1_link,
    product1_specsheet,
    product1_image,
    product2_name,
    product2_description,
    product2_feature1,
    product2_feature2,
    product2_link,
    product2_specsheet,
    product2_image,
  ];

  db.query(query, values, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Section One created", id: result.insertId });
  });
});

// READ ALL
router.get("/", (req, res) => {
  db.query("SELECT * FROM section_one", (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

// READ BY CATEGORY
router.get("/category/:category_id", (req, res) => {
  db.query(
    "SELECT * FROM section_one WHERE category_id = ?",
    [req.params.category_id],
    (err, results) => {
      console.log(req.params.category_id);
      if (err) return res.status(500).json(err);
      res.json(results);
    }
  );
});

// READ ONE
router.get("/:id", (req, res) => {
  db.query(
    "SELECT * FROM section_one WHERE id = ?",
    [req.params.id],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json(result[0]);
    }
  );
});

// UPDATE
router.put("/:id", uploadFields, (req, res) => {
  const {
    category_id,
    headline,
    product1_name,
    product1_description,
    product1_feature1,
    product1_feature2,
    product1_link,
    product1_specsheet: product1_specsheet_old,
    product1_image: product1_image_old,
    product2_name,
    product2_description,
    product2_feature1,
    product2_feature2,
    product2_link,
    product2_specsheet: product2_specsheet_old,
    product2_image: product2_image_old,
    oldImage,
  } = req.body;

  const image = req.files["image"]?.[0]?.filename || oldImage || null;
  const product1_specsheet =
    req.files["product1_specsheet"]?.[0]?.filename ||
    product1_specsheet_old ||
    null;
  const product1_image =
    req.files["product1_image"]?.[0]?.filename || product1_image_old || null;
  const product2_specsheet =
    req.files["product2_specsheet"]?.[0]?.filename ||
    product2_specsheet_old ||
    null;
  const product2_image =
    req.files["product2_image"]?.[0]?.filename || product2_image_old || null;

  const query = `
    UPDATE section_one SET
      category_id = ?,
      headline = ?, image = ?,
      product1_name = ?, product1_description = ?, product1_feature1 = ?, product1_feature2 = ?, product1_link = ?, product1_specsheet = ?, product1_image = ?,
      product2_name = ?, product2_description = ?, product2_feature1 = ?, product2_feature2 = ?, product2_link = ?, product2_specsheet = ?, product2_image = ?
    WHERE id = ?
  `;

  const values = [
    category_id,
    headline,
    image,
    product1_name,
    product1_description,
    product1_feature1,
    product1_feature2,
    product1_link,
    product1_specsheet,
    product1_image,
    product2_name,
    product2_description,
    product2_feature1,
    product2_feature2,
    product2_link,
    product2_specsheet,
    product2_image,
    req.params.id,
  ];

  db.query(query, values, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Section One updated" });
  });
});

// DELETE
router.delete("/:id", (req, res) => {
  db.query(
    "DELETE FROM section_one WHERE id = ?",
    [req.params.id],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Section One deleted" });
    }
  );
});

module.exports = router;
