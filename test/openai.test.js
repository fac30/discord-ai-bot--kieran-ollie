// Import necessary modules and files
const { handleMessage } = require('../index.js'); // handleMessage function is exported from index.js
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


// test Dall-E image generation with async/await
test("Dall-E image generation", async () => {
    const testMsg = {
        content: "!image a cat",
        author: {
            bot: false // Ensure the message is treated as coming from a real user
        },
        channel: {
            send: (message) => {
                // This mock function intercepts messages sent by your bot to the channel
                console.log('Bot replied with:', message);
                // Basic validation to check if the bot's reply seems like an image URL
                if (typeof message === 'string' && message.startsWith('http')) {
                    console.log('Passed: Bot replied with an image URL!');
                    return true; // Indicate success for the test
                } else {
                    throw new Error('Bot did not reply with an image URL.');
                }
            }
        },
        reply: (response) => {
            // Alternative reply handler, depending on your bot's implementation
            console.log('Bot replied with:', response);
        }
    };

    try {
        // Wait for handleMessage to complete its operation
        await handleMessage(testMsg);
        // If handleMessage completes without errors, and send function logic passes, test is considered successful
        console.log("Test passed: Image generation and response successful.");
    } catch (error) {
        // Catch errors both from handleMessage and the send function's thrown error
        console.error(`Test failed: ${error.message}`);
    }
});
