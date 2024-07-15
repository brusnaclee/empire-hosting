const db = require('../mongoDB');
module.exports = {
	name: 'loop',
	description: 'Turns the music loop mode on or off.',
	permissions: '0x0000000000000800',
	options: [],
	voiceChannel: true,
	run: async (client, interaction) => {
		let lang = await db?.musicbot?.findOne({ guildID: interaction.guild.id });
		lang = lang?.language || client.language;
		lang = require(`../languages/${lang}.js`);
		try {
			const {
				EmbedBuilder,
				ActionRowBuilder,
				ButtonBuilder,
				ButtonStyle,
			} = require('discord.js');
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

			let button = new ActionRowBuilder().addComponents(
				new ButtonBuilder()
					.setLabel(lang.msg35)
					.setStyle(ButtonStyle.Secondary)
					.setCustomId('queue'),
				new ButtonBuilder()
					.setLabel(lang.msg36)
					.setStyle(ButtonStyle.Secondary)
					.setCustomId('nowplaying'),
				new ButtonBuilder()
					.setLabel(lang.msg37)
					.setStyle(ButtonStyle.Danger)
					.setCustomId('close')
			);

			const embed = new EmbedBuilder()
				.setColor(client.config.embedColor)
				.setTitle(lang.msg38)
				.setDescription(lang.msg39)
				.setTimestamp()
				.setFooter({ text: `Empire ❤️` });
			interaction
				?.reply({ embeds: [embed], components: [button], fetchReply: true })
				.then(async (Message) => {
					const filter = (i) => i.user.id === interaction.user.id;
					let col = await Message.createMessageComponentCollector({
						filter,
						time: 180000,
					});

					col.on('collect', async (button) => {
						if (button.user.id !== interaction.user.id) return;
						const queue1 = client.player.getQueue(interaction.guild.id);
						if (!queue1 || !queue1.playing) {
							await interaction
								?.editReply({
									content: `${lang.msg5} <a:alert:1116984255755599884>`,
									ephemeral: true,
								})
								.catch((e) => {});
							await button?.deferUpdate().catch((e) => {});
						}
						switch (button.customId) {
							case 'queue':
								const success = queue.setRepeatMode(2);
								const color1 = new EmbedBuilder()
									.setColor('00FF7D')
									.setTitle(lang.msg38)
									.setDescription(lang.msg39)
									.setTimestamp()
									.setFooter({ text: `Empire ❤️` });
								interaction
									?.editReply({
										embeds: [color1],
										content: `${lang.msg40} <a:Ceklis:1116989553744552007>`,
									})
									.catch((e) => {});
								await button?.deferUpdate().catch((e) => {});
								break;
							case 'nowplaying':
								const success2 = queue.setRepeatMode(1);
								const color2 = new EmbedBuilder()
									.setColor('00FF7D')
									.setTitle(lang.msg38)
									.setDescription(lang.msg39)
									.setTimestamp()
									.setFooter({ text: `Empire ❤️` });
								interaction
									?.editReply({
										embeds: [color2],
										content: `${lang.msg42} <a:Ceklis:1116989553744552007>`,
									})
									.catch((e) => {});
								await button?.deferUpdate().catch((e) => {});
								break;
							case 'close':
								const color3 = new EmbedBuilder()
									.setColor('#FF0000')
									.setTitle(lang.msg38)
									.setDescription(lang.msg39)
									.setTimestamp()
									.setFooter({ text: `Empire ❤️` });
								if (queue.repeatMode === 0) {
									await button?.deferUpdate().catch((e) => {});
									return interaction
										?.editReply({
											embeds: [color3],
											content: `${lang.msg43} <a:Cross:1116983956227772476>`,
											ephemeral: true,
										})
										.catch((e) => {});
								}
								const success4 = queue.setRepeatMode(0);
								interaction
									?.editReply({
										embeds: [color3],
										content: `${lang.msg44} <a:alert:1116984255755599884>`,
									})
									.catch((e) => {});
								await button?.deferUpdate().catch((e) => {});
								break;
						}
					});
					col.on('end', async (button) => {
						button = new ActionRowBuilder().addComponents(
							new ButtonBuilder()
								.setStyle(ButtonStyle.Secondary)
								.setLabel(lang.msg45)
								.setCustomId('timeend')
								.setDisabled(true)
						);

						const embed = new EmbedBuilder()
							.setColor('#FF0000')
							.setTitle(lang.msg46)
							.setTimestamp()
							.setFooter({ text: `Empire ❤️` });

						await interaction
							?.editReply({
								content: '',
								embeds: [embed],
								components: [button],
							})
							.then(() => {
								setTimeout(async () => {
									await interaction
										.deleteReply()
										.catch((err) => console.error(err));
								}, 120000); // 120 seconds or 2 minute
							})
							.catch((e) => {});
					});
				})
				.catch((e) => {});
		} catch (e) {
			const errorNotifer = require('../functions.js');
			errorNotifer(client, interaction, e, lang);
		}
	},
};
