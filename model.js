const tf = require('@tensorflow/tfjs-node');
const fs = require('fs');
const Jimp = require('jimp');

const IMAGE_WIDTH = 256;

const IMAGE_HEIGHT = 256;
const NUM_CLASSES = 4

const catsDir = './data/sketchespng/castle/';
const dogsDir = './data/sketchespng/camel/';

const bird = './data/sketchespng/hotairballon/';
const beach= './data/sketchespng/beach/';


async function loadAndPreprocessImages(directory) {
    const files = fs.readdirSync(directory);
    const images = [];
    for (const file of files) {
      try{
      const filePath = `${directory}/${file}`;
            const image = await Jimp.read(filePath);

            // Extract the blue channel
            const blueChannel = [];
            var i=0;
            image.scan(0, 0, image.bitmap.width, image.bitmap.height, (x, y, idx) => {
                const blue = image.bitmap.data[idx + 2]; // The blue value
                            
        if(!blueChannel[i%256]){
          blueChannel[i%256]=[]
        }

        blueChannel[i%256].push(blue);
i++;
            });
            // Convert blue channel array to tensor
            const blueChannelTensor = tf.tensor(blueChannel, [image.bitmap.height, image.bitmap.width], 'int32');
          console.log(images.length) 
          if(images.length>2000){
          break;
          } 
            // Normalize pixel values
            const normalizedImage = blueChannelTensor.div(255.0);
            
            images.push(normalizedImage);}catch(err){
        console.error(err)
      }

    }
    return images;
}

async function main() {
    const cats = await loadAndPreprocessImages(catsDir);
    const dogs = await loadAndPreprocessImages(dogsDir);
   const beach2=await loadAndPreprocessImages(beach) 
    const plane = await loadAndPreprocessImages(bird);
    const images = cats.concat(dogs).concat(plane).concat(beach2)
    const labels = tf.tensor2d(
        Array.from({ length: cats.length }).fill([1, 0,0,0])
        .concat(Array.from({ length: dogs.length }).fill([0, 1,0,0])).concat(Array.from({ length: plane.length }).fill([0,0, 1,0]).concat(Array.from({length:beach2.length}).fill([0,0,0,1])))
    );

const model = tf.sequential();

// First convolutional layer (captures edges and simple patterns)
model.add(tf.layers.conv2d({
    inputShape: [IMAGE_WIDTH, IMAGE_HEIGHT, 1], // Grayscale images
    filters: 32, // Number of filters
    kernelSize: 3, // Size of the filters
    activation: 'relu'
}));

// First max pooling layer
model.add(tf.layers.maxPooling2d({
    poolSize: 2,
    strides: 2
}));

// Second convolutional layer (captures more complex patterns)
model.add(tf.layers.conv2d({
    filters: 64, // Increased number of filters
    kernelSize: 3,
    activation: 'relu'
}));

// Second max pooling layer
model.add(tf.layers.maxPooling2d({
    poolSize: 2,
    strides: 2
}));

// Third convolutional layer (captures even more complex features)
model.add(tf.layers.conv2d({
    filters: 128, // Further increased number of filters
    kernelSize: 3,
    activation: 'relu'
}));

// Third max pooling layer
model.add(tf.layers.maxPooling2d({
    poolSize: 2,
    strides: 2
}));

// Optional: Fourth convolutional layer for deeper feature extraction
model.add(tf.layers.conv2d({
    filters: 256, // Further increased number of filters
    kernelSize: 3,
    activation: 'relu'
}));

// Optional: Fourth max pooling layer
model.add(tf.layers.maxPooling2d({
    poolSize: 2,
    strides: 2
}));

// Flatten the 3D feature maps to 1D feature vectors
model.add(tf.layers.flatten());

// Fully connected dense layer
model.add(tf.layers.dense({
    units: 128,
    activation: 'relu'
}));

// Output layer with softmax activation for classification
model.add(tf.layers.dense({
    units: NUM_CLASSES, // Number of output classes
    activation: 'softmax'
}));

// Compile the model
model.compile({
    optimizer: tf.train.adam(),
    loss: 'categoricalCrossentropy', // Ensure labels are one-hot encoded
    metrics: ['accuracy']
});
    const NUM_EPOCHS = 3;

    await model.fit(tf.stack(images).expandDims(3), labels, {
        batchSize: 32,
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
