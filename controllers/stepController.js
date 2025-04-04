//controllers/stepController.js
const db = require('../utils/db');
const imageProcessor = require('../utils/imageProcessor');


// 重新排序步骤
exports.reorderSteps = async (sopId, newOrder) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // 1. 先查询出所有需要的数据
    const [steps] = await conn.query(
      'SELECT id, content, images FROM steps WHERE sop_id = ?',
      [sopId]
    );

    // 转换为map方便查找
    const stepMap = new Map();
    steps.forEach(step => stepMap.set(step.id, step));

    // 2. 验证所有newOrder中的id都存在
    const invalidIds = newOrder.filter(id => !stepMap.has(id));
    if (invalidIds.length > 0) {
      throw new Error(`无效的步骤ID: ${invalidIds.join(',')}`);
    }

    // 3. 删除旧数据
    await conn.query(
      'DELETE FROM steps WHERE sop_id = ?',
      [sopId]
    );

    // 4. 插入新排序的数据(使用参数化查询防止SQL注入)
    const insertValues = newOrder.map((stepId, index) => [
      sopId,
      stepMap.get(stepId).content,
      stepMap.get(stepId).images,
      index + 1
    ]);

    await conn.query(
      `INSERT INTO steps (sop_id, content, images, step_order)
       VALUES ?`,
      [insertValues]
    );

    await conn.commit();
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
};

// 通用事务执行方法
const withTransaction = async (operations) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const result = await operations(conn);
    await conn.commit();
    return result;
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
};

// 获取某个 SOP 的所有步骤
exports.getStepsBySopId = async (sopId) => {
  try {
    const [steps] = await db.query(
      `SELECT id, content, images, step_order 
       FROM steps 
       WHERE sop_id = ? 
       ORDER BY step_order ASC`,
      [sopId]
    );

    return steps;
  } catch (error) {
    console.error('Error fetching steps:', error);
    throw error;
  }
};


// 插入步骤(含新建)
exports.insertStep = async (sopId, position, content, images) => {
  return withTransaction(async (conn) => {
    // 调整后续步骤顺序
    await conn.query(
      `UPDATE steps 
       SET step_order = step_order + 1 
       WHERE sop_id = ? AND step_order >= ?`,
      [sopId, position]
    );

    // 插入新步骤
    const [result] = await conn.query(
      `INSERT INTO steps 
       (sop_id, content, images, step_order)
       VALUES (?, ?, ?, ?)`,
      [sopId, content, JSON.stringify(images), position]
    );

    //返回新建的步骤
    const [step] = await conn.query(
      `SELECT id, content, images, step_order 
       FROM steps 
       WHERE sop_id = ? AND step_order = ?`,
      [sopId, position]
    );

    return step;
  });
};



// 批量删除步骤
exports.deleteSteps = async (stepIds) => {
  return withTransaction(async (conn) => {
    // 验证输入是否为数组且不为空
    if (!Array.isArray(stepIds) || stepIds.length === 0) {
      throw new Error('请输入有效的步骤ID数组');
    }

    // 获取所有被删步骤的信息，包括图片路径
    const [steps] = await conn.query(
      `SELECT id, sop_id, step_order, images
       FROM steps 
       WHERE id IN (?) 
       ORDER BY sop_id, step_order`,
      [stepIds]
    );

    if (steps.length === 0) throw new Error('未找到任何要删除的步骤');
    if (steps.length !== stepIds.length) {
      const foundIds = steps.map(step => step.id);
      const notFound = stepIds.filter(id => !foundIds.includes(id));
      throw new Error(`以下步骤ID不存在: ${notFound.join(', ')}`);
    }

    // 收集所有将被删除的图片路径
    const imagePathsToDelete = steps.map(step =>
      step.images ? step.images.flatMap(image => [image.full, image.thumbnail]) : []
    ).flat();

    // 按SOP分组并记录每个SOP中要删除的步骤顺序
    const sopStepMap = {};
    steps.forEach(step => {
      if (!sopStepMap[step.sop_id]) {
        sopStepMap[step.sop_id] = [];
      }
      sopStepMap[step.sop_id].push(step.step_order);
    });

    // 批量删除操作
    const [result] = await conn.query(
      `DELETE FROM steps 
       WHERE id IN (?)`,
      [stepIds]
    );

    // 获取实际删除的行数
    const deletedCount = result.affectedRows;

    // 对每个受影响的SOP调整后续步骤顺序
    for (const sopId in sopStepMap) {
      const deletedOrders = sopStepMap[sopId];

      // 找到该SOP中最大的被删顺序号，只需更新比它大的顺序号
      const maxDeletedOrder = Math.max(...deletedOrders);

      // 计算需要减去的数量（比当前order小的已删数量）
      await conn.query(
        `UPDATE steps 
         SET step_order = step_order - (
           SELECT COUNT(*) 
           FROM (SELECT * FROM steps WHERE sop_id = ? AND step_order < steps.step_order AND id IN (?)) AS temp
         )
         WHERE sop_id = ? AND step_order > ?`,
        [sopId, stepIds, sopId, maxDeletedOrder]
      );
    }

    // 检查并删除不再被引用的图片文件
    if (imagePathsToDelete.length > 0) {
      for (const imagePath of imagePathsToDelete) {
        try {
          await imageProcessor.deleteImageFiles(imagePath);
        } catch (error) {
          console.error(`删除图片文件时出错: ${imagePath}`, error);
          // 继续处理其他图片，不中断整个操作
        }
      }
    }

    return deletedCount;
  });
};




