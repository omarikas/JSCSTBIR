// server.js

import express from 'express';
import * as tf from "@tensorflow/tfjs-node"

import path from 'path';
import * as fs from 'fs';
import { createCanvas } from 'canvas';
import { ImageData } from 'canvas';
import cors from "cors";
import sharp from 'sharp';
import Jimp from 'jimp';
const app = express();
const port = 3000;

app.use(express.json());
app.use(cors()); 
app.post('/predict', async (req, res) => {
  
    const svgPathData = req.body.data
  drawPoints(svgPathData,0,0,256,256);
// Draw your connected points
function drawPoints(points, minX, minY, maxX, maxY,curr) {
    const aspectRatio = (maxX - minX) / (maxY - minY);
    const maxWidth = 256;
    const maxHeight = 256;

    let canvasWidth, canvasHeight;
    if (aspectRatio > 1) {
        canvasWidth = maxWidth;
        canvasHeight = maxWidth / aspectRatio;
    } else {
        canvasWidth = maxHeight * aspectRatio;
        canvasHeight = maxHeight;
    }

    const canvas = createCanvas(canvasWidth, canvasHeight);
    const context = canvas.getContext('2d');
context.lineWidth=4
context.strokeStyle="blue"
    // Draw lines between connected points
    points.forEach(connection => {
        for (let i = 0; i < connection[0].length - 1; i++) {
            const startX = (connection[0][i] - minX) * (canvasWidth / (maxX - minX));
            const startY = (connection[1][i] - minY) * (canvasHeight / (maxY - minY));
            const endX = (connection[0][i + 1] - minX) * (canvasWidth / (maxX - minX));
            const endY = (connection[1][i + 1] - minY) * (canvasHeight / (maxY - minY));
            context.beginPath();
            context.moveTo(startX, startY);
            context.lineTo(endX, endY);
            context.stroke();
        }
    });

    // Convert canvas to PNG
    const out = fs.createWriteStream( "C:/Users/omarr/OneDrive/Desktop/thesis"+'/test.png');
    const stream = canvas.createPNGStream();
    stream.pipe(out);
    out.on('finish', () =>{
        
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
       
                const predictions = await model.predict(normalizedImage);
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
        
        async function testModelOnImage(modelPath, imagePath) {
            try {
                // Load the saved model
                const model = await loadModel(modelPath);
        
                // Predict the class of the image
                const predictedClass = await predictImageClass(model, imagePath);
        res.send({prediction:predictedClass})
                console.log('Predicted class:', predictedClass);
            } catch (error) {
                console.error('Error testing model on image:', error);
            }
        }
        
        // Specify the path to the saved model and the image you want to test
        const modelPath = './model/model.json'; // Change this to the path of your saved model
        const imagePath = './test.png'; // Change this to the path of your test image
        
        // Test the model on the specified image
        testModelOnImage(modelPath, imagePath);
        



















    });
}




});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});







