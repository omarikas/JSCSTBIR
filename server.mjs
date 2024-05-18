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

// Get the directory name of the current module
const __dirname = dirname(__filename);

const corsOptions = {
  origin: 'https://example-frontend.com', // replace with your front-end URL
  optionsSuccessStatus: 200 // for legacy browser support
};
console.log(__dirname);
const app = express();
const port = process.env.PORT ||3000;
const model = loadModel("./model/model.json");
const coco = loadModel2();
app.use(express.json());

app.use(cors({
  origin: '*',
  maxAge: 3600 // set max age in seconds
}));

app.post("/predict", async (req, res) => {
console.log("h")
  const svgPathData = req.drawing;
  var text = req.word;
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
