const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const url = require('url');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;

const createWindow = () => {
    // set timeout to render the window not until the Angular 
    // compiler is ready to show the project
    setTimeout(() => {
        // Create the browser window.
        win = new BrowserWindow({
            width: 800,
            height: 600,
            icon: './src/favicon.ico',
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false
            }
        });

        // and load the app.
        win.loadURL(url.format({
            pathname: 'localhost:4200',
            protocol: 'http:',
            slashes: true
        }));

        win.webContents.openDevTools();

        // Emitted when the window is closed.
        win.on('closed', () => {
            // Dereference the window object, usually you would store windows
            // in an array if your app supports multi windows, this is the time
            // when you should delete the corresponding element.
            win = null;
        });
    }, 10000);
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
        createWindow();
    }
});

let spawn = require("child_process").spawn;

ipcMain.on("pinger", (event, messageFromAngular) => {
    console.log("[electron] pong", messageFromAngular);
    let command = spawn("ping", [
        "127.0.0.1"
    ]);

    command.stdout.on("data", (data) => {
        console.log(`handle data ${data}`)
    });

    command.stderr.on("data", (data) => {
        console.log(`handle error ${err}`)
    });

    command.on("exit", (code) => {
        console.log("handle exit")
    });
})

ipcMain.on("shell command", (event, commandToRun) => {
    console.log("messageFromAngular: ", commandToRun);
    let command = spawn(commandToRun, { shell: true });

    command.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
    });

    command.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    });

    command.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
    });
})