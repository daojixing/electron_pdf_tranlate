const electron = require('electron');
const fspath = require('path');
const app = electron.app;
const request = require('request');
const fs = require('fs');

const shell = electron.shell;
const Menu = electron.Menu;
const Tray = electron.Tray;
const dialog = electron.dialog;
const ipcMain = electron.ipcMain;

const BrowserWindow = electron.BrowserWindow;

const options = {extraHeaders: 'pragma: no-cache\n'}
// const app_icon = nativeImage.createFromPath(fspath.join(__dirname, 'icon.ico'));
const path = require('path');
const app_icon = fspath.join(__dirname, 'icon.png')
const singleInstanceLock = app.requestSingleInstanceLock();
let mainWindow = null;
let go_on = true;
let watcherId = null;
let appIcon = null;
var contextMenu = null;
var filepath = null;

// var quitapp, URL;

function sleep(millis) {
    var date = new Date();
    var curDate = null;
    do {
        curDate = new Date();
    }
    while (curDate - date < millis);
}
// const {google } = require('translation.js');

// crashReporter.start({
//     productName: 'Electron PDF Viewer',
//     companyName: 'Praharsh',
//     submitURL: 'https://praharsh.xyz/projects/PDFViewer/crash',
//     autoSubmit: false
// });
//creating menus for menu bar
const template = [{
    label: '文件',
    submenu: [{
        label: '打开',
        accelerator: 'CmdOrCtrl+O',
        click: function (item, focusedWindow) {
            if (focusedWindow) {
                dialog.showOpenDialog({
                    filters: [
                        {name: 'PDF', extensions: ['pdf']}
                    ],
                    properties: ['openFile']
                }, function (path) {
                    if (path) {
                        filepath = path;
                        if (path.constructor === Array)
                            path = path[0];
                        mainWindow.loadURL('file://' + __dirname + '/pdfviewer/web/viewer.html?file=' + encodeURIComponent(path), options);
                    }
                });
            }
        }
    },

        {
            label: '打印',
            accelerator: 'CmdOrCtrl+P',
            click: function (item, focusedWindow) {
                if (focusedWindow) focusedWindow.webContents.print();
            }
        },
        {
            label: '关闭',
            accelerator: 'Shift+CmdOrCtrl+Z',
            click: function (item, focusedWindow) {
                if (focusedWindow) focusedWindow.loadURL('file://' + __dirname + '/default.html', options);
            }
        },
        {
            label: '翻译', type: 'checkbox', checked: true, click: (menuItem) => {
                go_on = go_on ? false : true;
                console.log(go_on);
            }
        },
        {
            label: '调试',
            accelerator: 'F12',
            click: function () {
                mainWindow.webContents.openDevTools();
            }
        },
        {
            type: 'separator'
        },
        {
            label: '退出',
            accelerator: 'Alt+F4',
            // role: 'close',
            click: (menuItem) => {
                console.log("exit")
                watcherId = null;
                if (mainWindow) {
                    mainWindow.webContents.clearHistory();
                    mainWindow.webContents.session.clearCache(function () {
                        mainWindow.destroy();
                    });
                }

            }
        },
    ]
},
];
var menu = Menu.buildFromTemplate(template);
if (!singleInstanceLock) {
    app.quit();
    return;
} else {
    app.on('second-instance', (event, commandLine, workingDirectory) => {
        // Someone tried to run a second instance, we should focus our window.
        // console.log(commandLine[1])
        // console.log(process.argv[1])
        if (mainWindow) {
             mainWindow.loadURL('file://' + __dirname + '/pdfviewer/web/viewer.html?file=' + encodeURIComponent(commandLine[1]), options);
            if (mainWindow.isMinimized()) {
                mainWindow.restore();
            }
            mainWindow.show();
            mainWindow.focus();
        }
    });
}
const contextMenurTemplate = [
    {
        label: '翻译', type: 'checkbox', checked: true, click: (menuItem) => {
            go_on = go_on ? false : true;
            // console.log(go_on);
            // menuItem.checked = !menuItem.checked;
            // menuItem.label="继续";
        }
    },
    // Select All菜单项
];

const contextMenur = Menu.buildFromTemplate(contextMenurTemplate);


// 监听右键事件
//mainWindow.loadURL('file://' + __dirname + '/pdfviewer/web/viewer.html?file=' + encodeURIComponent(path), options);
//打开文件

