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

	const MODEL_NAME = 'gemini-1.5-flash-latest';

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
			text: `Please suggest at least 5 similar songs based on the given song list. 
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

	const uniqueId = Date.now().toString(); // Unique identifier

	// Create buttons for each song recommendation
	const components = new ActionRowBuilder();
	matches.forEach((song, index) => {
		components.addComponents(
			new ButtonBuilder()
				.setCustomId(`play_song_${uniqueId}_${index + 1}`) // Include uniqueId in customId
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
			}, 120000); // 2 minutes
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
		if (!buttonId.startsWith(`play_song_${uniqueId}_`)) return; // Ensure the button ID matches the current interaction

		const songIndex = parseInt(buttonId.split('_')[3]) - 1;

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
						{ name: 'Suggest AI is playing', value: songName },
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
