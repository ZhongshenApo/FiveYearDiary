const fs = require('fs').promises;
const path = require('path');
const os = require('os');
const { parseMarkdownToJSON, generateJSONToMarkdown } = require('./parser');

// 模拟全局配置，设定起始年份
const START_YEAR = process.env.START_YEAR || 2026;

// 为了开源和通用性，我们动态处理数据存储路径
const IS_PACKAGED = process.env.NODE_ENV === 'production' || __dirname.includes('app.asar');

let DATA_DIR;
if (IS_PACKAGED) {
  // 打包后：存放在用户电脑的 "文稿(Documents)/FiveYearDiary_Data" 文件夹中
  // 这样既能让用户(包括您)在外面直观地看到和备份 md 文件，又不会因为硬编码路径导致别人的电脑报错
  DATA_DIR = path.join(os.homedir(), 'Documents', 'FiveYearDiary_Data');
} else {
  // 开发时：存放在项目根目录的 data 文件夹
  DATA_DIR = path.join(__dirname, '../data');
}

/**
 * 确保数据存储目录存在
 */
async function ensureDataDirExists() {
  try {
    await fs.access(DATA_DIR);
  } catch (error) {
    if (error.code === 'ENOENT') {
      await fs.mkdir(DATA_DIR, { recursive: true });
    } else {
      throw error;
    }
  }
}

/**
 * 根据日期获取日记数据
 * @param {string} dateString - 日期字符串，如 "05-01"
 * @returns {Promise<Object>} 返回包含 5 个年份数据的 JSON 对象
 */
async function getDiaryByDate(dateString) {
  await ensureDataDirExists();
  const filePath = path.join(DATA_DIR, `${dateString}.md`);

  try {
    // 尝试读取已存在的 Markdown 文件
    const markdownString = await fs.readFile(filePath, 'utf-8');
    // 解析并返回 JSON
    return parseMarkdownToJSON(markdownString, START_YEAR);
  } catch (error) {
    if (error.code === 'ENOENT') {
      // 文件不存在，利用 START_YEAR 初始化基础 Markdown 文本
      const initialMarkdown = generateJSONToMarkdown(dateString, {}, START_YEAR);
      // 写入本地文件系统
      await fs.writeFile(filePath, initialMarkdown, 'utf-8');
      // 返回解析后的初始 JSON 对象（全是空字符串）
      return parseMarkdownToJSON(initialMarkdown, START_YEAR);
    }
    throw error; // 其他读取错误抛出
  }
}

/**
 * 根据日期保存日记数据
 * @param {string} dateString - 日期字符串，如 "05-01"
 * @param {Object} jsonObject - 包含年份记录的 JSON 对象（前端传来的更新后数据）
 * @returns {Promise<void>}
 */
async function saveDiaryByDate(dateString, jsonObject) {
  await ensureDataDirExists();
  const filePath = path.join(DATA_DIR, `${dateString}.md`);
  
  // 将前端传来的 JSON 数据组装回 Markdown 文本
  const markdownString = generateJSONToMarkdown(dateString, jsonObject, START_YEAR);
  
  // 覆盖写入对应的 .md 文件
  await fs.writeFile(filePath, markdownString, 'utf-8');
}

module.exports = {
  getDiaryByDate,
  saveDiaryByDate,
  START_YEAR
};
