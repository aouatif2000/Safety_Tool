const express = require("express");
const router = express.Router();
const documentTypes = require("../config/documentTypes");

// GET all document types grouped by category
router.get("/", (req, res) => {
  res.json(documentTypes);
});

module.exports = router;
