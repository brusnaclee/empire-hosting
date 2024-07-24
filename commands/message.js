const {
	ApplicationCommandOptionType,
	DiscordAPIError,
	EmbedBuilder,
} = require('discord.js');

module.exports = {
	name: 'msg',
	description: 'Developer command.',
	options: [
		{
			name: 'userid',
			description: 'The ID of the user.',
			type: ApplicationCommandOptionType.String,
			required: true,
		},
		{
			name: 'title',
			description: 'The title of the embed.',
			type: ApplicationCommandOptionType.String,
			required: true,
		},
		{
			name: 'description',
			description: 'The description of the embed.',
			type: ApplicationCommandOptionType.String,
			required: true,
		},
	],
	permissions: '0x0000000000000800',
	run: async (client, interaction) => {
		if (!client.config.ownerID2.includes(interaction.user.id)) {
			await interaction.reply({
				content: "You don't have permission to use this command.",
				ephemeral: true,
			});
			return;
		}

		const userId = interaction.options.getString('userid');
		const title = interaction.options.getString('title');
		const description = interaction.options.getString('description');

		try {
			// Mendapatkan user berdasarkan ID yang diberikan
			const user = await client.users.fetch(userId);

			// Membuat objek embed
			const embed = new EmbedBuilder()
				.setTitle(title)
				.setDescription(description)
				.setColor(client.config.embedColor);

			// Mengirim pesan dengan embed ke user yang ditentukan
			await user.send({ embeds: [embed] });
			await interaction.reply({
				content: 'Message has been sent!',
				ephemeral: true,
			});
		} catch (error) {
			console.error('Error sending message:', error);
			await interaction.reply({
				content: 'An error occurred while sending the message.',
				ephemeral: true,
			});
		}
	},
};
