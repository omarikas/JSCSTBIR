import OpenAI from "openai";
import { fileURLToPath } from "url";
import path from "path";
import { LocalIndex } from "vectra";
import fs from "fs";
import tbir from "./vector.mjs";
import axios from "axios";

import * as cocoSsd from "@tensorflow-models/universal-sentence-encoder";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const apiKey = "Yy7HFJlLRLJ9IFGNYeIw2N7FsiRv9ERb"; // Replace with your actual API key
const endpoint = "https://api.ai21.com/studio/v1/paraphrase";
async function chatWithGPT(prompt) {
  const res = await axios.post(
    endpoint,
    { text: prompt },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    }
  );
  console.log(res.data.suggestions[0].text);
  return res.data.suggestions[0].text;
}

async function loadModel() {
  // Load the pre-trained image captioning model
  const model = await cocoSsd.load();

  return model;
}

async function main(sentence, j) {
  const index = new LocalIndex(path.join(__dirname, "..", "index"));
  if (!(await index.isIndexCreated())) {
    await index.createIndex();
  }
  var arr = [];
  const model = await loadModel();
  var count = 0;
  for (var i = j; i < j + 1000 && i < sentence.length; i++) {
    const element = sentence[i];
    console.log(i);
    const txt = element.text.replace("[sketch]", element.label);
    var response;
    try {
      response = await chatWithGPT(`${txt}`);
    } catch (err) {
      console.error(err);
      await sleep(60000);

      response = await chatWithGPT(`${txt}`);
    }
    const ans = await tbir(model, response);
    console.log(ans);
    if (ans === txt) {
      count++;
      console.log("-----------------yay--------------" + count);
    }
  }
}

const sentences = JSON.parse(fs.readFileSync("./CSTBIR_dataset.json"));
main(sentences, 0);

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
