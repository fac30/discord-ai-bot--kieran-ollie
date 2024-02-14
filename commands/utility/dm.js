require('dotenv/config');
const { SlashCommandBuilder } = require('discord.js');
const { OpenAI }  = require('openai');
const openai = new OpenAI(process.env.OPENAI_KEY);

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dm')
        .setDescription('Direct messages the response instead.')
        .addStringOption(option =>
            option.setName('prompt')
                .setDescription('The prompt for generating the response.')
                .setRequired(true)),
    async execute(interaction) {
        try {
            console.log('Interaction options: ', interaction.options)
            await interaction.deferReply();
            const prompt = interaction.options.getString('prompt');
            if (!prompt) {
                await interaction.editReply('Please provide a prompt.');
                return;
            }

            const result = await openai.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: [
                    { role: 'system', content: "You are a friendly chatbot that speaks only in limericks." },
                    { role: 'user', content: prompt }
                ]
            });

            let conversationLog = [
                { role: 'system', content: "You are a friendly chatbot that speaks only in limericks." }
            ];
            
            conversationLog.push({
                role: 'user',
                content: prompt // Use the prompt provided by the user
            });

            const response = result['choices'][0]['message']['content'];
            await interaction.user.send(response);
            await interaction.editReply('Message sent to your DMs.');
            console.log('Result: ', result);
        } catch (error) {
            console.error('Error while calling OpenAI:', error);
            await interaction.editReply('There was an error while processing your request.');
        }
    },
};