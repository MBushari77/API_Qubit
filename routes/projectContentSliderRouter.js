const express = require("express");
const db = require("../conf/db");

const router = express.Router();

// CREATE
router.post("/add", (req, res) => {
  const { icon, link, title, info } = req.body;

  const sql = `
    INSERT INTO project_content (icon, link, title, info)
    VALUES (?, ?, ?, ?)
  `;

  db.query(sql, [icon, link, title, info], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({
      success: true,
      message: "Home Content Slider added successfully",
      id: result.insertId,
    });
  });
});

// READ ALL
router.get("/", (req, res) => {
  db.query("SELECT * FROM project_content", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, sliders: results });
  });
});

// READ ONE
router.get("/:id", (req, res) => {
  const { id } = req.params;
  db.query(
    "SELECT * FROM project_content WHERE id = ?",
    [id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      if (result.length === 0)
        return res
          .status(404)
          .json({ success: false, message: "Item not found" });
      res.json({ success: true, slider: result[0] });
    }
  );
});

// UPDATE
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { icon, link, title, info } = req.body;

  const sql = `
    UPDATE project_content
    SET icon = ?, link = ?, title = ?, info = ?
    WHERE id = ?
  `;

  db.query(sql, [icon, link, title, info, id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({
      success: true,
      message: "Home Content Slider updated successfully",
    });
  });
});

// DELETE
router.delete("/:id", (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM project_content WHERE id = ?", [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({
      success: true,
      message: "Home Content Slider deleted successfully",
    });
  });
});

module.exports = router;
