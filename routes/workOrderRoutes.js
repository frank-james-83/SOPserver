// routes/workOrderRoutes.js
const express = require('express');
const router = express.Router();
const workOrderController = require('../controllers/workOrderController');

router.post('/api/add-work-order', async (req, res) => {
  try {

    const fakeFront = {
      "alarm_id": 1,
      "device_id": 101,
      "repairer_id": 201,
      "priority": "high",
      "status": "pending"
    }
    const workOrder = fakeFront;

    // 创建维修工单
    // const workOrder = req.body;
    const workOrderId = await workOrderController.saveWorkOrder(workOrder);
    res.status(201).json({
      message: 'Work order created',
      id: workOrderId
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to create work order',
      error: error.message
    });
  }
});

router.get('/api/work-order', async (req, res) => {
  //获取当前所有work-order
  try {
    const workOrders = await workOrderController.getAllWorkOrders();
    res.status(200).json({
      message: 'Work orders retrieved successfully',
      data: workOrders
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch work orders',
      error: error.message
    });
  }
});

module.exports = router;