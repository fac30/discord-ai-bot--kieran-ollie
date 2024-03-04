// import client and handleMessage from index.js
const { handleMessage, client } = require('./index.js'); 

// import intents and events from discord.js
const { GatewayIntentBits, Events } = require('discord.js');

// Assuming equal is from an assertion library you're using
const { equal } = require('assert'); // Ensure to import or define this function based on your actual testing framework

//--------------------------------------------- Client test-------------------------------------------

test("Discord Client Creation and Configuration", async () => {
    try {
        // Check if the client is created
        if (!client) {
            throw new Error("Discord client is not created.");
        }
        console.info("Pass: Discord client is successfully created.");

        // Check for ClientReady event setup
        if (typeof client.listeners('ready')[0] !== 'function') {
            throw new Error("ClientReady event listener is not set up correctly.");
        }
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
                equal(typeof client.user.tag, 'string', "Bot's user tag should be a string");
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
                equal(msg.content, testMsg, "Bot should send a DM to the user");
                console.info("Pass: Bot has sent a DM to the user.");
                resolve();
            } catch (error) {
                console.error("Fail: " + error.message);
                reject(error);
            }
        });
    });
});
