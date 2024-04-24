const tf = require('@tensorflow/tfjs-node');
const fs = require('fs');
const path = require('path');
const Jimp=require('jimp')
async function loadModel(modelPath) {
    try {
        const model = await tf.loadLayersModel(`file://./${modelPath}`);
        return model;
    } catch (error) {
        console.error('Error loading the model:', error);
        throw error;
    }
}

async function predictImageClass(model, imagePath) {
    try {
        // Read and decode the image
        
        const image = await Jimp.read(imagePath);
        image.resize(256, 256);

        // Convert image data to buffer
        const buffer = await image.getBufferAsync(Jimp.MIME_PNG);

        // Convert buffer to tensor and normalize pixel values
        const normalizedImage = tf.node.decodeImage(buffer).div(255.0).expandDims(0);
        // Make predictions
        
        const startTime = Date.now();
        const predictions = await model.predict(normalizedImage);
        const endTime = Date.now();
        const predictionTime = endTime - startTime;
counter+=predictionTime
console.log(predictionTime)
predictions.print()
        // Extract the class probabilities from predictions
        const probabilities = predictions.arraySync()[0];

        // Get the predicted class (index with the highest probability)
        const predictedClass = probabilities.indexOf(Math.max(...probabilities));

        return predictedClass;
    } catch (error) {
        console.error('Error predicting image class:', error);
        throw error;
    }
}

async function testModelOnImage(model, imagePath) {
    try {
        // Load the saved model
        // Predict the class of the image
        const predictedClass = await predictImageClass(model, imagePath);

    } catch (error) {
        console.error('Error testing model on image:', error);
    }
}

// Specify the path to the saved model and the image you want to test
const modelPath = './model/model.json'; // Change this to the path of your saved model
// Change this to the path of your test image
var counter=0
// Test the model on the specified image
async function main (){
    
    const model = await loadModel(modelPath);

for(var i=1;i<2000;i++){
    const imagePath = `./eval/clock/clock${i}.png`

   await testModelOnImage(model, imagePath);
}
console .log(`final count ${counter}`)
}
main()