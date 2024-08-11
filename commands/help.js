const { ApplicationCommandOptionType } = require('discord.js');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const db = require('../mongoDB');
const config = require('../config.js');
const axios = require('axios');

module.exports = {
	name: 'help',
	description: 'It helps you to get information about bot and commands.',
	permissions: '0x0000000000000800',
	options: [
		{
			name: 'chatbot',
			description: 'The command you want to get information to our Empire AI.',
			type: ApplicationCommandOptionType.String,
			required: false,
		},
	],
	showHelp: false,
	run: async (client, interaction) => {
		let lang = await db?.musicbot?.findOne({ guildID: interaction.guild.id });
		lang = lang?.language || client.language;
		lang = require(`../languages/${lang}.js`);
		try {
			const { EmbedBuilder } = require('discord.js');
			const chatbot = interaction.options.getString('chatbot');
			if (chatbot) {
				await interaction.deferReply({ content: 'loading' });

				const key = client.config.GEMINI;

				const data = {
					model: 'gemini-1.5-flash-latest',
					messages: [
						{
							role: 'system',
							content: `You are Empire Helper, a chatbot that answers questions based on the provided information about Empire Music Bot commands. If there is no information available, answer with something related to music. Introduce yourself as Empire AI.

Owner and Developer: brusnaclee
Empire created: November 2022
Current version: 5.0.0 (revamp button)
Previous version: 4.0.0 (added AI on /help, suggest with AI)
Supports platforms: YouTube, Spotify, SoundCloud
Bot website: https://empire.is-great.net/
Invite Bot to server: https://discord.com/oauth2/authorize?client_id=1044063413833302108&permissions=414585318465&scope=bot+applications.commands
Support server link: https://discord.gg/5fQ25DtVeH
Goal: Enhance life with music

Empire Music Control Panel Button Instructions:
⏪ - Rewind 15s
◀️ - Previous track
⏸️ - Pause
⏯️ - Resume
▶️ - Skip track
⏩ - Forward 15s
🔉 - Reduce volume by 15
📃 - Show lyrics
⏹️ - Stop
<:autoplay:1230869965435961394> - Autoplay on/off
🔊 - Increase volume by 15
🔀 - Shuffle queue
<:download:1230868574722064446> - Download via GDrive
➕ - Add music/playlist to queue
💾 - Save to playlist
🔁 - Loop queue

Empire commands information:

/help - It help you to get information about bot and commands. Usage = /help or /help (ask something)

/autoplay - Turn the queue's autoplay on or off. Usage = /autoplay

/back - Plays the previous track. Usage = /back

/channel add - Add a command usage channel. Usage = /channel add (name channel)

/channel remove - Remove a command usage channel. Usage = /channel remove (name channel)

/clear - Clears the music queue. Usage = /clear

/dj set - Allows you to select a DJ role by select the role example will set dj to @dj role. Usage /dj set (name role)

/dj reset - Allows you to turn off the DJ role. Usage /dj reset

/download - Download music files. Usage /download to download current music playing or /download (name of music) to download any of music you want.

/feedback - Send a feedback to the developer. Usage /feedback (give the feedback)

/filter - Apply an audio filter to the current music. Usage /filter it will show list of the filters.

/invite - Invite bot to your server. Usage /invite

/language - It allows you to set the language of the bot. Usage /language it will show list of the support language, currently only support 16 language

/loop - Turns the music loop mode on or off. Usage /loop it will show loop list such as queue loop, now playing loop or stop the loop.

/lyrics - Shows the lyrics of the song. Usage /lyrics or add the name like /lyrics Despacito or add the artist too like /lyrics Despacito Luis Fonsi

/move - Move a track in the music queue to a new position. Usage /move (from) (to)

/nowplaying - Show details about the current music track. Usage /nowplaying

/pause - Stops playing the currently playing music. Usage /pause

/ping - It provides information about the bot's response time. Usage /ping

/play music - Play music from other platforms. Write your music name or URL. Usage /play music Despacito

/play next - Play music for the next time. Write your music name or URL. Usage /play next Despacito

/play playlist - Write the name of the playlist that you was create. Usage /play playlist (name of the playlist) example favorite

/playlist create - Create a playlist. Usage /playlist create favorite

/playlist delete - Delete a playlist. Usage /playlist delete favorite

/playlist add-music - It allows you to add music to the playlist. Usage /playlist add-music Despacito

/playlist delete-music - It allows you to delete music to the playlist. Usage /playlist delete-music Despacito

/playlist lists - Browse all your playlists. Usage /playlist lists

/playlist top - Most popular playlists. Usage /playlist top

/queue - It displays the list of songs in the queue. Usage /queue

/remove - Removes a track from the music queue. Usage /remove (track on queue) example /remove 2

/report - Send a bug report to the developer. Usage /report (tell the bug)

/resume - Resume the paused music. Usage /resume

/save - It sends and save the played music to you via dm box. Usage /save

/search - Used for your music search. Usage /search despacito

/seek - Set the position of the track. Usage /seek (second) example if 3 minute then /seek 180

/Shuffle - Shuffle the guild queue songs. Usage /shuffle

/skip - Switches the music being played. Usage /skip or /skip (how much wanna skip) /skip 20

/statistic - View the bot statistics. Usage /statistic

/stop - Stopping the music. Usage /stop

/suggest - Suggest a song by AI. usage /suggest it need atleast 1 song to be played first to get the suggest from AI

/time - Indicates which minute of the music you are playing. Usage /time

/volume - Allows you to adjust the music volume. Usage /volume for show the volume, /volume (the value wanna change) /volume 100`,
						},
						{
							role: 'user',
							content: `
            Now this is the question from the <@${interaction.user.id}>: ${chatbot}`,
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
						const reply = response.data.choices[0].message.content;
						const embed = new EmbedBuilder()
							.setTitle(`Empire Chatbot`)
							.setDescription(`> ${reply}`)
							.setColor(client.config.embedColor)
							.setTimestamp();
						return interaction
							.editReply({ embeds: [embed] })
							.then(() => {
								setTimeout(async () => {
									await interaction
										.deleteReply()
										.catch((err) => console.error(err));
								}, 120000); // 120 seconds or 2 minutes
							})
							.catch((e) => {});
					})
					.catch((error) => {
						console.error('Error:', error);
					});
			} else {
				const commands = client.commands.filter((x) => x.showHelp !== false);

				const embed = new EmbedBuilder()
					.setColor(client.config.embedColor)
					.setAuthor({
						name: `${client.user.username} Command List`,
						iconURL: client.user.displayAvatarURL(),
					})
					.setDescription(
						lang.msg32
							.replace('{client.user.username}', `${client.user.username}`)
							.replace('<@{interaction.user.id}>', `<@${interaction.user.id}>`)
							.replace('{config.botInvite}', `${config.botInvite}`)
							.replace('{config.supportServer}', `${config.supportServer}`)
							.replace('{config.sponsor.url}', `${config.sponsor.url}`)
							.replace(
								'{config.voteManager.vote_url}',
								`${config.voteManager.vote_url}`
							)
							.replace('{config.support}', `${config.support}`)
							.replace('{config.support2}', `${config.support}`)
					)

					.setTimestamp()
					.setFooter({ text: `Empire ❤️` });

				interaction
					.reply({ embeds: [embed] })
					.then(() => {
						setTimeout(async () => {
							await interaction
								.deleteReply()
								.catch((err) => console.error(err));
						}, 180000); // 180 seconds or 3 minute
					})
					.catch((e) => {});
			}
		} catch (e) {
			const errorNotifer = require('../functions.js');
			errorNotifer(client, interaction, e, lang);
		}
	},
};
