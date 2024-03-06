// Import necessary modules and files
const { handleMessage, generateImage } = require('../imageGenerator.js'); // handleMessage function is exported from index.js
const { test } = require('node:test');
const assert = require('assert');

// test Dall-E image generation with async/await
test("Dall-E image generation", async () => {
    // Create a test message object
    const testImg = {
        guildId: process.env.GUILD_ID,
        content: "!image a cat",
        author: {
            bot: false // Ensure the message is treated as coming from a real user
        },
        reply: async (response) => {
            try {
                assert.ok(response, 'Bot should reply to message')
                assert.strictEqual(typeof response, 'string' && message.startsWith('https'), 'Bot should reply with an image URL')
            } catch (error) {
                assert.fail('Test Failed:', error.message);
            }
        }
    };

    try {
        // Wait for generateImage to complete its operation
        await generateImage(testImg);
        // If handleMessage completes without errors, and send function logic passes, test is considered successful
        console.log("Test passed: Image generation and response successful.");
    } catch (error) {
        // Catch errors both from handleMessage and the send function's thrown error
        assert.fail(`Test failed: ${error.message}`);
    }
});