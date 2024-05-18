import {query,loadModel2} from "./vector.mjs";
import { loadModel, predictImageClass } from "./predict.js";
import strokes from "./stroke.js";
import express from "express";
import cors from "cors";
import path from "path"

import { dirname } from 'path';
import { fileURLToPath } from 'url';

// Get the file path of the current module
const __filename = fileURLToPath(import.meta.url);

const allowedOrigins = [
  'https://ngc4c1db-5500.uks1.devtunnels.ms', // Replace with your actual origin
  'https://your-production-url.com'
];
// Get the directory name of the current module
const __dirname = dirname(__filename);
const corsOptions = {
  origin: function (origin, callback) {

      console.log(origin)
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log(origin)
      callback(new Error('Not allowed by CORS'));
    }
  },
  optionsSuccessStatus: 200 // For legacy browser support
};console.log(__dirname);
const app = express();
const port = process.env.PORT ||3000;
const model = loadModel("./model/model.json");
const coco = loadModel2();
app.use(express.json());
app.use(cors(corsOptions));
app.post("/predict", async (req, res) => {
console.log("h")
  const svgPathData = req.body.drawing;
  var text = req.body.word;
    var minX = Infinity;
    var minY = Infinity;
    var maxX = -Infinity;
    var maxY = -Infinity;

    svgPathData.forEach((arr) => {
    arr.forEach(element => {
         minX = Math.min(minX, element[0]);
        maxX = Math.max(maxX, element[0]);
        minY = Math.min(minY, element[1]);
        maxY = Math.max(maxY, 
      element[0]);
      
    });  
   });
  console.log(minX)

   var png =strokes.drawPoints(svgPathData, minX, minY, maxX, maxY, "test");
 
  var final
  final= text.replace(`[sketch]`, 
 (await predictImageClass(await model,png.toBuffer() )))
console.log(final) 

  res.sendFile( __dirname +"/data/images/images//"+(await query(await coco,final)).image);
});

app.listen(port);
