const { ApplicationCommandOptionType } = require('discord.js');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const db = require('../mongoDB');

module.exports = {
	name: 'help',
	description: 'It helps you to get information about bot and commands.',
	permissions: '0x0000000000000800',
	options: [
		{
			name: 'info',
			description: 'The command you want to get information about.',
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
			const info = interaction.options.getString('info');
			if (info) {
				await interaction.deferReply({ content: 'loading' });
				const MODEL_NAME = 'gemini-pro';
				const key = client.config.GEMINI;
				const genAI = new GoogleGenerativeAI(key);
				console.log(genAI);
				const model = genAI.getGenerativeModel({ model: MODEL_NAME });
				const generationConfig = {
					temperature: 0.9,
					topK: 1,
					topP: 1,
					maxOutputTokens: 4096,
				};
				const parts = [
					{
						text: `you are empire helper that will answer all question that is contain from the owner information, dont answer a question if there is no information from the owner list, if there is no information from here, answer with something that still related from this information, now i will tell you some information about commands on empire music bot then you will answer question from client user that the information is just from here, oh yeah this is just the information, you can add some text so the user will be more clear how to use this empire bot command like maybe you can tell the user how to use it, and remember you can speak all language depends on the user language
owner name is: brusnaclee

/help - It help you to get information about bot and commands.

/autoplay - Turn the queue's autoplay on or off.

/back - Plays the previous track.

/channel add - Add a command usage channel.

/channel remove - Remove a command usage channel.

/clear - Clears the music queue.

/dj set - Allows you to select a DJ role by select the role example will set dj to @dj role.

/dj reset - Allows you to turn off the DJ role.

/download - Download music files.

/filter - Apply an audio filter to the current music.

/invite - Invite bot to your server.

/language - It allows you to set the language of the bot.

/loop - Turns the music loop mode on or off.

/lyrics - Shows the lyrics of the song.

/move - Move a track in the music queue to a new position.

/nowplaying - Show details about the current music track.

/pause - Stops playing the currently playing music.

/ping - It provides information about the bot's response time.

/play music - Play music from other platforms. Write your music name or URL.

/play next - Play music for the next time. Write your music name or URL.

/play playlist - Write the name of the playlist that you was create.

playlist create - Create a playlist.

/playlist delete - Delete a playlist.

/playlist add-music - It allows you to add music to the playlist.

/playlist delete-music - It allows you to delete music to the playlist.

/playlist lists - Browse all your playlists.

/playlist top - Most popular playlists.

/queue - It displays the list of songs in the queue.

/remove - Removes a track from the music queue.

/report - Send a bug report to the developer.

/resume - Resume the paused music.

/save - It sends and save the played music to you via dm box.

/search - Used for your music search.

/seek - Set the position of the track.

/Shuffle - Shuffle the guild queue songs.

/skip - Switches the music being played.

/statistic - View the bot statistics.

/stop - Stopping the music.

/suggestion - Send a suggestion to the developer.

/time - Indicates which minute of the music you are playing.

/volume - Allows you to adjust the music volume.

            Now this is the question from the <@${interaction.user.id}>: ${info}`,
					},
				];
				const result = await model.generateContent({
					contents: [{ role: 'user', parts }],
					generationConfig,
				});
				const reply = await result.response.text();

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
						}, 60000); // 60 seconds or 1 minutes
					})
					.catch((e) => {});
			} else {
				const commands = client.commands.filter((x) => x.showHelp !== false);

				const embed = new EmbedBuilder()
					.setColor(client.config.embedColor)
					.setTitle('/help info <command>')
					.setThumbnail(client.user.displayAvatarURL())
					.setDescription(lang.msg32)
					.addFields([
						{
							name: `${lang.msg33}`,
							value: commands.map((x) => `\`/${x.name}\``).join(' | '),
						},
					])
					.setTimestamp()
					.setFooter({ text: `Empire ❤️` });
				interaction.reply({ embeds: [embed] }).catch((e) => {});
			}
		} catch (e) {
			const errorNotifer = require('../functions.js');
			errorNotifer(client, interaction, e, lang);
		}
	},
};
