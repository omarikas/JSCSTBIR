const fs = require('fs');
const { createCanvas, loadImage } = require('canvas');

// Function to get the widest and longest image dimensions
async function getWidestAndLongestDimensions(directoryPath) {
    let maxWidth = 0;
    let maxHeight = 0;

    const files = fs.readdirSync(directoryPath);
    for (const file of files) {
        if (file.startsWith('tower')) {
            const image = await loadImage(`${directoryPath}/${file}`);
            maxWidth = Math.max(maxWidth, image.width);
            maxHeight = Math.max(maxHeight, image.height);
        }
    }

    return { maxWidth, maxHeight };
}

// Function to resize images to match the widest and longest dimensions
async function resizeImages(directoryPath, maxWidth, maxHeight) {
    const files = fs.readdirSync(directoryPath);
    var i=0;
    for (const file of files) {
        if(i>=2000){
            break;
        }
            const image = await loadImage(`${directoryPath}/${file}`);
            const canvas = createCanvas(maxWidth, maxHeight);
            const context = canvas.getContext('2d');
            context.drawImage(image, 0, 0, maxWidth, maxHeight);
            const out = fs.createWriteStream(`${directoryPath}/${file}`);
            const stream = canvas.createPNGStream();
            stream.pipe(out);
            i++;
            console.log(i)
        
    }
}

async function main() {
    const directoryPath = './val/clock'; // Change to the directory containing your tower images
    
    await resizeImages(directoryPath, 256, 256);
    console.log('All images have been resized.');
}

main();
