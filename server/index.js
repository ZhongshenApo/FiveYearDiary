// 设置环境标识
process.env.NODE_ENV = __dirname.includes('app.asar') ? 'production' : 'development';

const express = require('express');
const cors = require('cors');
const { getDiaryByDate, saveDiaryByDate, START_YEAR } = require('./api');

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors()); // 允许前端跨域请求
app.use(express.json()); // 解析 JSON 格式的请求体

// --- 路由 ---

/**
 * GET /api/config
 * 获取全局配置（前端需要知道起始年份以渲染卡片）
 */
app.get('/api/config', (req, res) => {
  res.json({ startYear: START_YEAR });
});

/**
 * GET /api/diary/:date
 * 获取指定日期的日记数据
 * @param date - 格式应为 MM-DD，如 "05-01"
 */
app.get('/api/diary/:date', async (req, res) => {
  const { date } = req.params;
  
  // 简单的日期格式校验
  if (!/^\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({ error: 'Invalid date format. Use MM-DD.' });
  }

  try {
    const data = await getDiaryByDate(date);
    res.json(data);
  } catch (error) {
    console.error(`Error reading diary for ${date}:`, error);
    res.status(500).json({ error: 'Failed to read diary.' });
  }
});

/**
 * POST /api/diary/:date
 * 保存指定日期的日记数据
 * @param date - 格式应为 MM-DD
 * @body - 包含年份和内容的 JSON 对象
 */
app.post('/api/diary/:date', async (req, res) => {
  const { date } = req.params;
  const jsonObject = req.body;

  if (!/^\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({ error: 'Invalid date format. Use MM-DD.' });
  }

  try {
    await saveDiaryByDate(date, jsonObject);
    res.json({ success: true, message: 'Diary saved successfully.' });
  } catch (error) {
    console.error(`Error saving diary for ${date}:`, error);
    res.status(500).json({ error: 'Failed to save diary.' });
  }
});

// 启动服务
// 在 Electron 打包后，可能不需要固定占用一个公共端口，但为了极简，我们这里仍使用 Express
const server = app.listen(PORT, () => {
  console.log(`Local Diary Server is running on http://localhost:${PORT}`);
  console.log(`Diary START_YEAR is set to ${START_YEAR}`);
});

module.exports = app;
