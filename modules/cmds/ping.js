module.exports = {
  name: 'ping',
  description: 'Replies with Pong.',
  prefixRequired: true,  // Indicates the command needs a prefix
  adminOnly: false,  // Command is accessible to all users
  execute: async (api, event, args) => {
    api.sendMessage('Pong!', event.threadID);
  }
};
