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
import { exec, ExecException } from "child_process";

// const __dirname = path.dirname(fileURLToPath(import.meta.url));
let mainWindow: BrowserWindow | null = null;

function isSuspiciousConnection(line: string): boolean {
  const knownGoodPorts = [80, 443, 53];
  const maliciousDomains = ["malicious.com", "192.168.1.100"]; // Expand with threat intel later

  // Extract PID, IP, port (parsing logic depends on OS)
  if (line.includes(":4444") || line.includes("198.51.100.")) {
    return true;
  }
  return false;
}
function getActiveConnections() {
  if (!mainWindow) return;

  const command =
    process.platform === "win32"
      ? "netstat -ano"
      : "lsof -i -P -n | grep ESTABLISHED";

  interface ExecCallback {
    (error: ExecException | null, stdout: string, stderr: string): void;
  }

  exec(
    command,
    (error: ExecException | null, stdout: string, stderr: string) => {
      if (error || stderr) return;

      stdout.split("\n").forEach((line: string) => {
        if (isSuspiciousConnection(line)) {
          mainWindow?.webContents.send(
            "security-alert",
            `Suspicious connection: ${line.trim()}`
          );
        }
      });
    }
  );
}

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
