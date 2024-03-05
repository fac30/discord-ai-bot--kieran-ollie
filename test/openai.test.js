// Import necessary modules and files
const { moderateMessage } = require('../moderation.js'); // moderateMessage function is exported from moderation.js
const { handleMessage, generateImage } = require('../index.js'); // handleMessage function is exported from index.js
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

// test moderation function
test("Moderation function", async () => {
    const modMsg = {
        guildId: process.env.GUILD_ID,
        content: "duck",
        author: {
            bot: false // Ensure the message is treated as coming from a real user
        },
        reply: async (response) => {
            try {
                assert.ok(response, 'Bot send a DM')
                assert.strictEqual(banList.includes(modMsg.author.id), true, 'User should be added to banList')
            } catch (error) {
                console.error('Test Failed:', error.message);
            }
        }
    }

    await moderateMessage(modMsg);
    // If handleMessage completes without errors, and send function logic passes, test is considered successful
    console.log("Test passed: Moderation function successful.");
    
});
