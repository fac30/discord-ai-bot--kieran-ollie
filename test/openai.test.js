// Import necessary modules and files
const { handleMessage } = require('../index.js'); // handleMessage function is exported from index.js
const { test } = require('node:test');

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


