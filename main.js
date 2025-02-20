const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
let mainWindow;
let backendProcess;

function startBackend() {
    // Start the Docker containers
    const dockerProcess = spawn('docker', ['compose', 'up', '-d']);

    dockerProcess.on('close', (code) => {
        if (code !== 0) {
            console.error('Failed to start Docker containers');
        }
    });
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    // Wait for Docker containers to start
    setTimeout(() => {
        mainWindow.loadURL('http://localhost:3000');
    }, 10000);

    mainWindow.on('closed', function () {
        mainWindow = null;
    });
}

app.on('ready', () => {
    startBackend();
    createWindow();
});

app.on('window-all-closed', function () {
    // Stop Docker containers
    const dockerDown = spawn('docker', ['compose', 'down']);

    dockerDown.on('close', () => {
        if (process.platform !== 'darwin') {
            app.quit();
        }
    });
}); 