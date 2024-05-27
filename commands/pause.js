const db = require('../mongoDB');
const config = require('../config.js');
const {
	ApplicationCommandOptionType,
	EmbedBuilder,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
} = require('discord.js');

module.exports = {
	name: 'pause',
	description: 'Stops playing the currently playing music.',
	permissions: '0x0000000000000800',
	options: [],
	voiceChannel: true,
	run: async (client, interaction) => {
		const queue = client.player.getQueue(interaction.guild.id);
		let lang = await db?.musicbot?.findOne({ guildID: interaction.guild.id });
		lang = lang?.language || client.language;
		lang = require(`../languages/${lang}.js`);

		try {
			if (!queue || !queue.playing)
				return interaction
					.reply({
						content: `${lang.msg5} <a:alert:1116984255755599884>`,
						ephemeral: true,
					})
					.catch((e) => {});

			if (!interaction?.member?.voice?.channelId)
				return interaction
					?.reply({
						content: `${lang.message1} <a:alert:1116984255755599884>`,
						ephemeral: true,
					})
					.then(() => {
						setTimeout(async () => {
							await interaction
								.deleteReply()
								.catch((err) => console.error(err));
						}, 5000); // 5 second
					})
					.catch((e) => {});
			const guild_me = interaction?.guild?.members?.cache?.get(
				client?.user?.id
			);
			if (guild_me?.voice?.channelId) {
				if (
					guild_me?.voice?.channelId !== interaction?.member?.voice?.channelId
				) {
					return interaction
						?.reply({
							content: `${lang.message2} <a:alert:1116984255755599884>`,
							ephemeral: true,
						})
						.then(() => {
							setTimeout(async () => {
								await interaction
									.deleteReply()
									.catch((err) => console.error(err));
							}, 5000); // 5 second
						})
						.catch((e) => {});
				}
			}

			const success = queue.pause();
			const successEmoji = '<a:Ceklis:1116989553744552007>';
			const failureEmoji = '<a:Cross:1116983956227772476>';
			const embed = new EmbedBuilder()
				.setColor('00FF7D')
				.setThumbnail(queue.songs[0].thumbnail)
				.setTimestamp()
				.setDescription(
					success
						? `**${queue.songs[0].name}** - ${lang.msg48}${successEmoji}`
						: lang.msg41 + failureEmoji
				)
				.setFooter({ text: 'Empire ❤️' });

			const resumesButton = new ButtonBuilder()
				.setCustomId('resumes_button')
				.setLabel('Resume')
				.setStyle(ButtonStyle.Success);

			const actionRow = new ActionRowBuilder().addComponents(resumesButton);
			await interaction.reply({
				embeds: [embed],
				components: [actionRow],
			});

			// Handle button interaction
			client.on('interactionCreate', async (interaction) => {
				if (
					!interaction.isButton() ||
					interaction.customId !== 'resumes_button'
				)
					return;

				if (!queue)
					return interaction
						.reply({
							content: `${lang.msg63} <a:alert:1116984255755599884>`,
							ephemeral: true,
						})
						.then(() => {
							setTimeout(async () => {
								await interaction
									.deleteReply()
									.catch((err) => console.error(err));
							}, 5000); // 5 second
						})
						.catch((e) => {});

				if (!interaction?.member?.voice?.channelId)
					return interaction
						?.reply({
							content: `${lang.message1} <a:alert:1116984255755599884>`,
							ephemeral: true,
						})
						.then(() => {
							setTimeout(async () => {
								await interaction
									.deleteReply()
									.catch((err) => console.error(err));
							}, 5000); // 5 second
						})
						.catch((e) => {});
				const guild_me = interaction?.guild?.members?.cache?.get(
					client?.user?.id
				);
				if (guild_me?.voice?.channelId) {
					if (
						guild_me?.voice?.channelId !== interaction?.member?.voice?.channelId
					) {
						return interaction
							?.reply({
								content: `${lang.message2} <a:alert:1116984255755599884>`,
								ephemeral: true,
							})
							.then(() => {
								setTimeout(async () => {
									await interaction
										.deleteReply()
										.catch((err) => console.error(err));
								}, 5000); // 5 second
							})
							.catch((e) => {});
					}
				}

				if (!queue.paused)
					return interaction
						.reply({ content: lang.msg132, ephemeral: true })
						.catch((e) => {});
				const success = queue.resume();
				const successEmoji = '<a:Ceklis:1116989553744552007>';
				const failureEmoji = '<a:Cross:1116983956227772476>';
				const embed = new EmbedBuilder()
					.setColor('00FF7D')
					.setThumbnail(queue.songs[0].thumbnail)
					.setTimestamp()
					.setDescription(
						success
							? `**${queue.songs[0].name}**, ${lang.msg72}${successEmoji}`
							: lang.msg71 + failureEmoji
					)
					.setFooter({ text: 'Empire ❤️' });

				return interaction
					.reply({ embeds: [embed] })
					.then(() => {
						setTimeout(async () => {
							await interaction
								.deleteReply()
								.catch((err) => console.error(err));
						}, 60000); // 60 second
					})
					.catch((e) => {});
			});

			// Check if music is not playing and keep checking until it's resumed
			while (!queue.playing) {
				await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second before checking again
			}

			await interaction.deleteReply(); // Delete the initial reply
		} catch (e) {
			const errorNotifer = require('../functions.js');
			errorNotifer(client, interaction, e, lang);
		}
	},
};
