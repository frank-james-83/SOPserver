// workOrderController.js
const db = require('../utils/db');

async function saveWorkOrder(workOrder) {
  const {
    alarm_id,
    device_id,
    repairer_id,
    priority,
    status
  } = workOrder;

  // SQL 插入语句
  const sql = `
        INSERT INTO work_orders (alarm_id, device_id, repairer_id, priority, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, NOW(), NOW())
    `;

  try {
    // 执行 SQL 插入
    const [result] = await db.execute(sql, [alarm_id, device_id, repairer_id, priority, status]);
    console.log('Work order saved:', result.insertId);
    return result.insertId; // 返回新插入的工单ID
  } catch (error) {
    console.error('Error saving work order:', error);
    throw error;
  }
}

const getAllWorkOrders = async () => {
  try {
    const sql = `
    SELECT 
        wo.id,
        wo.status,
        wo.priority,
        wo.created_at,
        wo.updated_at,
        a.alarm_type,
        a.timestamp as alarm_time,
        d.name as device_name,
        u.username as repairer_name,
        rr.result as repair_result
    FROM work_orders wo
    LEFT JOIN alarms a ON wo.alarm_id = a.id
    LEFT JOIN devices d ON wo.device_id = d.id
    LEFT JOIN users u ON wo.repairer_id = u.id
    LEFT JOIN repair_records rr ON wo.id = rr.work_order_id
    ORDER BY wo.created_at DESC
`;

    const [results] = await db.execute(sql);

    return results;


  } catch (error) {
    console.error('获取工单列表失败:', error);
    throw new Error('获取工单列表失败');
  }
};


module.exports = {
  saveWorkOrder,
  getAllWorkOrders
};