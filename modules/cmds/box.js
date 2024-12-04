const axios = require('axios');

module.exports = {
  name: 'box',
  description: 'ask anything on blackbox',
  prefixRequired: true,
  adminOnly: false,
  cooldown: 5,
  execute: async (api, event, args) => {
    try {
      const queryText = args.join(' ') || 'Hi';
      const url = `https://api.kenliejugarap.com/blackbox/?text=${encodeURIComponent(queryText)}`;
      
      const response = await axios.get(url);
      
      if (response.data.status) {
        api.sendMessage(response.data.response, event.threadID, event.messageID);
      } else {
        api.sendMessage("There was an issue retrieving the data. Please try again later.", event.threadID, event.messageID);
      }
    } catch (error) {
      console.error(`Error fetching from API: ${error.message}`);
      api.sendMessage("An error occurred while fetching the data. Please try again later.", event.threadID, event.messageID);
    }
  }
};
