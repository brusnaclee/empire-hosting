const { ApplicationCommandOptionType } = require('discord.js');

module.exports = {
  name: 'report',
  description: 'Send a bug report to the developer.',
  options: [
    {
      name: 'bugs_appear',
      description: 'Describe the bugs that appear.',
      type: ApplicationCommandOptionType.String,
      required: true
    },
    {
      name: 'should_happen',
      description: 'Describe what should happen instead.',
      type: ApplicationCommandOptionType.String,
      required: false
    },
    {
      name: 'attachment',
      description: 'Attach an image or video link (optional).',
      type: ApplicationCommandOptionType.String,
      required: false
    }
  ],
  run: async (client, interaction) => {
    const bugsAppear = interaction.options.getString('bugs_appear');
    const shouldHappen = interaction.options.getString('should_happen');
    const attachmentLink = interaction.options.getString('attachment');

    // Mengambil informasi pengguna dan server
    const user = interaction.user;
    const guild = interaction.guild;
    const channel = interaction.channel;

    // Membuat pesan dengan informasi yang diinginkan
    let content = `**User**: ${user.tag} (${user.id})\n\n` +
      `**Server**: ${guild.name} (${guild.id})\n\n` +
      `**Channel**: ${channel.name} (${channel.id})\n\n` +
      `**Bugs that appear**: ${bugsAppear}\n\n` +
      `**That should happen**: ${shouldHappen || 'N/A'}`;

    // Mengirim pesan ke channel Discord dengan ID tertentu
    const channelId = '1108313712449831034';
    const reportChannel = client.channels.cache.get(channelId);
    try {
      if (attachmentLink) {
        content += `\n\n**Attachment Link**: ${attachmentLink}`;
      }
        
      await interaction.deferReply({ ephemeral: true });

      await reportChannel.send(content);

      await interaction.editReply({
        content: 'Bug report has been sent! Thank you for your feedback! <a:send:1117660959171956776> <a:Ceklis:1116989553744552007>',
        ephemeral: true
      });
    } catch (error) {
      console.error('Error sending bug report:', error);
      await interaction.editReply({
        content: 'An error occurred while sending the bug report. <a:alert:1116984255755599884>',
        ephemeral: true
      });
    }
  }
};
