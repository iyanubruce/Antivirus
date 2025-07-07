import { app, BrowserWindow } from "electron";
import { initialize, enable } from "@electron/remote/main/index.js";
import { waitForServer } from "./utils/server.js";
import { isDevMode } from "./utils/config.js";
import path from "path";
import { fileURLToPath } from "url";

// Initialize IPC handlers
import "./ipc-handlers/directory.js";
import "./ipc-handlers/scan.js";
import "./ipc-handlers/quarantine.js";
import "./ipc-handlers/vulnerabilities.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });
  enable(win.webContents);

  if (isDevMode()) {
    await waitForServer("http://localhost:5123");
    win.loadURL("http://localhost:5123");
  } else {
    win.loadFile(path.join(__dirname, "../../dist-react/index.html"));
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
