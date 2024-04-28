const { ApplicationCommandOptionType, DiscordAPIError } = require('discord.js');

module.exports = {
  name: 'sendmessage',
  description: 'Admin command.',
  options: [
    {
      name: 'serverid',
      description: 'The ID of the server to send the message to.',
      type: ApplicationCommandOptionType.String,
      required: true
    },
    {
      name: 'channelid',
      description: 'The ID of the channel to send the message to.',
      type: ApplicationCommandOptionType.String,
      required: true
    },
    {
      name: 'content',
      description: 'The message content.',
      type: ApplicationCommandOptionType.String,
      required: true
    }
  ],
  run: async (client, interaction) => {
      
      if (!client.config.ownerID.includes(interaction?.user?.id)) {
            return interaction
                .reply({
                    content: "You don't have permission to use this command.",
                    ephemeral: true,
                })
                .catch((e) => {});
        } 
      
    const serverId = interaction.options.getString('serverid');
    const channelId = interaction.options.getString('channelid');
    const messageContent = interaction.options.getString('content');

    // Mendapatkan server berdasarkan ID yang diberikan
    const server = client.guilds.cache.get(serverId);

    await interaction.deferReply({ ephemeral: true });

    // Memeriksa apakah bot ada di server yang ditentukan
    if (!server) {
      await interaction.editReply({ content: 'Bot is not in the specified server. <a:Cross:1116983956227772476>', ephemeral: true });
      return;
    }

    // Mendapatkan channel berdasarkan ID yang diberikan
    const channel = server.channels.cache.get(channelId);

    // Memeriksa apakah channel valid
    if (!channel) {
      await interaction.editReply({ content: 'Invalid channel ID. <a:Cross:1116983956227772476>', ephemeral: true });
      return;
    }

    try {
      // Mengirim pesan ke channel yang ditentukan
      await channel.send(messageContent);
      await interaction.editReply({ content: 'Message has been sent! <a:send:1117660959171956776><a:Ceklis:1116989553744552007>', ephemeral: true });
    } catch (error) {
      if (error instanceof DiscordAPIError && error.code === 50013) {
        await interaction.editReply({ content: 'Bot does not have permission to send messages in the specified channel. <a:Cross:1116983956227772476>', ephemeral: true });
      } else {
        console.error('Error sending message:', error);
        await interaction.editReply({ content: 'An error occurred while sending the message. <a:Cross:1116983956227772476>', ephemeral: true });
      }
    }
  }
};
