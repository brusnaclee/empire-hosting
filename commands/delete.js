const { ApplicationCommandOptionType, EmbedBuilder } = require('discord.js');

module.exports = {
	name: 'dmsg',
	description: 'Delete messages sent by the bot.',
	options: [
		{
			name: 'userid',
			description: 'The ID of the user.',
			type: ApplicationCommandOptionType.String,
			required: true,
		},
		{
			name: 'count',
			description: 'The number of messages to delete.',
			type: ApplicationCommandOptionType.Integer,
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
		const count = interaction.options.getInteger('count');

		try {
			const user = await client.users.fetch(userId);
			const channel = await user.createDM();

			if (!channel) {
				await interaction.reply({
					content: 'User does not have an open DM channel.',
					ephemeral: true,
				});
				return;
			}

			const messages = await channel.messages.fetch({ limit: 100 });
			const botMessages = Array.from(
				messages.filter((msg) => msg.author.id === client.user.id).values()
			);

			const deleteCount = Math.min(count, botMessages.length);
			for (let i = 0; i < deleteCount; i++) {
				await botMessages[i].delete();
			}

			await interaction.reply({
				content: `Deleted ${deleteCount} message(s) sent by the bot.`,
				ephemeral: true,
			});
		} catch (error) {
			console.error('Error deleting messages:', error);
			await interaction.reply({
				content: 'An error occurred while deleting the messages.',
				ephemeral: true,
			});
		}
	},
};
