const express = require('express');
const router = express.Router();
const stepController = require('../controllers/stepController');
const imageProcessor = require('../utils/imageProcessor');
const multer = require('multer');
const upload = multer();

// 步骤管理
router.put('/:id/order', async (req, res) => {
  try {
    await stepController.reorderSteps(req.params.id, req.body.order);
    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取某个 SOP 的所有步骤
router.get('/:sopId', async (req, res) => {
  try {
    const steps = await stepController.getStepsBySopId(
      req.params.sopId,
    );
    res.status(200).json({steps});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 步骤插入（新建）
router.post('/:sopId/insert', upload.array('images') ,async (req, res) => {
  try {
    const { position, content } = req.body;
    let processedImages = [];

    // 如果有上传的图片，先处理图片
    if (req.files && req.files.length > 0) {
      processedImages = await Promise.all(
        req.files.map(file => imageProcessor.processImage(file))
      );
    }

    // 创建步骤（包含处理后的图片信息）
    const step = await stepController.insertStep(
      req.params.sopId,
      position,
      content,
      processedImages
    );

    res.status(201).json({
      step: step
    });

  } catch (error) {
    console.error('步骤创建失败:', error);
    res.status(500).json({
      error: '步骤创建失败',
      details: error.message
    });
  }
});

// 步骤删除
router.delete('/steps', async (req, res) => {
  try {
    const { stepIds } = req.body;
    const deletedCount = await stepController.deleteSteps(stepIds);

    if (deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "未找到指定的步骤进行删除",
        deletedCount: 0
      });
    }

    res.status(200).json({
      success: true,
      message: "步骤删除成功",
      deletedCount: deletedCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      message: "删除步骤时发生错误"
    });
  }
});

// 步骤复制
router.get('/:stepIds/duplicates', async (req, res) => {
  try {
    const stepIds = req.params.stepIds.split(',').map(id => id.trim());
    const steps = await stepController.duplicateSteps(stepIds);
    res.status(200).json({steps});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
 
// 批量粘贴
router.post('/paste', async (req, res) => {
  try {
    const { pasteCount, imageCount } = await stepController.pasteSteps(
      req.body.sopId,
      req.body.position,
      req.body.stepsData
    );
    res.status(201).json({
      success: true,
      message: "步骤粘贴成功",
      pasteCount: pasteCount,
      imageCount: imageCount
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


module.exports = router;
