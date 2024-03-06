// ---------------------------------------------------------MODERATION-----------------------------------------------------------------------------
       
async function moderateMessage(openai, message, naughtyWords, banList) {
    const messageContentLowerCase = message.content.toLowerCase();
    const containsNaughtyWord = naughtyWords.some(keyword => messageContentLowerCase.includes(keyword));
    const moderation = await openai.moderations.create({ input: message.content });
    const flaggedByOpenAI = moderation.results[0].flagged;

    if (containsNaughtyWord || flaggedByOpenAI) {
        if (!banList.includes(message.author.id)) {
            banList.push(message.author.id);
            try {
                await message.author.send('Please refrain from using naughty or inappropriate words.');
            } catch (error) {
                console.error(`Could not send DM to ${message.author.tag}.`, error);
            }
        }

        if (banList.includes(message.author.id)) {
            try {
                await message.delete();
            } catch (error) {
                console.error(`Could not delete message from ${message.author.tag}.`, error);
            }

            try {
                await message.guild.members.ban(message.author.id, { reason: 'Violating the ban list rules after being warned.' });
                console.log(`${message.author.tag} has been banned from the server.`);
            } catch (banError) {
                console.error(`Could not ban ${message.author.tag}:`, banError);
            }
        }
    }
}

// Export the moderation function
module.exports = { moderateMessage };