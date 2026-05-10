/**
 * 将 Markdown 字符串解析为包含 5 个固定年份的 JSON 对象
 * @param {string} markdownString - 读取到的 Markdown 文本内容
 * @param {number|string} startYear - 全局配置的起始年份
 * @returns {Object} 包含 5 个年份键值的对象
 */
function parseMarkdownToJSON(markdownString, startYear) {
  const result = {};
  const year = parseInt(startYear, 10);
  
  // 1. 初始化 5 个固定年份（即使没有数据也保证有这 5 个 key）
  for (let i = 0; i < 5; i++) {
    result[year + i] = "";
  }

  if (!markdownString || typeof markdownString !== 'string') {
    return result;
  }

  // 2. 使用正则提取每个年份标题下的内容
  // 匹配 "## YYYY" 后面的所有内容，直到遇到下一个 "## " 或字符串结尾
  const regex = /(?:^|\r?\n)##\s+(\d{4})[ \t]*\r?\n([\s\S]*?)(?=\r?\n##\s+|$)/g;
  let match;

  while ((match = regex.exec(markdownString)) !== null) {
    const currentYear = parseInt(match[1], 10);
    // 仅处理属于固定窗口期内的年份数据
    if (currentYear >= year && currentYear < year + 5) {
      // 移除读取时的行尾空格（避免前端 textarea 出现多余的 Markdown 硬换行空格）
      const rawContent = match[2].trim();
      result[currentYear] = rawContent.split('\n').map(line => line.trimEnd()).join('\n');
    }
  }

  return result;
}

/**
 * 将 JSON 对象组装回包含 5 个固定年份标题的 Markdown 文本
 * @param {string} dateString - 日期字符串，例如 "05-01"
 * @param {Object} jsonObject - 包含年份记录的对象（可能为空）
 * @param {number|string} startYear - 全局配置的起始年份
 * @returns {string} 组装好的 Markdown 文本
 */
function generateJSONToMarkdown(dateString, jsonObject, startYear) {
  const year = parseInt(startYear, 10);
  const safeJsonObject = jsonObject || {};
  
  // 1. 写入一级标题（日期）
  let markdown = `# ${dateString}\n`;

  // 2. 按顺序遍历并写入 5 个固定的年份
  for (let i = 0; i < 5; i++) {
    const currentYear = year + i;
    let content = safeJsonObject[currentYear] ? safeJsonObject[currentYear].trim() : "";

    // 自动为每一行末尾添加两个空格，实现 Markdown 的硬换行 (Hard Line Break)
    if (content) {
      content = content.split('\n').map(line => line.trimEnd() + '  ').join('\n');
    }

    markdown += `\n## ${currentYear}\n`;
    if (content) {
      markdown += `${content}\n`;
    }
  }

  // 保证文件末尾有一个空行，符合 Markdown 规范
  return markdown + "\n";
}

module.exports = {
  parseMarkdownToJSON,
  generateJSONToMarkdown
};
