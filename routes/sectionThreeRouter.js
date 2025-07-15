const express = require("express");
const db = require("../conf/db");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();

// Storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "uploads/products";
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = Date.now() + "-" + Math.round(Math.random() * 1e9) + ext;
    cb(null, name);
  },
});

const upload = multer({ storage });

// CREATE or UPDATE
router.post("/", upload.any(), async (req, res) => {
  const {
    id,
    category_id,
    headline_one,
    headline_two,
    description,
    headline_three,
    path,
    about,
    icons,
    sizes,
    features,
    advantages,
  } = req.body;

  // Map uploaded files
  const fileMap = {};
  req.files.forEach((file) => {
    fileMap[file.fieldname] = file.path;
  });

  // Default: new uploaded paths
  let image = fileMap["image"] || null;
  let specsheet = fileMap["specsheet"] || null;

  // Parse JSON fields
  const iconsArr = JSON.parse(icons || "[]");
  const sizesArr = JSON.parse(sizes || "[]");
  const featuresArr = JSON.parse(features || "[]");
  const advantagesArr = JSON.parse(advantages || "[]");

  try {
    // 🔁 If updating, load current data from DB to preserve unchanged fields
    let oldData = {};
    if (id) {
      const rows = await new Promise((resolve, reject) => {
        db.query(
          "SELECT * FROM sectionthree WHERE id = ?",
          [id],
          (err, result) => {
            if (err) return reject(err);
            resolve(result);
          }
        );
      });

      if (rows.length === 0)
        return res.status(404).json({ success: false, message: "Not found" });
      oldData = rows[0];

      if (!image) image = oldData.image;
      if (!specsheet) specsheet = oldData.specsheet;
    }

    // Merge feature images: if file is uploaded use it, otherwise use existing path
    let oldFeatureImages = [];
    if (oldData.features) {
      try {
        oldFeatureImages = JSON.parse(oldData.features);
      } catch {}
    }

    const fullFeatures = featuresArr.map((feat, index) => {
      const uploadedImage = fileMap[`feature_image_${index}`];
      const existingImage = oldFeatureImages[index]?.image || null;
      return {
        title: feat.title,
        image: uploadedImage || existingImage || null,
      };
    });

    // Convert to strings
    const iconsStr = JSON.stringify(iconsArr);
    const sizesStr = JSON.stringify(sizesArr);
    const featuresStr = JSON.stringify(fullFeatures);
    const advantagesStr = JSON.stringify(advantagesArr);

    // Perform INSERT or UPDATE
    if (id) {
      await db.query(
        `UPDATE sectionthree SET 
            category_id=?, headline_one=?, image=?, icons=?, 
            headline_two=?, description=?, headline_three=?, path=?, 
            specsheet=?, sizes=?, about=?, features=?, advantages=? 
          WHERE id = ?`,
        [
          category_id,
          headline_one,
          image,
          iconsStr,
          headline_two,
          description,
          headline_three,
          path,
          specsheet,
          sizesStr,
          about,
          featuresStr,
          advantagesStr,
          id,
        ]
      );
      res.json({ success: true, message: "Updated" });
    } else {
      await db.query(
        `INSERT INTO sectionthree 
          (category_id, headline_one, image, icons, headline_two, description, headline_three, path, specsheet, sizes, about, features, advantages) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          category_id,
          headline_one,
          image,
          iconsStr,
          headline_two,
          description,
          headline_three,
          path,
          specsheet,
          sizesStr,
          about,
          featuresStr,
          advantagesStr,
        ]
      );
      res.json({ success: true, message: "Created" });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

router.get("/by-category/:category_id", async (req, res) => {
  const { category_id } = req.params;
  try {
    db.query(
      "SELECT * FROM sectionthree WHERE category_id = ?",
      [category_id],
      (error, results) => {
        if (error) {
          res.status(500).json({ success: false, error: "Database error" });
          return;
        }
        res.json({ success: true, data: results });
      }
    );
  } catch (err) {
    res.status(500).json({ success: false, error: "Server error" });
  }
});

router.get("/getall", async (req, res) => {
  try {
    db.query("SELECT * FROM sectionthree", (error, results) => {
      if (error) {
        res.status(500).json({ success: false, error: "Database error" });
        return;
      }
      res.json({ success: true, data: results });
    });
  } catch (err) {
    res.status(500).json({ success: false, error: "Server error" });
  }
});
// GET single product
router.get("/getone/:id", async (req, res) => {
  const { id } = req.params;
  db.query(`SELECT * FROM sectionthree WHERE id = ${id}`, (error, result) => {
    if (error) {
      res.send({ success: false });
      return;
    }
    console.log(result[0]);
    res.send(result[0]);
  });
});

module.exports = router;
