const tf = require('@tensorflow/tfjs-node');
const fs = require('fs');
const fetch = require('node-fetch');
const cocoSsd = require('@tensorflow-models/universal-sentence-encoder');

async function loadModel() {
    // Load the pre-trained image captioning model
    const model = await cocoSsd.load();

    return model;
}

async function findMostSimilar(inputSentence, sentences) {
    const model = await loadModel();
    var arr=[inputSentence];
    var i=0;
    sentences.forEach(async element => {
        i++;
        arr.push(element.text.replace("[skecth]",element.label))
        if(i==1000){
            const embeddings = await model.embed(arr);

            const inputEmbedding = embeddings.slice([0, 0], [1, embeddings.shape[1]]);
            const similarities = [];
            for (let i = 1; i < embeddings.shape[0]; i++) {
                const similarity = tf.matMul(inputEmbedding, embeddings.slice([i, 0], [1, embeddings.shape[1]]), false, true).dataSync()[0];
                similarities.push({
                    sentence: sentences[i - 1],
                    similarity: similarity
                });
            }
        
            const mostSimilar = similarities.reduce((max, current) => max.similarity > current.similarity ? max : current);
        
            console.log('Most Similar Sentence:', mostSimilar.sentence);
            return;
        
        }

    });
   }

const inputSentence = "soft cushion on the sleeping platform";
const sentences = JSON.parse(fs.readFileSync("D://CSTBIR_dataset.json"))
findMostSimilar(inputSentence, sentences);