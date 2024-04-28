const { ApplicationCommandOptionType, EmbedBuilder } = require('discord.js');
const { exec } = require('child_process');

module.exports = {
	name: 'termux',
	description: 'Admin command.',
	options: [
		{
			name: 'command',
			description: 'The command to execute in Termux.',
			type: ApplicationCommandOptionType.String,
			required: true,
		},
	],
	run: async (client, interaction) => {
		// Pengecekan apakah pengguna adalah pemilik bot
		if (!client.config.ownerID.includes(interaction?.user?.id)) {
			return interaction
				.reply({
					content: "You don't have permission to use this command.",
					ephemeral: true,
				})
				.catch((e) => {});
		}

		const command = interaction.options.getString('command');

		await interaction.deferReply({ ephemeral: false });

		exec(command, (error, stdout, stderr) => {
			try {
				if (error) {
					console.error('Error executing command:', error);
					interaction.editReply({
						content: 'An error occurred while executing the command.',
						ephemeral: true,
					});
					return;
				}

				const output = stdout || stderr || 'Command executed successfully!';

				const embed = new EmbedBuilder()
					.setTitle('Command executed successfully!')
					.setDescription(`\`\`\`${output}\`\`\``)
					.setColor(client.config.embedColor)
					.setTimestamp()
					.setFooter({ text: `Empire ❤️` });

				interaction
					.editReply({ embeds: [embed] })
					.then(() => {
						setTimeout(async () => {
							await interaction
								.deleteReply()
								.catch((err) => console.error(err));
						}, 60000); // 60 seconds
					})
					.catch((e) => {});
			} catch (error) {
				const errorNotifier = require('../functions.js');
				errorNotifier(client, interaction, error);
			}
		});
	},
};
