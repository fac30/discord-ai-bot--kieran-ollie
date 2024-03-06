// Import necessary modules and files
const { test } = require('node:test');
require('dotenv/config');
const { AttachmentBuilder } = require('discord.js');
const { OpenAI }  = require('openai');
const naughtyWords = ['duck', 'spit']
const banList = [];
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Mock generateImage function
async function generateImage(prompt) {
    // Return a mock image URL
    return '';
}

// Mock message object for testing
const mockMessage = {
    author: {
        bot: false,
      },
    content: "!image", // Simulate message content
    channel: {
        send: async (content) => {
            console.log(content); // Log the content that would be sent
        }
}};

// handleMessage function from index.js
async function handleMessage(message) {
    console.log(`Message author bot status: ${message.author.bot}, Author details:`, message.author);
    // Prevent the bot from replying to its own messages
    if (message.author.bot) {
        // console.log("Exiting handleMessage: message is from a bot");
        return;
    }

    // Prevent the bot from replying to messages that start with the prefix !image
    if (message.content.startsWith('!image')) {
        // Extract the prompt from the message content
        const prompt = message.content.replace('!image ', '');

        // Return the image url from the generateImage function
        const imageUrl = await generateImage(prompt);

        // If the image url is not null, send the image in a DM to the user
        if (imageUrl) {
            const imageAttachment = new AttachmentBuilder(imageUrl, { name: 'generated-image.png' });
            // message.channel.send({ files: [imageAttachment] });
            message.author.send({ content: `Here's your generated image based on the description: "${prompt}"`,
            files: [imageAttachment]});
        } else {
            message.channel.send('Sorry, I was unable to generate an image.');
        }
    } else {
        // Initialise a conversation with system message
        let conversationLog = [{ role: 'system', content: "You are a friendly chatbot that speaks only in limericks." }];

        // Add user message to conversation log
        conversationLog.push({
            role: 'user',
            content: message.content
        });

        // Send typing indicator in channel
        await message.channel.sendTyping();

        try {
            // Call API to generate response
            const result = await openai.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: conversationLog.map(({ role, content }) => ({ role, content }))
            });

            // Log the result to see if it's populated
            console.log('Result:', result);

            // If a message is generated, send as reply
            if ((result['choices'][0]['message']['content'])) {
                console.log('Generated message:', result['choices'][0]['message']['content']);
                message.reply(result['choices'][0]['message']['content']);
            } else {
                console.log('No message generated.');
            }
        } catch (error) {
            console.error('Error while calling OpenAI:', error);
            return;
        }
    }

// ---------------------------------------------------------MODERATION-----------------------------------------------------------------------------
       

    // Convert message content to lower case to make the check case-insensitive
    const messageContentLowerCase = message.content.toLowerCase();

    // Check if the message contains any of the naughty words
    const containsNaughtyWord = naughtyWords.some(keyword => messageContentLowerCase.includes(keyword));

    // Use OpenAI automoderation to check for inappropriate content
    const moderation = await openai.moderations.create({ input: message.content });
    const flaggedByOpenAI = moderation.results[0].flagged;

    // If the message contains a naughty word or is flagged by OpenAI, add the user to the ban list and send a DM warning
    if (containsNaughtyWord || flaggedByOpenAI) {
        // Add user to ban list if not already added
        if (!banList.includes(message.author.id)) {
            banList.push(message.author.id);
            try {
                await message.author.send('Please refrain from using naughty or inappropriate words.');
            } catch (error) {
                console.error(`Could not send DM to ${message.author.tag}.`, error);
            }
        }

        // If the user is in the ban list and still uses a naughty word or flagged content
        if (banList.includes(message.author.id)) {
            // Delete the message
            try {
                await message.delete();
            } catch (error) {
                console.error(`Could not delete message from ${message.author.tag}.`, error);
            }

            // Ban the user from the server
            try {
                await message.guild.members.ban(message.author.id, { reason: 'Violating the ban list rules after being warned.' });
                console.log(`${message.author.tag} has been banned from the server.`);
            } catch (banError) {
                console.error(`Could not ban ${message.author.tag}:`, banError);
            }    
        }
    }
};

test("Testing handleMessage with image command and empty imageUrl", async () => {
    await handleMessage(mockMessage);
});

