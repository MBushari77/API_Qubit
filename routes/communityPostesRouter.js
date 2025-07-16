const express = require("express");
const db = require("../conf/db");

const router = express.Router();

// CREATE Post
router.post("/posts", (req, res) => {
  const { author_name, content } = req.body;

  if (!author_name || !content) {
    return res
      .status(400)
      .json({ error: "Author name and content are required." });
  }

  const query = `
    INSERT INTO community_posts (author_name, content)
    VALUES (?, ?)
  `;
  db.query(query, [author_name, content], (err, result) => {
    if (err) return res.status(500).json({ error: err.sqlMessage || err });
    res.json({
      message: "Post created",
      id: result.insertId,
      author_name,
      content,
    });
  });
});

// READ All Posts with Comments
router.get("/posts", (req, res) => {
  db.query("SELECT * FROM community_posts", async (err, postsResult) => {
    if (err) return res.status(500).json({ error: err.sqlMessage || err });

    const posts = postsResult;

    // Fetch comments for each post
    const getComments = (postId) =>
      new Promise((resolve, reject) => {
        db.query(
          "SELECT * FROM community_comments WHERE post_id = ?",
          [postId],
          (err, commentsResult) => {
            if (err) return reject(err);
            resolve(commentsResult);
          }
        );
      });

    try {
      for (let post of posts) {
        post.comments = await getComments(post.id);
      }
      res.json(posts);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch comments." });
    }
  });
});

// ADD Comment to Post
router.post("/posts/:postId/comments", (req, res) => {
  const { postId } = req.params;
  const { commenter_name, text } = req.body;

  if (!commenter_name || !text) {
    return res
      .status(400)
      .json({ error: "Commenter name and text are required." });
  }

  const query = `
    INSERT INTO community_comments (post_id, commenter_name, text)
    VALUES (?, ?, ?)
  `;
  db.query(query, [postId, commenter_name, text], (err, result) => {
    if (err) return res.status(500).json({ error: err.sqlMessage || err });
    res.json({
      message: "Comment added",
      id: result.insertId,
      post_id: postId,
      commenter_name,
      text,
    });
  });
});

// DELETE Post
router.delete("/posts/:id", (req, res) => {
  db.query(
    "DELETE FROM community_posts WHERE id = ?",
    [req.params.id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.sqlMessage || err });
      if (result.affectedRows === 0)
        return res.status(404).json({ error: "Post not found" });
      res.json({ message: "Post deleted" });
    }
  );
});

// DELETE Comment
router.delete("/comments/:id", (req, res) => {
  db.query(
    "DELETE FROM community_comments WHERE id = ?",
    [req.params.id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.sqlMessage || err });
      if (result.affectedRows === 0)
        return res.status(404).json({ error: "Comment not found" });
      res.json({ message: "Comment deleted" });
    }
  );
});

module.exports = router;
