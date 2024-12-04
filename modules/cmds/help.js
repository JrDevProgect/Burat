module.exports = {
    name: "help",
    description: "Lists all available commands.",
    prefixRequired: true,
    adminOnly: false,
    async execute(api, event, args, commands) {
        const { threadID, messageID } = event;

        let helpMessage = `Total Commands: ${commands.size.toString()}🏷\n\n`;

        let commandList = Array.from(commands.keys()).map((name, index) => {
            return `${index + 1}. 「 ${name} 」`;
        }).join('\n');

        helpMessage += commandList + `\n\n`;

        helpMessage += `Created By: ${global.owner || 'Jr Busaco'}`;

        await api.sendMessage(helpMessage, threadID, messageID);
    },
};