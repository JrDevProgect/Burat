process.on('unhandledRejection', error => console.log(error));
process.on('uncaughtException', error => console.log(error));

const fs = require('fs');
const path = require('path');
const login = require('fca-priyansh');
const express = require('express');

const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));

global.prefix = config.prefix || "!";
global.modules = {
  commands: new Map(),
  events: new Map(),
  cooldown: new Map()
};

global.adminBot = config.adminBot || [];

global.botStartTime = Date.now();

const loadCommands = () => {
  const commandFiles = fs.readdirSync(path.join(__dirname, 'modules', 'cmds')).filter(file => file.endsWith('.js'));
  commandFiles.forEach(file => {
    const command = require(path.join(__dirname, 'modules', 'cmds', file));
    global.modules.commands.set(command.name, command);
  });
};

const loadEvents = () => {
  const eventFiles = fs.readdirSync(path.join(__dirname, 'modules', 'events')).filter(file => file.endsWith('.js'));
  eventFiles.forEach(file => {
    const event = require(path.join(__dirname, 'modules', 'events', file));
    global.modules.events.set(event.name, event);
  });
};

loadCommands();
loadEvents();

const app = express();
const PORT = config.port || 3000;

app.get('/', (req, res) => {
  const uptime = Date.now() - global.botStartTime;
  const seconds = Math.floor(uptime / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  const uptimeMessage = `Uptime: ${days} days, ${hours % 24} hours, ${minutes % 60} minutes, and ${seconds % 60} seconds.`;

  res.json({ uptime: uptimeMessage });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

login({ appState: JSON.parse(fs.readFileSync('appstate.json', 'utf8')) }, (err, api) => {
  if (err) return console.error('Error during login:', err);

  api.setOptions(config.apiOptions);

  api.listenMqtt(async (err, event) => {
    if (err) {
      console.error(`Error listening to MQTT: ${err}`);
      return;
    }

    try {
      const message = event.body ?? "";
      const isPrefixed = message.startsWith(global.prefix);

      let commandName = "";
      let args = [];

      if (isPrefixed) {
        [commandName, ...args] = message.slice(global.prefix.length).trim().split(/ +/g);
      } else {
        [commandName, ...args] = message.trim().split(/ +/g);
      }

      const command = global.modules.commands.get(commandName) || global.modules.commands.get(commandName.toLowerCase());

      if (command) {
        if (isPrefixed && command.prefixRequired === false) {
          api.sendMessage(`This command does not require a prefix.`, event.threadID, event.messageID);
        } else if (!isPrefixed && command.prefixRequired === true) {
          api.sendMessage(`This command requires a prefix to start.`, event.threadID, event.messageID);
        } else if (command.adminOnly && !global.adminBot.includes(event.senderID)) {
          api.sendMessage(`Only bot admins have access to this command.`, event.threadID, event.messageID);
        } else {
          try {
            await command.execute(api, event, args, global.modules.commands, api);
          } catch (error) {
            console.error(`Command execution error: ${error}`);
          }
        }
      } else if (isPrefixed) {
        api.sendMessage(`The command "${commandName}" does not exist. Please type ${global.prefix}help to see the list of commands.`, event.threadID, event.messageID);
      }
    } catch (error) {
      console.error('Error handling event:', error);
    }
  });
});
