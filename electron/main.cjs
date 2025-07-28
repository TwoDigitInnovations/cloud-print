const { app, BrowserWindow } = require('electron');
const path = require('path');
const { io } = require('socket.io-client');
// const printer = require('printer');
const axios = require('axios');
// const escposBufferImage = require('escpos-buffer-image');
const printer = require('pdf-to-printer');
const pdfMake = require("pdfmake/build/pdfmake");
const pdfFonts = require("pdfmake/build/vfs_fonts");
pdfMake.vfs = pdfFonts.vfs;


const { encode, decode } = require('node-base64-image');
// import * as pdfMake from 'pdfmake/build/pdfmake';
// import * as pdfFonts from 'pdfmake/build/vfs_fonts';
// pdfMake.vfs = pdfFonts.pdfMake.vfs;

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
    win.webContents.on('did-finish-load', async () => {
        // win.webContents.openDevTools();
        // Wait a short moment to ensure rendering
        const socketUrl = ("https://api.mylodge.cloud");
        // const socketUrl = ("http://localhost:3001");

        let socket = io(socketUrl, {
            transports: ["websocket"],
            // withCredentials: true,
        });
        const url = 'https://m.media-amazon.com/images/I/71+17bVYHxL._UF1000,1000_QL80_.jpg'
        const options = {
            string: true,
            headers: {
                "User-Agent": "my-app"
            }
        };
        const image = await encode(url, options);
        console.log(image)
        const documentDefinition = {
            content: [
                {
                    image: 'data:image/jpg;base64,' + image,
                    width: 500 // Adjust as needed
                }
            ]
        };

        pdfMake.createPdf(documentDefinition).getBlob(async (blob) => {
            const url = URL.createObjectURL(blob);
            console.log("PDF URL:", url);

            // Example: open in a new tab
            // window.open(url);
            try {
                await printer.print(url, {
                    printer: 'EPSON CW-C4000 Series',
                    unix: ['-o media=Custom.85x54mm', '-o fit-to-page'], // macOS/Linux print options
                    win32: ['-print-settings "fit"'], // Windows-specific options
                });
            } catch (err) {
                console.log(err)
            }


            // You can also use this URL in an <a> tag or iframe
        });

        setTimeout(() => {

            socket.on("connect", () => {
                console.log("Connected to socket server:", socket.id);
                console.log(socket.id)
            });

            socket.on("print", async (imageUrl) => {
                console.log("Connected to socket server:", socket.id);
                console.log(imageUrl)

                // normal printer

                // const htmlContent = `
                //     <html>
                //     <body style="margin:0; text-align:center;">
                //         <img src="${data}" style="max-width:100%; height:auto;" />
                //     </body>
                //     </html>
                // `;
                // win.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(htmlContent));

                // win.webContents.print({
                //     silent: true,
                //     printBackground: false,
                //     pageSize: {
                //         width: 85600,
                //         height: 53980
                //     },
                //     margins: {
                //         marginType: 'custom',
                //         top: 0,
                //         bottom: 0,
                //         left: 0,
                //         right: 0
                //     },
                //     landscape: false, // Set true if you want horizontal printing
                //     scaleFactor: 100
                // }, (success, errorType) => {
                //     if (!success) console.error('Print failed:', errorType);
                //     else console.log('Printed successfully');
                // });

                // normal printer

                await printer.print(imageUrl, {
                    printer: 'EPSON CW-C4000 Series',
                    unix: ['-o media=Custom.85x54mm', '-o fit-to-page'], // macOS/Linux print options
                    win32: ['-print-settings "fit"'], // Windows-specific options
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
