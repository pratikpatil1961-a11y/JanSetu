const fs = require('fs');
const https = require('https');
require('dotenv').config();

const apiKey = process.env.GEMINI_API_KEY;

https.get(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`, (resp) => {
  let data = '';
  resp.on('data', (chunk) => {
    data += chunk;
  });
  resp.on('end', () => {
    const models = JSON.parse(data).models;
    if (models) {
        models.forEach(m => {
            console.log(m.name, m.supportedGenerationMethods);
        });
    } else {
        console.log(data);
    }
  });
}).on("error", (err) => {
  console.log("Error: " + err.message);
});
