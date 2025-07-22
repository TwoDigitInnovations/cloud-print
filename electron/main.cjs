const { app, BrowserWindow } = require('electron');
const path = require('path');
const { io } = require('socket.io-client');

function createWindow() {
    const win = new BrowserWindow({

        width: 600,
        height: 600,
        show: false,
        // webPreferences: {
        //     contextIsolation: true,
        //     nodeIntegration: false
        // }
    });

    // Load your built Vite app from dist folder
    win.loadFile(path.join(__dirname, '../dist/index.html'));
    console.log(path.join(__dirname, '../dist/index.html'))
    win.webContents.on('did-finish-load', () => {
        // win.webContents.openDevTools();
        // Wait a short moment to ensure rendering
        const socketUrl = ("https://api.mylodge.cloud");
        // const socketUrl = ("http://localhost:3001");

        let socket = io(socketUrl, {
            transports: ["websocket"],
            // withCredentials: true,
        });
        setTimeout(() => {

            socket.on("connect", () => {
                console.log("Connected to socket server:", socket.id);
                console.log(socket.id)
            });

            socket.on("print", (data) => {
                console.log("Connected to socket server:", socket.id);
                console.log(data)
                const htmlContent = `
                    <html>
                    <body style="margin:0; text-align:center;">
                        <img src="${data}" style="max-width:100%; height:auto;" />
                    </body>
                    </html>
                `;
                win.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(htmlContent));

                win.webContents.print({
                    silent: true,
                    printBackground: false,
                    pageSize: {
                        width: 85600,
                        height: 53980
                    },
                    margins: {
                        marginType: 'custom',
                        top: 0,
                        bottom: 0,
                        left: 0,
                        right: 0
                    },
                    landscape: false, // Set true if you want horizontal printing
                    scaleFactor: 100
                }, (success, errorType) => {
                    if (!success) console.error('Print failed:', errorType);
                    else console.log('Printed successfully');
                });
            });

        }, 500);
    });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
