//utils/imageProcessor.js
const sharp = require('sharp');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs').promises;

exports.processImage = async (file) => {
  const filename = `${uuidv4()}${path.extname(file.originalname)}`;
  const fullPath = path.join(__dirname, '../uploads/full', filename);
  const thumbPath = path.join(__dirname, '../uploads/thumbnail', filename);

  // 保存原始图片
  await sharp(file.buffer).toFile(fullPath);
  
  // 生成缩略图（300x300自动裁剪）
  await sharp(file.buffer)
    .resize(300, 300, { fit: 'cover' })
    .toFile(thumbPath);

  return { 
    full: `/uploads/full/${filename}`, 
    thumbnail: `/uploads/thumbnail/${filename}` 
  };
};

/**
 * 删除单个图片文件（原始图或缩略图）
 * @param {string} filePath - 要删除的图片文件路径（可以是原图或缩略图路径）
 * @returns {Promise<void>}
 * @throws {Error} 当删除过程中发生非"文件不存在"错误时抛出
 */
exports.deleteImageFiles = async (filePath) => {
  try {
    // 直接使用传入的路径进行删除
    await fs.unlink('.'+filePath).catch(err => {
      if (err.code !== 'ENOENT') throw err;
    });

  } catch (err) {
    console.error('Error deleting image files:', err);
    throw err;
  }
};

/**
 * 复制图片文件（原始图和缩略图）
 * @param {string} originalPath - 原始图片路径（可以是原图或缩略图路径）
 * @returns {Promise<{full: string, thumbnail: string}>} - 返回新图片的路径对象
 */
exports.copyImageFiles = async (originalPath) => {
  try {
    // 从路径中提取文件名
    const filename = path.basename(originalPath);
    const newFilename = `${uuidv4()}${path.extname(filename)}`;

    const oldFullPath = path.join(__dirname, '../uploads/full', filename);
    const oldThumbPath = path.join(__dirname, '../uploads/thumbnail', filename);

    const newFullPath = path.join(__dirname, '../uploads/full', newFilename);
    const newThumbPath = path.join(__dirname, '../uploads/thumbnail', newFilename);

    // 复制原图和缩略图
    await Promise.all([
      fs.copyFile(oldFullPath, newFullPath),
      fs.copyFile(oldThumbPath, newThumbPath)
    ]);
    console.log("newFilename:",newFilename)
    return {
      full: `/uploads/full/${newFilename}`,
      thumbnail: `/uploads/thumbnail/${newFilename}`
    };

  } catch (err) {
    console.error('Error copying image files:', err);
    throw err;
  }
};
