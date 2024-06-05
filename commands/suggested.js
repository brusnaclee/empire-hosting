// suggest.js
const {
	EmbedBuilder,
	ButtonBuilder,
	ActionRowBuilder,
	ButtonStyle,
} = require('discord.js');
const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const db = require('../mongoDB');

module.exports = {
	name: 'suggest',
	description: 'Suggest a song by AI.',
	options: [],
	permissions: '0x0000000000000800',
	run: async (client, interaction) => {
		try {
			let lang = await db?.musicbot
				?.findOne({ guildID: interaction.guild.id })
				.catch((e) => {});
			lang = lang?.language || client.language;
			lang = require(`../languages/${lang}.js`);

			await interaction.deferReply({
				content: 'loading',
			});

			// Dapatkan queue
			const queue = client.player.getQueue(interaction.guild.id);

			// Pastikan queue dan songHistory10 ada
			if (!queue || !queue.songHistory10 || queue.songHistory10.length <= 0) {
				return interaction
					.editReply({
						content: `${lang.msg5} <a:alert:1116984255755599884>`,
						ephemeral: true,
					})
					.then(() => {
						setTimeout(async () => {
							await interaction
								.deleteReply()
								.catch((err) => console.error(err));
						}, 5000); // 5 detik
					});
			}

			if (!interaction?.member?.voice?.channelId)
				return interaction
					.editReply({
						content: `${lang.message1} <a:alert:1116984255755599884>`,
						ephemeral: true,
					})
					.then(() => {
						setTimeout(async () => {
							await interaction
								.deleteReply()
								.catch((err) => console.error(err));
						}, 5000); // 5 detik
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
						.editReply({
							content: `${lang.message2} <a:alert:1116984255755599884>`,
							ephemeral: true,
						})
						.then(() => {
							setTimeout(async () => {
								await interaction
									.deleteReply()
									.catch((err) => console.error(err));
							}, 5000); // 5 detik
						})
						.catch((e) => {});
				}
			}

			const MODEL_NAME = 'gemini-pro';
			const key = client.config.GEMINI;
			const genAI = new GoogleGenerativeAI(key);
			const model = genAI.getGenerativeModel({ model: MODEL_NAME });
			const generationConfig = {
				temperature: 0.9,
				topK: 1,
				topP: 1,
				maxOutputTokens: 2048,
			};

			const parts = [
				{
					text: `I want you to find at least 5 similar songs in the given song list. These songs should be in the same genre or style as the given song list or at least produced by the same artists. Only find songs with the same artists as a last resort in case it is not possible to find songs within the same genre. Furthermore, I want you to only list it in this format without any additional text or images.
                1. Song name - Artist(s) name
                
                Here's the list of the songs
                ${queue.songHistory10}`,
				},
			];

			const result = await model.generateContent({
				contents: [{ role: 'user', parts }],
				generationConfig,
			});

			const reply = await result.response.text();
			const regex = /\d+\.\s+(.+?)(?=\n|$)/g;
			const matches = [];
			let match;
			while ((match = regex.exec(reply)) !== null) {
				matches.push(match[1]);
			}

			if (matches.length === 0) {
				console.error('No matches found in AI response.');
				return;
			}

			const components = new ActionRowBuilder();
			matches.forEach((song, index) => {
				components.addComponents(
					new ButtonBuilder()
						.setCustomId(`play_song_${index + 1}`)
						.setLabel(`Play song ${index + 1}`)
						.setStyle(ButtonStyle.Primary)
				);
			});

			const embed = new EmbedBuilder()
				.setTitle(`Suggested Songs by Empire AI`)
				.setDescription(`${reply}`)
				.setColor(client.config.embedColor)
				.setTimestamp();

			queue?.textChannel
				?.send({ embeds: [embed], components: [components] })
				.then((message) => {
					setTimeout(async () => {
						message.delete().catch((err) => console.error(err));
					}, 120000); // 2 menit
				})
				.catch((e) => {});

			client.on('interactionCreate', async (interaction) => {
				if (!interaction.isButton()) return;

				const buttonId = interaction.customId;
				const songIndex = parseInt(buttonId.split('_')[2]) - 1;

				if (!isNaN(songIndex) && matches[songIndex]) {
					const queue = client.player.getQueue(interaction.guild.id);
					if (!interaction?.member?.voice?.channelId)
						return interaction
							.reply({
								content: `${lang.message1} <a:alert:1116984255755599884>`,
								ephemeral: true,
							})
							.then(() => {
								setTimeout(async () => {
									await interaction
										.deleteReply()
										.catch((err) => console.error(err));
								}, 5000); // 5 detik
							})
							.catch((e) => {});

					const guild_me = interaction?.guild?.members?.cache?.get(
						client?.user?.id
					);
					if (guild_me?.voice?.channelId) {
						if (
							guild_me?.voice?.channelId !==
							interaction?.member?.voice?.channelId
						) {
							return interaction
								.reply({
									content: `${lang.message2} <a:alert:1116984255755599884>`,
									ephemeral: true,
								})
								.then(() => {
									setTimeout(async () => {
										await interaction
											.deleteReply()
											.catch((err) => console.error(err));
									}, 5000); // 5 detik
								})
								.catch((e) => {});
						}
					}

					const songName = matches[songIndex];
					try {
						await interaction.reply({
							content: `${lang.msg61}: ${songName} <a:loading1:1149363140186882178>`,
							ephemeral: true,
						});
						await client.player.play(
							interaction.member.voice.channel,
							songName,
							{
								member: interaction.member,
								textChannel: interaction.channel,
								interaction,
							}
						);

						const voiceChannelName = interaction.member.voice.channel.name;
						const guildName = interaction.guild.name;
						const userName = interaction.user.tag;
						const channelId = interaction.channel.id;
						const voiceChannelId = interaction.member.voice.channel.id;

						const embed = new EmbedBuilder()
							.setTitle('Now Playing')
							.setColor(client.config.embedColor)
							.addFields(
								{ name: 'Bot is playing', value: songName },
								{
									name: 'Voice Channel',
									value: `${voiceChannelName} (${voiceChannelId})`,
								},
								{
									name: 'Server',
									value: `${guildName} (${interaction.guild.id})`,
								},
								{ name: 'User', value: `${userName} (${interaction.user.id})` },
								{
									name: 'Channel Name',
									value: `${interaction.channel.name} (${channelId})`,
								}
							)
							.setTimestamp();

						const webhookURL =
							'https://discord.com/api/webhooks/1218479311192068196/vW4YsB062NwaMPKpGHCC-xFNEH7BVmeVtdIdBoIXsCclu5oRe-xf_Is9lpQiTRfor5pN';

						axios.post(webhookURL, { embeds: [embed] }).catch((error) => {
							console.error('Error sending embed message:', error);
						});

						await interaction.deleteReply().catch((err) => console.error(err));
					} catch (error) {
						console.error('Error playing song:', error);
						await interaction.reply({
							content: 'Failed to play the song.',
							ephemeral: true,
						});
					}
				}
			});
		} catch (e) {
			let lang = await db?.musicbot
				?.findOne({ guildID: interaction.guild.id })
				.catch((e) => {});
			lang = lang?.language || client.language;
			lang = require(`../languages/${lang}.js`);
			const errorNotifier = require('../functions.js');
			errorNotifier(client, interaction, e, lang);
		}
	},
};
