const db = require('../../mongoDB');
const {
	EmbedBuilder,
	ButtonBuilder,
	ActionRowBuilder,
	ButtonStyle,
} = require('discord.js');
require('dotenv').config();
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

	const genAI = new GoogleGenerativeAI(
		'AIzaSyDN9J5AioY5-99nvmbxJXwZ5vFVFsodIJE'
	);
	const model = genAI.getGenerativeModel({ model: MODEL_NAME });
	const generationConfig = {
		temperature: 0.9,
		topK: 1,
		topP: 1,
		maxOutputTokens: 2048,
	};
	const parts = [
		{
			text: `I want you to find 5 songs that are related to this data, which contains music played by a user. 
I want you to answer in this format:
1. Without Me - Halsey
2. New Genesis - Ado
3. Everything Goes On - Porter Robinson
and continue until you have 5 songs. Please recommend songs that are similar to the data or by the same artist. Avoid recommending 5 songs from the same artist to ensure variety.
Here is the music data that has been played by the user before:
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
		.setTitle(`Recommended Songs by Empire`)
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
			const songName = matches[songIndex];
			try {
				await client.player.play(interaction.member.voice.channel, songName, {
					member: interaction.member,
					textChannel: interaction.channel,
					interaction,
				});
				await interaction.reply({
					content: `${lang.msg61}: ${songName} <a:loading1:1149363140186882178>`,
					ephemeral: true,
				});
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
