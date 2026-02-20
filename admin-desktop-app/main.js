const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');
const fs = require('fs');

function createWindow() {
    const isPackaged = app.isPackaged;
    const baseDir = isPackaged
        ? path.join(process.resourcesPath, 'admin-panel-copy')
        : path.join(__dirname, 'admin-panel-copy');

    const win = new BrowserWindow({
        width: 1280,
        height: 800,
        title: "ChillyAdmin Pro - Enterprise Dashboard",
        icon: path.join(__dirname, 'assets-copy/icon.png'),
        backgroundColor: '#0f172a',
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    Menu.setApplicationMenu(null);
    win.maximize();

    const indexPath = path.join(baseDir, 'index.html');
    win.loadFile(indexPath);

    win.webContents.on('did-fail-load', (e, code, desc) => {
        console.error('Failed to load:', code, desc);
    });

    win.webContents.on('did-finish-load', () => {
        const configPath = isPackaged
            ? path.join(process.resourcesPath, 'config.json')
            : path.join(__dirname, 'config.json');

        if (fs.existsSync(configPath)) {
            const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            const injectScript = `
                localStorage.setItem('CHILLY_PROD_URL', '${config.SERVER_URL}');
                if (typeof API_BASE !== 'undefined') {
                    API_BASE = '${config.SERVER_URL}/api';
                }
            `;
            win.webContents.executeJavaScript(injectScript);
        }
    });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
