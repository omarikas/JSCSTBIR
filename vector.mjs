import { fileURLToPath } from "url";
import path from "path";
import { LocalIndex } from "vectra";
import * as tf from "@tensorflow/tfjs-node";
import * as cocoSsd from "@tensorflow-models/universal-sentence-encoder";
import * as fs from "fs";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Now you can use __dirname
const indexPath = path.join(__dirname, "..", "index");

export async function loadModel2() {
  // Load the pre-trained image captioning model
  const model = await cocoSsd.load();

  return model;
}
async function main(sentence, j) {
  console.log(sentence.length);
  const index = new LocalIndex(path.join(__dirname, "..", "index"));
  if (!(await index.isIndexCreated())) {
    await index.createIndex();
  }
  const model = await loadModel2();
  var arr = [];

  for (var i = 0; i < sentence.length; i++) {
    const element = sentence[i];
    console.log(i);
    arr.push(element.text.replace("[sketch]", element.label));
  }

  const embeddings = await (await model.embed(arr)).array();
  for (var i = 0; i < embeddings.length; i++) {
    console.log(i);

    await index.insertItem({
      vector: embeddings[i],
      metadata: {
        data: sentence[ i]      },
    });
  }
}
fs.readFile('./data/dataset/CSTBIR_dataset.json', 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading file:', err);
    return;
  }
  try {
    const jsonData = JSON.parse(data);
//   main(jsonData)
  } catch (err) {
    console.error('Error parsing JSON:', err);
  }
});
export  async function query(model, text) {
  const vector = (await (await model.embed(text)).array())[0];

  const index = new LocalIndex(path.join(__dirname, "..", "index"));

  const results = await index.queryItems(vector, 2);
  if (results.length > 0) {
    return results[0].item.metadata.data;
  } else {
    console.log(`No results found.`);
  }
}

//main(sentences,0);
