module.exports = {
  name: "joinNoti",
  description: "Join notifications",

  async onEvent({ api, event }) {
    try {
      const { logMessageType, logMessageData, threadID } = event;

      if (logMessageType === "log:subscribe" && logMessageData.addedParticipants?.length > 0) {
        const addedParticipants = logMessageData.addedParticipants;
        const participantsList = addedParticipants.map(participant => participant.fullName || "New User").join(", ");

        const welcomeMessage = `Welcome to the group, ${participantsList}!, please read the group rules and follow them.`;

        await api.sendMessage(welcomeMessage, threadID);
      }
    } catch (error) {
      console.error('Error in joinNoti event:', error);
      api.sendMessage('An error occurred while processing the join notification.', event.threadID);
    }
  },
};