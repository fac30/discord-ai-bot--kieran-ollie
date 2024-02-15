require('dotenv/config');
const { SlashCommandBuilder } = require('discord.js');
const { OpenAI }  = require('openai');
const openai = new OpenAI(process.env.OPENAI_API_KEY);

module.exports = {
    // Slash command parameters
    data: new SlashCommandBuilder()
        .setName('dm')
        .setDescription('Direct messages the response instead.')
        .addStringOption(option =>
            option.setName('prompt')
                .setDescription('The prompt for generating the response.')
                .setRequired(true)),
    // Execute function for handling command
    async execute(interaction) {
        try {
            console.log('Interaction options: ', interaction.options)
            await interaction.deferReply(); // Defer reply to prevent timeout
            
            // Retrieve user prompt
            const prompt = interaction.options.getString('prompt');
            if (!prompt) {
                // Ask for prompt if not provided
                await interaction.editReply('Please provide a prompt.');
                return;
            }
            // Call OpenAI API to generate response from prompt
            const result = await openai.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: [
                    { role: 'system', content: "You are a friendly chatbot that speaks only in limericks." }, // Supply the same system prompt as in index.js
                    { role: 'user', content: prompt } // Also supply user prompt
                ]
            });

            // Create conversation log with both prompts
            let conversationLog = [];
            conversationLog.push({
                role: 'user',
                content: prompt // Use the prompt provided by the user
            });

            const response = result['choices'][0]['message']['content']; // Retrieve generated response
            await interaction.user.send(response); // Send to user via DM
            await interaction.editReply('Message sent to your DMs.'); // Send reply in channel that notifies of DM
            console.log('Result: ', result);
        } catch (error) {
            console.error('Error while calling OpenAI:', error);
            await interaction.editReply('There was an error while processing your request.');
        }
    },
};