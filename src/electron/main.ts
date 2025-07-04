import { app, BrowserWindow } from "electron";
import path from "path";

app.on("ready", () => {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.loadFile(path.join(app.getAppPath(), "/dist-react/index.html"));

  mainWindow.webContents.openDevTools();
});
