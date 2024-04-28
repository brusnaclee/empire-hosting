const { ApplicationCommandOptionType, MessageBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
  name: 'suggestion',
  description: 'Send a suggestion to the developer.',
  options: [
    {
      name: 'content',
      description: 'The suggestion content.',
      type: ApplicationCommandOptionType.String,
      required: true
    }
  ],
  run: async (client, interaction) => {
    const suggestion = interaction.options.getString('content');

    // Mengambil informasi pengguna dan server
    const user = interaction.user;
    const guild = interaction.guild;

    // Membuat pesan dengan informasi yang diinginkan
    const content = `> **Nama User**: ${user.username} (ID: ${user.id})\n\n` +
      `> **Nama Server**: ${guild.name} (ID: ${guild.id})\n\n` +
      `> **Waktu Dikirim**: ${new Date().toString()}\n\n` +
      `> **Isi Pesan**: ${suggestion}`;

    // Mengirim pesan ke webhook Discord
    const webhookURL = 'https://discord.com/api/webhooks/1112392388141391993/R4-VKrOeQEohLkeBwPOP4gllkwedQAdRnV30-3zu4BqnEk1JyD5Vj5MXpmbKa26suD6L'; // Ganti dengan URL webhook Discord Anda
    try {
      await interaction.deferReply({ ephemeral: true });
      await axios.post(webhookURL, { content });
      await interaction.editReply({ content: 'Suggestion has been sent! <a:send:1117660959171956776> <a:Ceklis:1116989553744552007>', ephemeral: true });
    } catch (error) {
      console.error('<a:Cross:1116983956227772476> Error sending suggestion: ', error);
      await interaction.editReply({ content: 'An error occurred while sending the suggestion.', ephemeral: true });
    }
  }
};
