// require assert module
const assert = require('assert');

//import test library
const { test } = require('node:test');

// import client and handleMessage from index.js
const { handleMessage, client } = require('../index.js'); 

// import intents and events from discord.js
const { GatewayIntentBits, Events } = require('discord.js');

// Import assert module
const { equal } = require('assert'); 
//--------------------------------------------- Client test-------------------------------------------

test("Discord Client Creation and Configuration", async () => {
    try {
        // Assert that the client is created 
        assert.ok(client, "Discord client is not created.");
        console.info("Pass: Discord client is successfully created.");

        // Assert that the first 'ready' event listener is a function
        assert.strictEqual(typeof client.listeners('ready')[0], 'function', "ClientReady event listener is not set up correctly.");
        console.info("Pass: ClientReady event listener is set up correctly.");
    } catch (error) {
        console.error(`Fail: ${error.message}`);
    }
});


//--------------------------------------------- Login test --------------------------------------------------
test("Bot Login to Discord", () => {
    return new Promise((resolve, reject) => {
        client.once('ready', () => {
            try {
                // Use assert.strictEqual to compare the type of client.user.tag to 'string'
                assert.strictEqual(typeof client.user.tag, 'string', "Bot's user tag should be a string");
                console.info("Pass: Bot has logged in and is ready.");
                resolve();
            } catch (error) {
                console.error("Fail: " + error.message);
                reject(error);
            }
        });

        client.login(process.env.BOT_TOKEN).catch(error => {
            console.error("Fail: Bot login failed with error", error.message);
            reject(error);
        });
    });
});

// --------------------------------------------- DM test --------------------------------------------------

test("Bot DMs the user", () => {
    return new Promise((resolve, reject) => {
        const testMsg = 'DM from bot';

        client.once('messageCreate', msg => {
            try {
                if (msg.channel.type === 'DM') {
                    assert.strictEqual(msg.content, testMsg, "Bot should send a DM to the user");
                    console.info("Pass: Bot has sent a DM to the user.");
                    resolve();
                } else {
                    // Ignore messages not in DMs
                }
            } catch (error) {
                console.error("Fail: " + error.message);
                reject(error);
            }
        });

    });
});


