// Import necessary modules and files
const { handleMessage } = require('../index.js'); // handleMessage function is exported from index.js
const fs = require('fs'); // Require file system for .env testing
const { test } = require('node:test');
const assert = require('assert');

// ensure that the OpenAI library is correctly integrated by creating a test function that attempts to use the OpenAI API to create a simple chat completion or query
test("OpenAI responding", () => {
    const testMsg = {
        content: "How cold is it outside?",
        author: {
            bot: false
        },
        channel: {
            sendTyping: () => {}
        },
        reply: (response) => {
            console.log('Passed: Bot replied!');
        }
    };

    try {
        handleMessage(testMsg);
    } catch (error) {
        console.error('Failed: Unexpected error caught:', error);
    }
});

// check that my bot securely loads API keys from the .env file, confirming that no sensitive information is hard-coded
test(".env exists", () => {
    const envFilePath = '.env';

    try {
        fs.accessSync(envFilePath, fs.constants.F_OK);
        console.info("Pass: .env file exists.");
    } catch (error) {
        console.error("Fail: .env file does not exist.");
    }
});

// // check that the .env file is in the gitignore
// test(".env inclusion in gitignore", () => {
//     const gitignoreFilePath = '.gitignore';
//     const gitignoreContent = fs.readFileSync(gitignoreFilePath, 'utf8');
//     if (gitignoreContent.includes('.env')) {
//         console.info("Pass: .env file is included in .gitignore.");
//     } else {
//         console.error("Fail: .env file is not included in .gitignore.");
//     }
// })

// // check that relevant variables are imported from .env
// test("Import variables from .env", () => {

//     // Define the expected environment variables
//     const expectedEnvVariables = {
//         TOKEN: process.env.TOKEN,
//         CHANNEL_ID: process.env.CHANNEL_ID,
//         OPENAI_API_KEY: process.env.OPENAI_API_KEY,
//         CLIENT_ID: process.env.CLIENT_ID
//     };

//     // Check if variables are defined and have expected values in index.js
//     let pass = true;
//     for (const [key, value] of Object.entries(expectedEnvVariables)) {
//         if (!value) {
//             console.error(`Fail: ${key} is not correctly imported in index.js.`);
//             pass = false;
//         }
//     }

//     if (pass) {
//         console.info("Pass: Environment variables are correctly imported in index.js.");
//     }
// });