// 复制多个步骤（含图片引用）
exports.duplicateSteps = async (stepIds) => {

  // 确保stepIds是数组
  if (!Array.isArray(stepIds)) {
    stepIds = [stepIds];
  }

  if (stepIds.length === 0) {
    throw new Error('没有提供要复制的步骤ID');
  }

  // 查询所有要复制的步骤
  const [steps] = await db.query(
    `SELECT id, sop_id, step_order, content, images 
     FROM steps 
     WHERE id IN (?) 
     ORDER BY step_order ASC`,
    [stepIds]
  );

  if (steps.length === 0) throw new Error('没有找到指定的步骤');

  const sopId = steps[0].sop_id;

  // 验证所有步骤是否属于同一个SOP
  if (!steps.every(step => step.sop_id === sopId)) {
    throw new Error('不能复制属于不同SOP的步骤');
  }


  const duplicatedSteps = [];

  // TODO:考虑使用事务来确保所有插入操作要么全部成功，要么全部失败

  for (const step of steps) {
    duplicatedSteps.push({
      content: step.content,
      images: step.images
    });
  }

  return duplicatedSteps;
};


// 批量粘贴步骤
exports.pasteSteps = async (sopId, position, stepsData) => {
  return withTransaction(async (conn) => {
    // Process each step's images to create copies first
    let successCount = 0;
    for (const step of stepsData) {
      if (step.images && step.images.length > 0) {
        // Create a deep copy of images array to modify it safely
        step.imagesCopyArray = JSON.parse(JSON.stringify(step.images));

        for (let i = 0; i < step.imagesCopyArray.length; i++) {
          try {
            const newImages = await imageProcessor.copyImageFiles(step.imagesCopyArray[i].full);
            step.imagesCopyArray[i] = newImages;
            successCount++;
          } catch (err) {
            console.error(`复制步骤图片失败 ${step.step_order}:`, err);
            throw err;
          }
        }
      }
    }
    // 首先查询现有的最大step_order
    const [maxOrderResult] = await conn.query(
      `SELECT MAX(step_order) as maxOrder FROM steps WHERE sop_id = ?`,
      [sopId]
    );
    const maxOrder = maxOrderResult[0]?.maxOrder || 0;

    // 确定实际要插入的位置 - 不能超过maxOrder+1
    const actualPosition = Math.min(position, maxOrder + 1);

    // 调整目标位置之后的步骤
    await conn.query(
      `UPDATE steps 
      SET step_order = step_order + ? 
      WHERE sop_id = ? 
      AND step_order >= ?`,
      [stepsData.length, sopId, actualPosition]
    );

    // 批量插入新步骤
    const values = stepsData.map((step, index) => [
      sopId,
      step.content || '', // 确保内容不为undefined
      JSON.stringify(step.imagesCopyArray || []), // 确保总是有有效的JSON数组
      actualPosition + index
    ]);

    // 使用参数化查询
    const placeholders = stepsData.map(() => '(?, ?, ?, ?)').join(',');
    const flattenedValues = values.flat();

    const result = await conn.query(
      `INSERT INTO steps (sop_id, content, images, step_order)
      VALUES ${placeholders}`,
      flattenedValues
    );


    return { pasteCount: result.affectedRows, imageCount: successCount }
  });
};
