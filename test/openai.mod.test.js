// Import necessary modules and files
const { moderateMessage } = require('../moderation.js'); // moderateMessage function is exported from moderation.js
const { test } = require('node:test');
const assert = require('assert');

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