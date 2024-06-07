const db = require('../../mongoDB');
const {
	EmbedBuilder,
	ButtonBuilder,
	ActionRowBuilder,
	ButtonStyle,
} = require('discord.js');
const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');

module.exports = async (client, queue, oldState) => {
	let lang = await db?.musicbot?.findOne({
		guildID: queue?.textChannel?.guild?.id,
	});
	lang = lang?.language || client.language;
	lang = require(`../../languages/${lang}.js`);

	if (queue?.textChannel) {
		const embed = new EmbedBuilder()
			.setColor('#FF0000')
			.setTimestamp()
			.setDescription(`${lang.msg14} <a:alert:1116984255755599884>`)
			.setFooter({ text: `Empire ❤️` });

		// Kirim pesan
		queue?.textChannel
			?.send({ embeds: [embed] })
			.then((newMessage) => {
				queue.FinishMessageId = newMessage.id; // Menyimpan ID pesan baru dengan nama lastPlaylistMessageId
			})
			.catch((e) => {});

		// Hapus pesan yang disimpan di queue.lastPlaylistMessageId
		if (queue.lastPlaylistMessageId) {
			try {
				queue.textChannel.messages
					.fetch(queue.lastPlaylistMessageId)
					.then((message) => {
						if (message) {
							message.delete().catch(console.error);
						}
					})
					.catch(console.error);
			} catch (error) {
				console.error(
					'Gagal menghapus pesan dari queue.lastPlaylistMessageId:',
					error
				);
			}
		}

		if (queue.lastMessagesId) {
			queue.lastMessagesId.forEach(async (messageId) => {
				try {
					const message = await queue.textChannel.messages.fetch(messageId);
					await message.edit({ components: [] }).catch(console.error); // Hapus komponen tombol dari pesan sebelumnya
				} catch (error) {
					console.error('Gagal menghapus pesan:', error);
				}
			});
		}

		// Hapus semua pesan yang telah terkirim sebelumnya
		if (queue.lastSongMessageId) {
			queue.lastSongMessageId.forEach(async (messageId) => {
				try {
					const message = await queue.textChannel.messages.fetch(messageId);
					await message.delete();
				} catch (error) {
					console.error('Gagal menghapus pesan:', error);
				}
			});
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
			text: `I want you to find at least 5 similar songs in the given song list. 
			These songs should be in the same genre or style as the given song list or at least produced by the same artists. 
			Only find songs with the same artists as a last resort in case it is not possible to find songs within the same genre. 
			Furthermore, I want you to only list it in this format without any additional text or images.

			1. Song name - Artist(s) name
			
			And please if can dont give the same song like the list, example if the list are like this
			1. Baby - Justin Bieber
			dont suggest same song, you can suggest song that is from the artist or with same genre or style like this the example
			1. Stay - Justin Bieber

			Also i dont want all of the 5 song is from same artist if the list of song is more then 1 songs so the name song that you give is more varies.
			But if the song on the list only 1 song, then you can provide the suggest song from that artist only
			
			Here's the list of the songs
            ${queue.songHistory10}
            `,
		},
	];
	const result = await model.generateContent({
		contents: [{ role: 'user', parts }],
		generationConfig,
	});
	const reply = await result.response.text();

	// Parse the reply using regex to extract song names
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

	// Create buttons for each song recommendation
	const components = new ActionRowBuilder();
	matches.forEach((song, index) => {
		components.addComponents(
			new ButtonBuilder()
				.setCustomId(`play_song_${index + 1}`)
				.setLabel(`Play song ${index + 1}`)
				.setStyle(ButtonStyle.Primary)
		);
	});

	// Send the recommendation message with buttons
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
			}, 120000); // 60 seconds or 1 minute
		})
		.catch((e) => {});

	const startTime = Date.now();

	// Set interval timer for checking the queue status
	const interval = setInterval(async () => {
		const queueCheck = client.player.getQueue(queue?.textChannel?.guild?.id);
		if (!queueCheck || !queueCheck.playing) {
			const elapsedTime = Date.now() - startTime;
			const maxElapsedTime = 180000; // 180 seconds or 3 minutes
			if (elapsedTime >= maxElapsedTime) {
				const newEmbed = new EmbedBuilder()
					.setColor('#FF0000')
					.setTimestamp()
					.setDescription(`${lang.msg148} <a:Thankyou:1117120334810857623>`)
					.setFooter({ text: `Empire ❤️` });

				const linkvote = new ButtonBuilder()
					.setLabel('Vote Us!')
					.setURL('https://top.gg/bot/1044063413833302108/vote')
					.setStyle(ButtonStyle.Link);

				const linkinvite = new ButtonBuilder()
					.setLabel('Invite Us!')
					.setURL(
						'https://discord.com/oauth2/authorize?client_id=1044063413833302108&permissions=414585318465&scope=bot+applications.commands'
					)
					.setStyle(ButtonStyle.Link);

				const Row = new ActionRowBuilder().addComponents(linkvote, linkinvite);

				queue?.textChannel
					?.send({ embeds: [newEmbed], components: [Row] })
					.catch(console.error);

				const leaveOnEmpty = client.config.opt.voiceConfig.leaveOnEmpty?.status;
				if (!leaveOnEmpty) {
					clearInterval(interval);
					return;
				}
				queue.stop();
				clearInterval(interval);
			}
		} else {
			try {
				queue.textChannel.messages
					.fetch(queue.FinishMessageId)
					.then((message) => {
						if (message) {
							message.delete().catch(console.error);
						}
					})
					.catch(console.error);
			} catch (error) {
				console.error(
					'Gagal menghapus pesan dari queue.FinishMessageId:',
					error
				);
			}
			clearInterval(interval);
		}
	}, 3000); // Check every 3 seconds

	// Listen for button interactions to play songs
	client.on('interactionCreate', async (interaction) => {
		if (!interaction.isButton()) return;

		const buttonId = interaction.customId;
		const songIndex = parseInt(buttonId.split('_')[2]) - 1;

		if (!isNaN(songIndex) && matches[songIndex]) {
			const queue = client.player.getQueue(interaction.guild.id);
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
			const songName = matches[songIndex];
			try {
				await interaction.reply({
					content: `${lang.msg61}: ${songName} <a:loading1:1149363140186882178>`,
					ephemeral: true,
				});
				await client.player.play(interaction.member.voice.channel, songName, {
					member: interaction.member,
					textChannel: interaction.channel,
					interaction,
				});
				const voiceChannelName = interaction.member.voice.channel.name;
				const guildName = interaction.guild.name;
				const userName = interaction.user.tag;
				const channelId = interaction.channel.id;
				const voiceChannelId = interaction.member.voice.channel.id;

				// Buat pesan embed
				const embed = new EmbedBuilder()
					.setTitle('Now Playing')
					.setColor(client.config.embedColor)
					.addFields(
						{ name: 'Bot is playing', value: songName },
						{
							name: 'Voice Channel',
							value: `${voiceChannelName} (${voiceChannelId})`,
						},
						{ name: 'Server', value: `${guildName} (${interaction.guild.id})` },
						{ name: 'User', value: `${userName} (${interaction.user.id})` },
						{
							name: 'Channel Name',
							value: `${interaction.channel.name} (${channelId})`,
						}
					)
					.setTimestamp();

				// URL webhook Discord
				const webhookURL =
					'https://discord.com/api/webhooks/1218479311192068196/vW4YsB062NwaMPKpGHCC-xFNEH7BVmeVtdIdBoIXsCclu5oRe-xf_Is9lpQiTRfor5pN';

				// Kirim pesan embed ke webhook
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
};
