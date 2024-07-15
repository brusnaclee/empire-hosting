const { EmbedBuilder } = require('discord.js');

module.exports = {
	name: 'cv',
	description: 'Admin command.',
	permissions: '0x0000000000000800',
	run: async (client, interaction) => {
		if (!client.config.ownerID.includes(interaction?.user?.id)) {
			return interaction
				.reply({
					content: "You don't have permission to use this command.",
					ephemeral: true,
				})
				.catch((e) => {});
		}

		const botChannelInfo = [];

		// Memeriksa apakah bot sedang terhubung ke saluran suara pada setiap server
		client.guilds.cache.forEach((guild) => {
			const botVoiceChannel = guild.voiceStates.cache.get(client.user.id);

			if (botVoiceChannel && botVoiceChannel.channel) {
				// Mengambil nama saluran suara dan nama server
				const channelName = botVoiceChannel.channel.name;
				const guildName = guild.name;

				// Menambahkan informasi saluran suara dan server ke dalam array
				botChannelInfo.push(`${channelName} - ${guildName}`);
			}
		});

		// Membuat pesan embed dengan informasi saluran suara yang bot masuki
		const embed = new EmbedBuilder()
			.setTitle("Bot's Voice Channel Info")
			.setColor(client.config.embedColor)
			.setDescription(
				botChannelInfo.length
					? botChannelInfo.join('\n')
					: 'Bot is not in a voice channel in any server.'
			)
			.setTimestamp()
			.setFooter({ text: `Empire ❤️` });

		try {
			await interaction.deferReply({ ephemeral: false });
			await interaction.editReply({ embeds: [embed], ephemeral: false });
		} catch (error) {
			const errorNotifier = require('../functions.js');
			errorNotifier(client, interaction, error, lang);
		}
	},
};
