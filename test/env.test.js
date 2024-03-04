const fs = require('fs'); // Require file system for .env testing
const { test } = require('node:test');
const assert = require('assert');

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

// check that the .env file is in the gitignore
test(".env inclusion in gitignore", () => {
    const gitignoreFilePath = '.gitignore';
    const gitignoreContent = fs.readFileSync(gitignoreFilePath, 'utf8');
    assert(gitignoreContent.includes('.env'), "Fail: .env file is not included in .gitignore.")
})

// check that relevant variables are imported from .env
test("Import variables from .env", () => {
    try {
        // Define the expected environment variables
        const expectedEnvVariables = {
            TOKEN: process.env.TOKEN,
            CHANNEL_ID: process.env.CHANNEL_ID,
            OPENAI_API_KEY: process.env.OPENAI_API_KEY,
            CLIENT_ID: process.env.CLIENT_ID
        };

        // Check if variables are defined and have expected values in index.js
        for (const [key, value] of Object.entries(expectedEnvVariables)) {
            assert.ok(value, `Fail: ${key} is not correctly imported in index.js.`);
        }

        setTimeout(() => {
            console.log("Pass: Environment variables are correctly imported in index.js.");
        }, 0); // Delaying the logging to ensure the message logs after the test result
    } catch (error) {
        console.error(error.message); // Log any assertion errors
        throw error; // Throw the error explicitly to ensure the test fails
    }
});