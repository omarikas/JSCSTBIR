const tf = require('@tensorflow/tfjs-node');
const fs = require('fs');
const Jimp = require('jimp');

const IMAGE_WIDTH = 256;
const IMAGE_HEIGHT = 256;
const NUM_CLASSES = 3

const catsDir = './train/tower';
const dogsDir = './train/clock';

const bird = './train/plane';
async function loadAndPreprocessImages(directory) {
    const files = fs.readdirSync(directory);
    const images = [];
    for (const file of files) {
      try{
        if(images.length>500){
            return images
        }
        const filePath = `${directory}/${file}`;
        const image = await Jimp.read(filePath);
        image.resize(IMAGE_WIDTH, IMAGE_HEIGHT);
        console.log(file)

        // Convert image data to buffer
        const buffer = await image.getBufferAsync(Jimp.MIME_PNG);

        // Convert buffer to tensor and normalize pixel values
        const normalizedImage = tf.node.decodeImage(buffer).div(255.0);
        images.push(normalizedImage);
      }catch(err){
        console.error(err)
      }

    }
    return images;
}

async function main() {
    const cats = await loadAndPreprocessImages(catsDir);
    const dogs = await loadAndPreprocessImages(dogsDir);
    
    const plane = await loadAndPreprocessImages(bird);
    const images = cats.concat(dogs).concat(plane)
    const labels = tf.tensor2d(
        Array.from({ length: cats.length }).fill([1, 0,0])
        .concat(Array.from({ length: dogs.length }).fill([0, 1,0])).concat(Array.from({ length: plane.length }).fill([0,0, 1]))
    );

    const model = tf.sequential();
    model.add(tf.layers.conv2d({
        inputShape: [IMAGE_WIDTH, IMAGE_HEIGHT, 4], // Assuming RGB images
        filters: 32,
        kernelSize: 3,
        activation: 'relu'
    }));
    model.add(tf.layers.maxPooling2d({
        poolSize: 2,
        strides: 2
    }));
    model.add(tf.layers.conv2d({
        filters: 64,
        kernelSize: 3,
        activation: 'relu'
    }));
    model.add(tf.layers.maxPooling2d({
        poolSize: 2,
        strides: 2
    }));
    model.add(tf.layers.flatten());
    model.add(tf.layers.dense({
        units: 128,
        activation: 'relu'
    }));
    model.add(tf.layers.dense({
        units: NUM_CLASSES,
        activation: 'softmax'
    }));

    model.compile({
        optimizer: tf.train.adam(),
        loss: 'categoricalCrossentropy',
        metrics: ['accuracy']
    });

    const BATCH_SIZE = 32;
    const NUM_EPOCHS = 2;

    await model.fit(tf.stack(images), labels, {
        batchSize: BATCH_SIZE,
        epochs: NUM_EPOCHS,
        shuffle: true
    });

    const MODEL_DIR = './model';
    await model.save(`file://${MODEL_DIR}`);
    console.log('Model saved successfully.');
}

main().catch(error => {
    console.error('Error occurred during training or saving the model:', error);
});
