import { fileURLToPath } from 'url';
import path from 'path';
import { LocalIndex } from 'vectra';
import * as tf from '@tensorflow/tfjs-node';
import * as cocoSsd from '@tensorflow-models/universal-sentence-encoder';
import * as fs from "fs"
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Now you can use __dirname
const indexPath = path.join(__dirname, '..', 'index');


async function loadModel() {
    // Load the pre-trained image captioning model
    const model = await cocoSsd.load();

    return model;
}
async function main(sentence,j){
    console.log(sentence.length)
    const index = new LocalIndex(path.join(__dirname, '..', 'index'));
    if (!await index.isIndexCreated()) {
        await index.createIndex();
    }
    const model=await loadModel()
    var arr=[]
    

      for(var i=j;i<j+1000&&i<sentence.length;i++){
    const element=sentence[i];
        console.log(i)
        arr.push(element.text.replace("[skecth]",element.label))
     
            
        
    }
    
    console.log("ahmed")
    const embeddings =await (await model.embed(arr)).array();
    for(var i=0;i<embeddings.length;i++){
        console.log(i)
   
   await index.insertItem({
        vector: embeddings[i],
        metadata: { data:sentences[j+i] }
    })

    
}
if(j<sentence.length+1000){
    main(sentence,j+1000)
}
    
    
    
    
    
    }

//main();
async function query(text) {
    
    const model=await loadModel()
    const vector =(await (await model.embed(text)).array())[0]
    
    const index = new LocalIndex(path.join(__dirname, '..', 'index'));
    
    console.log((await index.listItems()).length)
    const results = await index.queryItems(vector, 2);
    if (results.length > 0) {
        for (const result of results) {
            console.log(result.item.metadata.data);
        }
    } else {
        console.log(`No results found.`);
    }
}

const sentences = JSON.parse(fs.readFileSync("D://CSTBIR_dataset.json"))
main(sentences,0);
