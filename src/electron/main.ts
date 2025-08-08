import { app, BrowserWindow, Menu } from "electron";
import { initialize, enable } from "@electron/remote/main/index.js";
import { waitForServer } from "./utils/server.js";
import { isDevMode } from "./utils/config.js";
import path from "path";
// import { fileURLToPath } from "url";

// Initialize IPC handlers
import "./ipc-handlers/directory.js";
import "./ipc-handlers/scan.js";
import "./ipc-handlers/quarantine.js";
import "./ipc-handlers/vulnerabilities.js";

// const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 600,
    minWidth: 1100, // Set minimum width
    minHeight: 600, // Set minimum height
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  if (process.platform === "darwin") {
    Menu.setApplicationMenu(null);
  }
  enable(win.webContents);

  if (isDevMode()) {
    await waitForServer("http://localhost:5123");
    win.loadURL("http://localhost:5123");
  } else {
    const indexPath = path.join(app.getAppPath(), "dist-react", "index.html");
    win.loadFile(indexPath);
  }

  return win;
}

initialize();
app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
