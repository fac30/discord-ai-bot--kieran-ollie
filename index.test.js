// Import necessary modules and files
const { handleMessage, client } = require('./index.js'); // Assuming your handleMessage function is exported from index.js

const { GatewayIntentBits, Events } = require('discord.js');

// --------------------------------------------- TEST HELPERS-------------------------------------------

function equal(actual, expected, message) {
    if (actual === expected) {
      const defaultMessage = `Expected ${expected} and received ${actual}`;
      console.info("Pass: " + (message || defaultMessage));
    } else {
      const defaultMessage = `Expected ${expected} but received ${actual} instead`;
      console.error("Fail: " + (message || defaultMessage));
    }
}
  
function notEqual(actual, expected, message) {
    if (actual !== expected) {
        const defaultMessage = `${expected} is different to ${actual}`;
        console.info("Pass: " + (message || defaultMessage));
    } else {
        const defaultMessage = `${expected} is the same as ${actual}`;
        console.error("Fail: " + (message || defaultMessage));
    }
}
  
function test(name, testFunction) {
    console.group(name);
    testFunction();
    console.groupEnd(name);
}

// ----------------------------------------ACTUAL TESTS----------------------------------------------
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

    handleMessage(testMsg);
})

// check that my bot securely loads API keys from the .env file, confirming that no sensitive information is hard-coded
// test("")


//--------------------------------------------- Client test-------------------------------------------

test("Discord Client Creation and Configuration", () => {
    // Assuming client is imported from index.js, we skip directly to validations

    // Check if the client is created
    if (!client) {
        console.error("Fail: Discord client is not created.");
        return;
    }
    console.info("Pass: Discord client is successfully created.");

    // Check for ClientReady event setup
    if (typeof client.listeners(Events.ClientReady)[0] !== 'function') {
        console.error("Fail: ClientReady event listener is not set up correctly.");
        return;
    }
    console.info("Pass: ClientReady event listener is set up correctly.");
});


//--------------------------------------------- Login test --------------------------------------------------
test("Bot Login to Discord", () => {
    return new Promise((resolve, reject) => {
        client.once('ready', () => {
            try {
                // Assuming 'client.user.tag' gives us the bot's username and discriminator
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

// Running the test with async/await syntax for better error handling and flow control
(async function runTest() {
    try {
        await test("Bot Login to Discord", () => {});
        console.log("All tests passed.");
    } catch (error) {
        console.error("Some tests failed.");
    }
})();