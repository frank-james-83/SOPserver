const express = require('express');
const router = express.Router();
const sopController = require('../controllers/sopController');
const stepController = require('../controllers/stepController');
const imageProcessor = require('../utils/imageProcessor');
const multer = require('multer');
const upload = multer();

// 创建新SOP版本
router.post('/createSOP', async (req, res) => {
  try {
    const { title, operator } = req.body;
    const sop = await sopController.createSOPVersion(title, operator);
    res.status(201).json(sop);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取版本列表
router.get('/:title/versions', async (req, res) => {
  try {
    const versions = await sopController.getSOPVersions(req.params.title);
    res.json(versions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



module.exports = router;