// ipcMain.on('contextrMenu', () => {
//     contextMenur.popup(BrowserWindow.getFocusedWindow());
//     console.log("收到消息")
// });
// ipcMain.on('open', (event, arg) => {
//     mainWindow.loadURL('file://' + __dirname + '/pdfviewer/web/viewer.html?file=' + encodeURIComponent(arg), options);
//     console.log("收到消息")
// });
ipcMain.on('audio', (event, arg,arg1) => {
    // var cwd=process.cwd()+"/MP3/"
    var js=process.execPath;
//js[js.length - 1] 就是当前的js文件的路径
    var cwd = js.substring(0, js.lastIndexOf("/") + 1)+"MP3/";
    // dialog.showMessageBox(cwd)
    // dialog.showErrorBox(js,cwd);
    console.log(cwd);
    //删除原有MP3
    var list = fs.readdirSync(cwd);
    console.log(list);
    list.forEach((v, i)=>{
         var url = cwd  + v
        fs.unlink(url,function(error){
            if(error){
                console.log(error);
                return false;
            }
            // console.log('删除文件成功');
        });
    })
    request(arg).pipe(fs.createWriteStream(cwd+arg1+'.mp3'))
});

// ipcMain.on('google', (event, arg) => {
//     google.translate(arg).then(res=>{
//         console.log(res.result);
//         event.returnValue=res.result;
//     })
// });

// app.commandLine.appendSwitch('host-rules', 'MAP * 127.0.0.1');
app.commandLine.appendSwitch("--disable-http-cache");
app.on('ready', function () {
    var js=process.execPath;
//js[js.length - 1] 就是当前的js文件的路径
    var cwd = js.substring(0, js.lastIndexOf("/") + 1)+"MP3/";
    fs.exists(cwd,(exists) =>{
        if (!exists){
            fs.mkdir(cwd,(x)=>{})
        }
    })
    console.log(process.argv);
    contextMenu = Menu.buildFromTemplate([
        {label: '显示', click: () => mainWindow.show()},
        {type: 'separator'},
        {
            label: '退出', click: () => {
                watcherId = null;
                if (mainWindow) {
                    mainWindow.webContents.clearHistory();
                    mainWindow.webContents.session.clearCache(function () {
                        mainWindow.destroy();
                    });
                }



            }
        },
    ]);
    // //for OS-X
    if (app.dock) {
        app.dock.setIcon(app_icon);
        app.dock.setMenu(contextMenu);
    }
    Menu.setApplicationMenu(menu);
    appIcon = new Tray(app_icon);
    appIcon.setToolTip('PDF Viewer');
    appIcon.setContextMenu(contextMenu);
    createWindow();
});
// Quit when all windows are closed.
app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
app.on('activate', function () {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow();
    }
});




function createWindow() {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        minWidth: 400,
        minHeight: 300,
        width: 800,
        height: 600,
        show: false,
        icon: app_icon,

        // icon: path.join(__dirname, 'icon.ico'),
        webPreferences: {nodeIntegration: true, defaultEncoding: 'UTF-8'},
        webSecurity: false

    });
    mainWindow.on('close', function (e) {
        e.preventDefault();
        mainWindow.hide();
    });

    mainWindow.on('closed', function () {
        mainWindow = null;
        app.quit();
    });
    mainWindow.webContents.on('new-window', function (e, url) {
        e.preventDefault();
        shell.openExternal(url);
    });
    // mainWindow.webContents.on('devtools-opened', function(e) {
    //     e.preventDefault();
    //     this.closeDevTools();
    // });

    mainWindow.webContents.on('will-navigate', function (e, url) {
        e.preventDefault();
        shell.openExternal(url);
    });
    mainWindow.loadURL('file://' + __dirname + '/default.html', options);
    // mainWindow.loadURL('file://' + __dirname + '/pdfviewer/web/test.html', options);
    mainWindow.once('ready-to-show', () => {
        // splashwindow.close();
        // splashwindow = null;
        mainWindow.maximize();
        mainWindow.show();
    });

    if (process.argv[1] && process.argv[1] !=".") {
        mainWindow.loadURL('file://' + __dirname + '/pdfviewer/web/viewer.html?file=' + encodeURIComponent(process.argv[1]), options);
    }
    // monitor_argv()
}
