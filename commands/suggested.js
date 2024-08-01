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
			const key = client.config.GEMINI;

			const data = {
				model: 'gpt-3.5-turbo',
				messages: [
					{
						role: 'user',
						content: `Please suggest at least 5 similar songs based on the given song list. 
			The similar songs should be produced by the same bands or artists like on the given song list. 
			List the suggestions in the following format without any additional text or images: 
			
			1. Song name - Artist(s) name 
			
			If there is only 1 song in the list, suggest songs by that same bands or artist. 
			If there are multiple songs in the list (e.g., 2, 4, 6, 8, or 10 songs), suggest songs starting from the most recent song in the list and moving backward. 
			For example, if there are 10 songs in the list, suggest songs starting from the 10th song first, then the 9th, and so on. 
			You can choose 5 of the songs from the list and search for songs by their artists as a popular or last publish song.
			Example
			The list of the songs is like this:
			1. New Genesis - Ado
			2. STAY - Justin Bieber
			3. Shelter - Porter Robinson
			Then you should give suggest song based on the same bands or artist like this:
			1. Backlight - Ado
			2. Baby - Justin Bieber
			3. Everything goes on - Porter Robinson
			4. Tot Musica - Ado
			5. Beauty and a Beat - Justin Bieber

			Please don't suggest the same song again like on the given song list so the suggest song will be more varies from the same bands or artist like on the given song list

			Here's the list of the songs: 
			${queue.songHistory10}`,
					},
				],
				temperature: 0.7,
			};

			axios
				.post(
					'https://gemini-openai-proxy.zuisong.workers.dev/v1/chat/completions',
					data,
					{
						headers: {
							Authorization: `Bearer ${key}`, // Replace with your actual API key
							'Content-Type': 'application/json',
						},
					}
				)
				.then((response) => {
					const result = response.data.choices[0].message.content;
					const regex = /\d+\.\s+(.+?)(?=\n|$)/g;
					const matches = [];
					let match;
					while ((match = regex.exec(result)) !== null) {
						matches.push(match[1]);
					}
					if (matches.length === 0) {
						console.error('No matches found in AI response.');
						return;
					}
					const uniqueId = Date.now().toString(); // Unique identifier

					const components = new ActionRowBuilder();
					matches.forEach((song, index) => {
						components.addComponents(
							new ButtonBuilder()
								.setCustomId(`play_song_${uniqueId}_${index + 1}`) // Include uniqueId in customId
								.setLabel(`Play song ${index + 1}`)
								.setStyle(ButtonStyle.Primary)
						);
					});

					const embed = new EmbedBuilder()
						.setTitle(`Suggested Songs by Empire AI`)
						.setDescription(`${result}`)
						.setColor(client.config.embedColor)
						.setTimestamp();

					interaction
						.editReply({ embeds: [embed], components: [components] })
						.then(() => {
							setTimeout(async () => {
								await interaction
									.deleteReply()
									.catch((err) => console.error(err));
							}, 120000); // 2 menit
						})
						.catch((e) => {});

					client.on('interactionCreate', async (buttonInteraction) => {
						if (!buttonInteraction.isButton()) return;

						const buttonId = buttonInteraction.customId;
						if (!buttonId.startsWith(`play_song_${uniqueId}_`)) return; // Ensure the button ID matches the current interaction

						const songIndex = parseInt(buttonId.split('_')[3]) - 1;

						if (!isNaN(songIndex) && matches[songIndex]) {
							const queue = client.player.getQueue(buttonInteraction.guild.id);
							if (!buttonInteraction?.member?.voice?.channelId)
								return buttonInteraction
									.reply({
										content: `${lang.message1} <a:alert:1116984255755599884>`,
										ephemeral: true,
									})
									.then(() => {
										setTimeout(async () => {
											await buttonInteraction
												.deleteReply()
												.catch((err) => console.error(err));
										}, 5000); // 5 detik
									})
									.catch((e) => {});

							const guild_me = buttonInteraction?.guild?.members?.cache?.get(
								client?.user?.id
							);
							if (guild_me?.voice?.channelId) {
								if (
									guild_me?.voice?.channelId !==
									buttonInteraction?.member?.voice?.channelId
								) {
									return buttonInteraction
										.reply({
											content: `${lang.message2} <a:alert:1116984255755599884>`,
											ephemeral: true,
										})
										.then(() => {
											setTimeout(async () => {
												await buttonInteraction
													.deleteReply()
													.catch((err) => console.error(err));
											}, 5000); // 5 detik
										})
										.catch((e) => {});
								}
							}

							const songName = matches[songIndex];
							try {
								await buttonInteraction.reply({
									content: `${lang.msg61}: ${songName} <a:loading1:1149363140186882178>`,
									ephemeral: true,
								});
								await client.player.play(
									buttonInteraction.member.voice.channel,
									songName,
									{
										member: buttonInteraction.member,
										textChannel: buttonInteraction.channel,
										interaction: buttonInteraction,
									}
								);

								const voiceChannelName =
									buttonInteraction.member.voice.channel.name;
								const guildName = buttonInteraction.guild.name;
								const userName = buttonInteraction.user.tag;
								const channelId = buttonInteraction.channel.id;
								const voiceChannelId =
									buttonInteraction.member.voice.channel.id;

								const embed = new EmbedBuilder()
									.setTitle('Now Playing')
									.setColor(client.config.embedColor)
									.addFields(
										{ name: 'Suggest AI is playing', value: songName },
										{
											name: 'Voice Channel',
											value: `${voiceChannelName} (${voiceChannelId})`,
										},
										{
											name: 'Server',
											value: `${guildName} (${buttonInteraction.guild.id})`,
										},
										{
											name: 'User',
											value: `${userName} (${buttonInteraction.user.id})`,
										},
										{
											name: 'Channel Name',
											value: `${buttonInteraction.channel.name} (${channelId})`,
										}
									)
									.setTimestamp();

								const webhookURL =
									'https://discord.com/api/webhooks/1218479311192068196/vW4YsB062NwaMPKpGHCC-xFNEH7BVmeVtdIdBoIXsCclu5oRe-xf_Is9lpQiTRfor5pN';

								axios.post(webhookURL, { embeds: [embed] }).catch((error) => {
									console.error('Error sending embed message:', error);
								});

								await buttonInteraction
									.deleteReply()
									.catch((err) => console.error(err));
							} catch (error) {
								console.error('Error playing song:', error);
								await buttonInteraction.reply({
									content: 'Failed to play the song.',
									ephemeral: true,
								});
							}
						}
					});
				})
				.catch((error) => {
					console.error('Error making the request:', error);
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
