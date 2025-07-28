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
const { jsPDF } = require('jspdf');
const https = require('https');

const fs = require('fs');
const os = require('os');


const { encode, decode } = require('node-base64-image');
// import * as pdfMake from 'pdfmake/build/pdfmake';
// import * as pdfFonts from 'pdfmake/build/vfs_fonts';
// pdfMake.vfs = pdfFonts.pdfMake.vfs;

function downloadImageAsBase64WithSize(imageUrl) {
    return new Promise((resolve, reject) => {
        https.get(imageUrl, (res) => {
            let chunks = [];

            res.on('data', (chunk) => chunks.push(chunk));

            res.on('end', () => {
                const buffer = Buffer.concat(chunks);
                const base64 = buffer.toString('base64');
                const contentType = res.headers['content-type']; // e.g. image/jpeg

                resolve({ base64, contentType });
            });
        }).on('error', reject);
    });
}

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
        const url = 'https://res.cloudinary.com/dweddwpll/image/upload/v1753082255/properties/brex6cfdjbvnwszq6uzr.png'
        // const options = {
        //     string: true,
        //     headers: {
        //         "User-Agent": "my-app"
        //     }
        // };
        // const image = await encode(url, options);
        const { base64, contentType } = await downloadImageAsBase64WithSize(url);
        const format = contentType.split('/')[1].toUpperCase(); // JPEG, PNG, etc.
        console.log(contentType, format)
        // console.log('data:image/jpg;base64,' + base64)
        const doc = new jsPDF();
        const imgWidth = 190;
        const imgHeight = (imgWidth * 3) / 4;
        doc.addImage(`data:${contentType};base64,${base64}`, format, 5, 5, 190, 260);
        // console.log(doc)
        // Get PDF as Blob
        const tempPath = path.join(os.tmpdir(), new Date().getTime() + '.pdf');
        fs.writeFileSync(tempPath, doc.output());

        const fileUrl = 'file://' + tempPath;
        console.log('PDF File URL:', fileUrl);
        // console.log(image)
        const documentDefinition = {
            content: [
                {
                    image: 'data:image/png;base64,' + base64,
                    // width: 500 // Adjust as needed
                }
            ]
        };

        //           const imageData = fs.readFileSync(imagePath);
        //   const base64Image = imageData.toString('base64');

        //         const doc = new jsPDF();
        //         if (typeof window !== 'undefined') {
        //             const img = new window.Image();
        //             img.src = url;
        //             img.onload = () => {
        //                 const imgWidth = 190; // PDF page width (210mm) with margin
        //                 const imgHeight = (img.height * imgWidth) / img.width;

        //                 doc.addImage('data:image/jpg;base64,' + image, 'JPEG', 10, 10, imgWidth, imgHeight);
        //                 // Get PDF as Blob
        //                 const pdfBlob = doc.output('blob');

        //                 // Create URL
        //                 const pdfUrl = URL.createObjectURL(pdfBlob);
        //                 console.log(pdfUrl)

        //                 //   doc.save('image.pdf');
        //             };
        //         }


        pdfMake.createPdf(documentDefinition).getDataUrl(async (result) => {
            console.log(result.charAt(0))
            try {
                await printer.print(result, {
                    printer: 'EPSON CW-C4000 Series',
                    unix: ['-o media=Custom.85x54mm', '-o fit-to-page'], // macOS/Linux print options
                    win32: ['-print-settings "fit"'], // Windows-specific options
                });
            } catch (err) {
                console.log(err)
            }
        })
        // pdfMake.createPdf(documentDefinition).getBlob(async (blob) => {
        //     // const url = URL.createObjectURL(blob);
        //     // console.log("PDF URL:", url);

        //     // Example: open in a new tab
        //     // window.open(url);
        //     // try {
        //     //     await printer.print(blob, {
        //     //         printer: 'EPSON CW-C4000 Series',
        //     //         unix: ['-o media=Custom.85x54mm', '-o fit-to-page'], // macOS/Linux print options
        //     //         win32: ['-print-settings "fit"'], // Windows-specific options
        //     //     });
        //     // } catch (err) {
        //     //     console.log(err)
        //     // }
        //     const tempPath = path.join(os.tmpdir(), new Date().getTime() + '.pdf');
        //     fs.writeFileSync(tempPath, blob);

        //     const fileUrl = 'file://' + tempPath;
        //     console.log(fileUrl)

        //     // You can also use this URL in an <a> tag or iframe
        // });

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
