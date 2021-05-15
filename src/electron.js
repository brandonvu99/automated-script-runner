const { app, BrowserWindow, ipcMain, Menu, nativeImage, Tray } = require('electron');
const path = require('path');
const url = require('url');
const spawn = require("child_process").spawn;
const fs = require('fs');


class TrayMenu {
    // Create a variable to store our tray
    // Public: Make it accessible outside of the class;
    // Readonly: Value can't be changed
    tray;

    // Path where should we fetch our icon;
    iconPath = '/assets/clock-icon.png';

    constructor() {
        this.tray = new Tray(this.createNativeImage());
        // We need to set the context menu to our tray
        this.tray.setContextMenu(this.createMenu());
    }

    createNativeImage() {
        // Since we never know where the app is installed,
        // we need to add the app base path to it.
        const path = `${app.getAppPath()}${this.iconPath}`;
        const image = nativeImage.createFromPath(path);
        // Marks the image as a template image.
        image.setTemplateImage(true);
        return image;
    }

    createMenu() {
        // This method will create the Menu for the tray
        const contextMenu = Menu.buildFromTemplate([{
                label: 'Tokei',
                type: 'normal',
                click: () => {
                    /* Later this will open the Main Window */
                }
            },
            {
                label: 'Quit',
                type: 'normal',
                click: () => app.quit()
            }
        ]);
        return contextMenu;
    }
}

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
const appElements = {
    tray: null,
    windows: []
};

app.on('ready', () => {
    appElements.tray = new TrayMenu();
});
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

ipcMain.on("shell command", (event, commandWorkingDirectory, commandToRun) => {
    console.log(`commandWorkingDirectory: ${commandWorkingDirectory}\ncommandToRun: ${commandToRun}`);
    let command = spawn(commandToRun, { shell: true, cwd: commandWorkingDirectory });

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


// ref: http://stackoverflow.com/a/1293163/2343
// This will parse a delimited string into an array of
// arrays. The default delimiter is the comma, but this
// can be overriden in the second argument.
function CSVToArray(strData, strDelimiter) {
    // Check to see if the delimiter is defined. If not,
    // then default to comma.
    strDelimiter = (strDelimiter || ",");

    // Create a regular expression to parse the CSV values.
    var objPattern = new RegExp(
        (
            // Delimiters.
            "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +

            // Quoted fields.
            "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +

            // Standard fields.
            "([^\"\\" + strDelimiter + "\\r\\n]*))"
        ),
        "gi"
    );


    // Create an array to hold our data. Give the array
    // a default empty first row.
    var arrData = [
        []
    ];

    // Create an array to hold our individual pattern
    // matching groups.
    var arrMatches = null;


    // Keep looping over the regular expression matches
    // until we can no longer find a match.
    while (arrMatches = objPattern.exec(strData)) {

        // Get the delimiter that was found.
        var strMatchedDelimiter = arrMatches[1];

        // Check to see if the given delimiter has a length
        // (is not the start of string) and if it matches
        // field delimiter. If id does not, then we know
        // that this delimiter is a row delimiter.
        if (
            strMatchedDelimiter.length &&
            strMatchedDelimiter !== strDelimiter
        ) {

            // Since we have reached a new row of data,
            // add an empty row to our data array.
            arrData.push([]);

        }

        var strMatchedValue;

        // Now that we have our delimiter out of the way,
        // let's check to see which kind of value we
        // captured (quoted or unquoted).
        if (arrMatches[2]) {

            // We found a quoted value. When we capture
            // this value, unescape any double quotes.
            strMatchedValue = arrMatches[2].replace(
                new RegExp("\"\"", "g"),
                "\""
            );

        } else {

            // We found a non-quoted value.
            strMatchedValue = arrMatches[3];

        }


        // Now that we have our value string, let's add
        // it to the data array.
        arrData[arrData.length - 1].push(strMatchedValue);
    }

    // Return the parsed data.
    return (arrData);
}

let csv_data = CSVToArray(fs.readFileSync('./sample_data.csv', { encoding: 'utf8' }), ",")
ipcMain.on("csv data", (event, args) => {
    event.reply("csv data response", csv_data);
});