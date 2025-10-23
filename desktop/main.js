const { app, BrowserWindow, protocol, shell, Menu, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const log = require('electron-log');
const { autoUpdater } = require('electron-updater');

// Enable logging
log.transports.file.level = 'info';
log.info('Application starting...');

// Load client configuration (T020)
let clientConfig = null;
const clientConfigPath = path.join(__dirname, 'client-config.json');

try {
  if (fs.existsSync(clientConfigPath)) {
    const configData = fs.readFileSync(clientConfigPath, 'utf8');
    clientConfig = JSON.parse(configData);
    log.info(`Loaded client configuration for: ${clientConfig.clientId}`);
    log.info(`Client version: ${clientConfig.version.client}, Core version: ${clientConfig.version.core}`);
  } else {
    log.warn('No client configuration found, using defaults');
    // Fallback to default configuration
    clientConfig = {
      clientId: 'default',
      displayName: 'FMA Skeckit',
      branding: {
        appName: 'FMA Skeckit App',
        primaryColor: '#1E3A8A',
        secondaryColor: '#3B82F6'
      },
      features: {},
      version: {
        client: '1.0.0',
        core: '1.0.0'
      }
    };
  }
} catch (error) {
  log.error('Error loading client configuration:', error);
  // Use default config on error
  clientConfig = {
    clientId: 'default',
    displayName: 'FMA Skeckit',
    branding: {
      appName: 'FMA Skeckit App',
      primaryColor: '#1E3A8A',
      secondaryColor: '#3B82F6'
    },
    features: {},
    version: {
      client: '1.0.0',
      core: '1.0.0'
    }
  };
}

// Make config globally accessible
global.clientConfig = clientConfig;

let mainWindow;

// Create macOS menu bar (T025)
function createMenu() {
  if (process.platform !== 'darwin') {
    return; // Only create menu on macOS
  }

  const template = [
    {
      label: clientConfig.branding.appName || app.name,
      submenu: [
        {
          label: `About ${clientConfig.branding.appName || app.name}`,
          click: () => {
            dialog.showMessageBox({
              type: 'info',
              title: `About ${clientConfig.branding.appName}`,
              message: clientConfig.branding.appName,
              detail: `Client: ${clientConfig.displayName}\nClient ID: ${clientConfig.clientId}\nClient Version: ${clientConfig.version.client}\nCore Version: ${clientConfig.version.core}\n\n© ${new Date().getFullYear()} FMA Team`
            });
          }
        },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'delete' },
        { role: 'selectAll' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        { type: 'separator' },
        { role: 'front' },
        { type: 'separator' },
        { role: 'window' }
      ]
    },
    {
      role: 'help',
      submenu: [
        {
          label: 'Learn More',
          click: async () => {
            await shell.openExternal('https://github.com');
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

function createWindow() {
  // Use client-specific title (T021)
  const windowTitle = clientConfig.branding.appName || 'FMA Skeckit App';

  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    title: windowTitle,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    },
    icon: path.join(__dirname, 'icons', 'icon.png'),
    show: false
  });

  // Load production build from dist/
  const distPath = path.join(__dirname, '..', 'dist', 'index.html');
  mainWindow.loadFile(distPath);

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    log.info('Window displayed');
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
    log.info('Window closed');
  });
}

// App lifecycle management
app.whenReady().then(() => {
  log.info('App ready, creating menu and window...');
  createMenu(); // Create macOS menu bar first
  createWindow();

  // Check for updates after window is created (T033)
  setTimeout(() => {
    checkForUpdates();
  }, 3000); // Wait 3 seconds after launch to check for updates
});

// macOS: Re-create window when dock icon is clicked and no windows are open
app.on('activate', () => {
  log.info('App activated');
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Quit when all windows are closed (except on macOS)
app.on('window-all-closed', () => {
  log.info('All windows closed');
  if (process.platform !== 'darwin') {
    log.info('Quitting application (non-macOS)');
    app.quit();
  }
});

app.on('quit', () => {
  log.info('Application quit');
});

// Deep linking support (T012-T014)
// Register custom protocol handler
if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient('fmaskeckit', process.execPath, [path.resolve(process.argv[1])]);
  }
} else {
  app.setAsDefaultProtocolClient('fmaskeckit');
}

// Handle deep link URLs
const handleDeepLink = (url) => {
  log.info(`Deep link received: ${url}`);
  if (mainWindow) {
    // Send URL to renderer process via IPC
    mainWindow.webContents.send('deeplink', url);

    // Bring window to front
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
};

// macOS: Handle open-url event
app.on('open-url', (event, url) => {
  event.preventDefault();
  handleDeepLink(url);
});

// Windows/Linux: Handle second-instance event
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  log.info('Another instance is already running, quitting...');
  app.quit();
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    // Someone tried to run a second instance, focus our window instead
    log.info('Second instance detected');

    // On Windows/Linux, the deep link URL is in commandLine
    const url = commandLine.find(arg => arg.startsWith('fmaskeckit://'));
    if (url) {
      handleDeepLink(url);
    }

    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

// Auto-Update Configuration (T032-T035)
// Configure electron-updater logging
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';

// Auto-update event handlers
autoUpdater.on('checking-for-update', () => {
  log.info('Checking for updates...');
});

autoUpdater.on('update-available', (info) => {
  log.info('Update available:', info.version);
});

autoUpdater.on('update-not-available', (info) => {
  log.info('Update not available:', info.version);
});

autoUpdater.on('error', (err) => {
  log.error('Error in auto-updater:', err);
});

autoUpdater.on('download-progress', (progressObj) => {
  let log_message = 'Download speed: ' + progressObj.bytesPerSecond;
  log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
  log_message = log_message + ' (' + progressObj.transferred + '/' + progressObj.total + ')';
  log.info(log_message);

  // Send progress to renderer if window exists
  if (mainWindow) {
    mainWindow.webContents.send('update-progress', {
      percent: Math.round(progressObj.percent),
      transferred: progressObj.transferred,
      total: progressObj.total
    });
  }
});

autoUpdater.on('update-downloaded', (info) => {
  log.info('Update downloaded:', info.version);

  // Show dialog to user
  const dialogOpts = {
    type: 'info',
    buttons: ['Restart Now', 'Later'],
    title: 'Application Update',
    message: `A new version (${info.version}) has been downloaded.`,
    detail: 'The application will restart to apply the update. Click "Restart Now" to update immediately, or "Later" to update on next restart.'
  };

  dialog.showMessageBox(dialogOpts).then((returnValue) => {
    if (returnValue.response === 0) {
      // User clicked "Restart Now"
      log.info('User chose to install update immediately');
      setImmediate(() => autoUpdater.quitAndInstall());
    } else {
      // User clicked "Later"
      log.info('User chose to install update later');
    }
  });
});

// Function to check for updates
function checkForUpdates() {
  // Only check for updates in production builds
  if (process.env.NODE_ENV !== 'development' && !process.mas) {
    log.info('Checking for updates...');
    autoUpdater.checkForUpdates();
  } else {
    log.info('Auto-update disabled in development mode');
  }
}
