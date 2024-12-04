module.exports = {
  name: 'greet',
  execute: (event, api) => {
    if (event.body && event.body.toLowerCase().includes('hello')) {
      api.sendMessage('Hello! How can I assist you today?', event.threadID);
    }
  }
};
