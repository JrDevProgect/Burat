const axios = require('axios');

module.exports = {
    name: "ai",
    description: "Ask questions to the AI and get a response.",
    prefixRequired: true,
    adminOnly: false,
    async execute(api, event, args) {
        const { threadID, messageID } = event;
        
        if (args.length === 0) {
            return api.sendMessage("Please provide a question for the AI.", threadID, messageID);
        }

        const question = args.join(' ');
        const userID = event.senderID;  // Using the sender's ID as the userID

        try {
            const response = await axios.get('https://yt-video-production.up.railway.app/gpt4-omni', {
                params: {
                    ask: question,
                    userid: userID
                }
            });

            if (response.data.status === "true") {
                const answer = response.data.response;
                await api.sendMessage(answer, threadID, messageID);
            } else {
                await api.sendMessage("Sorry, there was an issue with fetching the AI response. Please try again later.", threadID, messageID);
            }
        } catch (error) {
            console.error('Error fetching AI response:', error);
            await api.sendMessage("An error occurred while processing your request. Please try again later.", threadID, messageID);
        }
    },
};
