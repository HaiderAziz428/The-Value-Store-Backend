const express = require("express");

const config = require("../config");
const path = require("path");
const passport = require("passport");
const { fileRequest } = require("../services/file");

const router = express.Router();

router.get("/download", (req, res) => {
  const privateUrl = req.query.privateUrl;

  if (!privateUrl) {
    return res.sendStatus(404);
  }

  res.download(path.join(config.uploadDir, privateUrl));
});

router.post(
  "/upload/products/image",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    fileRequest("products/image", {
      entity: null,
      maxFileSize: 10 * 1024 * 1024,
      folderIncludesAuthenticationUid: false,
    })(req, res);
  }
);

// Add this route for product video uploads
router.post(
  "/upload/products/video",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    fileRequest("products/video", {
      entity: null,
      maxFileSize: 100 * 1024 * 1024, // allow larger size for videos
      folderIncludesAuthenticationUid: false,
    })(req, res);
  }
);

router.post("/upload/feedbacks/image", (req, res) => {
  req.feedback = true;
  fileRequest("feedbacks/image", {
    entity: null,
    maxFileSize: 10 * 1024 * 1024,
    folderIncludesAuthenticationUid: false,
  })(req, res);
});

router.post(
  "/upload/blogs/image",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    fileRequest("blogs/image", {
      entity: null,
      maxFileSize: 10 * 1024 * 1024,
      folderIncludesAuthenticationUid: false,
    })(req, res);
  }
);

router.post(
  "/upload/users/avatar",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    fileRequest("users/avatar", {
      entity: null,
      maxFileSize: 10 * 1024 * 1024,
      folderIncludesAuthenticationUid: false,
    })(req, res);
  }
);

module.exports = router;
