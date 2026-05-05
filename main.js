const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

// 启动内嵌的 Express 服务
require('./server/index.js');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // 判断是否为开发环境
  const isDev = !app.isPackaged;

  if (isDev) {
    // 开发环境下加载 Vite 本地服务器
    mainWindow.loadURL('http://localhost:5173');
    // mainWindow.webContents.openDevTools();
  } else {
    // 生产环境下加载打包后的前端文件
    mainWindow.loadFile(path.join(__dirname, 'client/dist/index.html'));
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});
