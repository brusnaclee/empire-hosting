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

				const url = 'https://empire-ai.vercel.app/api/chatbot';
				const data = {
					prompt: `you are empire helper that will answer all question that is contain from the owner information, dont answer a question if there is no information from the owner list, if there is no information from here, answer with something that still related from this information, now i will tell you some information about commands on empire music bot then you will answer question from client user that the information is just from here but you can search some information on internet if client asking some information about song artist or band artist or something related with music other then empire commands, oh yeah this is just the information, you can add some text so the user will be more clear how to use this empire bot command like maybe you can tell the user how to use it, and remember you can speak all language depends on the user language
owner name is: brusnaclee 
you are AI or chatbot that pro at music so you can do with all topic related with music and you are here to answer and explain all question about commands on empire music bot or give answer that still related with music like give artist info or suggest some music based on what the question, and i want you to introduce yourself as a empire chatbot or empire AI

general information about empire if you need it when introduce your self or if client ask it:

empire was created since november 2022
empire support many platform and language such as youtube, spotify, soundcloud and more powered by distube
Our goal is to enhance your life with music

now version is 3.5.0
last change is = adding AI on /help commands, suggest with AI
last version was 3.0.0 with change is = add more language supports

Empire Music Control Panel Button Instruction:

The button will show up when there is music playing

◀️ button for play the preveous music.

⏸️ button for pause the music.

⏯️ button for resume the music.

▶️ button for skip the current music.

📃 button for show the lyrics.

⏹️ button for stop the music.

<:save:1117815593043775569> button for save the music to your playlist.

🔀 button for shuffle the music on the queue.

<:download:1230868574722064446> button for download the music via gdrive.

<:autoplay:1230869965435961394> button for turn the queue's autoplay on or off.

Empire commands information:

/help - It help you to get information about bot and commands. Usage = /help or /help (ask something)

/autoplay - Turn the queue's autoplay on or off. Usage = /autoplay

/back - Plays the previous track. Usage = /back

/channel add - Add a command usage channel. Usage = /channel add (name channel)

/channel remove - Remove a command usage channel. Usage = /channel remove (name channel)

/clear - Clears the music queue. Usage = /clear

/dj set - Allows you to select a DJ role by select the role example will set dj to @dj role. Usage /dj set (name role)

/dj reset - Allows you to turn off the DJ role. Usage /dj reset

/download - Download music files. Usage /download

/feedback - Send a feedback to the developer. Usage /feedback (give the feedback)

/filter - Apply an audio filter to the current music. Usage /filter 

/invite - Invite bot to your server. Usage /invite

/language - It allows you to set the language of the bot. Usage /language

/loop - Turns the music loop mode on or off. Usage /loop

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

/volume - Allows you to adjust the music volume. Usage /volume for show the volume, /volume (the value wanna change) /volume 100

            Now this is the question from the <@${interaction.user.id}>: ${chatbot}`,
				};

				axios
					.post(url, data)
					.then((response) => {
						const result = response.data;

						const embed = new EmbedBuilder()
							.setTitle(`Empire Chatbot`)
							.setDescription(`> ${result}`)
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
						console.error('Error making the request:', error);
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
