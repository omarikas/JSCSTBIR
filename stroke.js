const fs = require('fs');
const readline = require('readline');
const { createCanvas, Image } = require('canvas');
// Draw your connected points
function drawPoints(points, minX, minY, maxX, maxY, curr) {
    // Set canvas size to 256 by 256
    const canvasWidth = 256;
    const canvasHeight = 256;

    // Create a canvas with the desired size
    const canvas = createCanvas(canvasWidth, canvasHeight);
    const context = canvas.getContext('2d');
    context.lineWidth = 4;
    context.strokeStyle = 'blue';

    // Calculate scaling factors to fit the drawing within the canvas
    const scaleX = canvasWidth / (maxX - minX);
    const scaleY = canvasHeight / (maxY - minY);
    const scale = Math.min(scaleX, scaleY);

    // Calculate offsets to center the drawing in the canvas
    const offsetX = (canvasWidth - (maxX - minX) * scale) / 2;
    const offsetY = (canvasHeight - (maxY - minY) * scale) / 2;

    // Draw lines between connected points
    points.forEach(connection => {
        for (let i = 0; i < connection[0].length - 1; i++) {
            const startX = offsetX + (connection[0][i] - minX) * scale;
            const startY = offsetY + (connection[1][i] - minY) * scale;
            const endX = offsetX + (connection[0][i + 1] - minX) * scale;
            const endY = offsetY + (connection[1][i + 1] - minY) * scale;
            
            context.beginPath();
            context.moveTo(startX, startY);
            context.lineTo(endX, endY);
            context.stroke();
        }
    });

    // Convert canvas to PNG and save the file
    const out = fs.createWriteStream(__dirname + `/eval/plane/plane${curr}.png`);
    const stream = canvas.createPNGStream();
    stream.pipe(out);
    out.on('finish', () => console.log(`The PNG file for tower${curr} was created.`));
}


async function parseNDJSON(filename) {
    let minX, minY, maxX, maxY;
    let curr = 0;

    try {
        const fileStream = fs.createReadStream(filename);
        const rl = readline.createInterface({
            input: fileStream,
            crlfDelay: Infinity
        });

        for await (const line of rl) {
            curr++;
            if (curr == 2000) {
                break;
            }

            const drawingData = JSON.parse(line);
            const drawing = drawingData.drawing;

            // Find min and max values for x and y coordinates
            minX = Infinity;
            minY = Infinity;
            maxX = -Infinity;
            maxY = -Infinity;

            drawing.forEach(arr => {
                arr[0].forEach(x => {
                    minX = Math.min(minX, x);
                    maxX = Math.max(maxX, x);
                });
                arr[1].forEach(y => {
                    minY = Math.min(minY, y);
                    maxY = Math.max(maxY, y);
                });
            });

            drawPoints(drawing, minX, minY, maxX, maxY,curr);
        }
    } catch (error) {
        console.error('Error parsing NDJSON:', error);
    }
}

async function main() {
    await parseNDJSON("D:/full_raw_airplane.ndjson");
}

main();
