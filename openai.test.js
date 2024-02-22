// Import necessary modules and files
const { handleMessage } = require('./index.js'); // Assuming your handleMessage function is exported from index.js

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
