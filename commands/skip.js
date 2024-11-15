const { ApplicationCommandOptionType, EmbedBuilder } = require('discord.js');
const db = require('../mongoDB');

module.exports = {
	name: 'skip',
	description: 'Skip the music currently played.',
	permissions: '0x0000000000000800',
	options: [
		{
			name: 'number',
			description: 'Type how many songs you want to skip.',
			type: ApplicationCommandOptionType.Number,
			required: false,
		},
	],
	voiceChannel: true,
	run: async (client, interaction) => {
		let lang = await db?.musicbot?.findOne({ guildID: interaction.guild.id });
		lang = lang?.language || client.language;
		lang = require(`../languages/${lang}.js`);

		try {
			const queue = client.player.getQueue(interaction.guild.id);
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

			let number = interaction.options.getNumber('number');
			if (number) {
				if (!queue.songs.length > number)
					return interaction
						.reply({
							content: `${lang.msg82} <a:Cross:1116983956227772476>`,
							ephemeral: true,
						})
						.catch((e) => {});
				if (isNaN(number))
					return interaction
						.reply({ content: lang.msg130, ephemeral: true })
						.catch((e) => {});
				if (1 > number)
					return interaction
						.reply({ content: lang.msg130, ephemeral: true })
						.catch((e) => {});

				try {
					let old = queue.songs[0];
					await client.player.jump(interaction, number).then((song) => {
						const embed = new EmbedBuilder()
							.setColor('00FF7D')
							.setThumbnail(queue.songs[0].thumbnail)
							.setTimestamp()
							.setDescription(
								`**${old.name}**, ${lang.msg83} <a:Ceklis:1116989553744552007>`
							)
							.setFooter({ text: `Empire ❤️` });

						interaction
							.reply({ embeds: [embed] })
							.then(() => {
								setTimeout(async () => {
									await interaction
										.deleteReply()
										.catch((err) => console.error(err));
								}, 300000); // 300 seconds
							})
							.catch((e) => {});
					});
				} catch (e) {
					return interaction
						.reply({
							content: `${lang.msg63} <a:alert:1116984255755599884>`,
							ephemeral: true,
						})
						.catch((e) => {});
				}
			} else {
				try {
					let old = queue.songs[0];
					const success = await queue.skip();

					const embed = new EmbedBuilder()
						.setColor('00FF7D')
						.setThumbnail(queue.songs[0].thumbnail)
						.setTimestamp()
						.setDescription(
							success
								? `**${old.name}**, ${lang.msg83} <a:Ceklis:1116989553744552007>`
								: `${lang.msg41} <a:Cross:1116983956227772476>`
						)
						.setFooter({ text: `Empire ❤️` });

					interaction
						.reply({ embeds: [embed] })
						.then(() => {
							setTimeout(async () => {
								await interaction
									.deleteReply()
									.catch((err) => console.error(err));
							}, 300000); // 300 seconds
						})
						.catch((e) => {});
				} catch (e) {
					return interaction
						.reply({
							content: `${lang.msg63} <a:alert:1116984255755599884>`,
							ephemeral: true,
						})
						.catch((e) => {});
				}
			}
		} catch (e) {
			const errorNotifer = require('../functions.js');
			errorNotifer(client, interaction, e, lang);
		}
	},
};
