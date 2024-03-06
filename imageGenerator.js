const axios = require('axios');
require('dotenv/config');

//---------------------------------------------------------GENERATE IMAGE FUNCTION---------------------------------------------------------------------
async function generateImage(prompt) {
    try {
        console.log('Generating image with prompt:', prompt);

        const response = await axios.post(
            'https://api.openai.com/v1/images/generations',
            {
                prompt: prompt,
                n: 1,
                size: "1024x1024",
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                    'Content-Type': 'application/json',
                },
            }
        );
        console.log('Response received:', response.data);

        if (response.data && response.data.data && response.data.data.length > 0) {
            const imageData = response.data.data[0].url;
            return imageData;
        } else {
            throw new Error('Failed to generate image');
        }
    } catch (error) {
        console.error('Error generating image:', error);
        console.error(error);
        return null;
    }
}

module.exports =  generateImage;