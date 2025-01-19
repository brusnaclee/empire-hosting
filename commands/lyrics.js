const { ApplicationCommandOptionType, EmbedBuilder } = require('discord.js');
const config = require('../config.js');
//const lyricsFinder = require('lyrics-finder');
//const geniusApi = require('genius-lyrics-api');
const Genius = require('genius-lyrics');
const apiKey = config.GENIUS;
const db = require('../mongoDB');
const Client = new Genius.Client(apiKey);

async function fetchData(title, artist) {
	const searches = await Client.songs.search(`${title} ${artist}`);

	const firstSong = searches[0];

	const lyrics = await firstSong.lyrics();
	return { lyrics, firstSong };
}

module.exports = {
	name: 'lyrics',
	description: 'Shows the lyrics of the song.',
	permissions: '0x0000000000000800',
	options: [
		{
			name: 'song',
			description:
				'The name of the song for which you want to display the lyrics.',
			type: ApplicationCommandOptionType.String,
			required: false,
		},
		{
			name: 'artists',
			description: 'The artist of the song.',
			type: ApplicationCommandOptionType.String,
			required: false,
		},
	],
	run: async (client, interaction) => {
		try {
			let lang = await db?.musicbot?.findOne({ guildID: interaction.guild.id });
			lang = lang?.language || client.language;
			lang = require(`../languages/${lang}.js`);

			const songName = interaction.options.getString('song');
			const artistName = interaction.options.getString('artists');
			const queue = client.player.getQueue(interaction.guild.id);

			await interaction.deferReply({ ephemeral: false });

			let title = '';
			let artist = typeof artistName === 'string' ? artistName : ' ';
			if (songName) {
				title = songName;
			} else {
				if (!queue || !queue.playing) {
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
							}, 5000);
						});
				}
				title = queue.songs[0].name;
			}

			const removeUnwantedWords = (str) => {
				return str
					.replace(
						/\(.*?\)|\[.*?\]|\bofficial\b|\bmusic\b|\bvideo\b|\blive\b|\blyrics\b|\blyric\b|\blirik\b|\bHD\b|\bversion\b|\bfull\b|\bMV\b|\bmv\b|\bcover\b|\bremix\b|\bfeaturing\b|\bver\b|\bversion\b|\bedit\b|\bclip\b|\bteaser\b|\btrailer\b|\bofficial audio\b|\bperformance\b|\bconcert\b|\bkaraoke\b|\btour\b|\bremastered\b|\bremake\b|\bintro\b|\boutro\b|\bvisualizer\b|\bvisual\b|\btrack\b|\bcensored\b|\bopening\b|\bop\b|\bending\b|\bed\b|\bcreditless\b|\bcc\b|['.,":;\/\[\]()\-]/gi,
						''
					)
					.replace(/\bft\.?.*$/i, '')
					.replace(/\bfeat\.?.*$/i, '')
					.replace(/\bby\b.*$/i, '')
					.replace(/\|.*$/g, '')
					.trim();
			};

			title = removeUnwantedWords(title);

			const { lyrics, firstSong } = await fetchData(title, artist);

			if (!lyrics) {
				return interaction
					.editReply({
						content: 'Lyrics for this song were not found.',
						ephemeral: true,
					})
					.then(() => {
						setTimeout(async () => {
							await interaction
								.deleteReply()
								.catch((err) => console.error(err));
						}, 5000);
					});
			}

			const embed = new EmbedBuilder()
				.setColor(client.config.embedColor)
				.setTitle(`${firstSong.title} - ${firstSong.artist.name}`)
				.setDescription(lyrics)
				.setThumbnail(firstSong.thumbnail)
				.setTimestamp()
				.setFooter({ text: 'Empire ❤️' });

			await interaction
				.editReply({ embeds: [embed], ephemeral: false })
				.then(() => {
					setTimeout(async () => {
						await interaction.deleteReply().catch((err) => console.error(err));
					}, 600000);
				});
		} catch (error) {
			let lang = await db?.musicbot?.findOne({ guildID: interaction.guild.id });
			lang = lang?.language || client.language;
			lang = require(`../languages/${lang}.js`);
			console.error(error);
			if (error.code === 10062 || error.status === 404) {
				return interaction
					.editReply({ content: lang.msg4, ephemeral: true })
					.then(() => {
						setTimeout(async () => {
							await interaction
								.deleteReply()
								.catch((err) => console.error(err));
						}, 5000);
					});
			}
			interaction
				.editReply({
					content: 'An error occurred while processing the request.',
					ephemeral: true,
				})
				.then(() => {
					setTimeout(async () => {
						await interaction.deleteReply().catch((err) => console.error(err));
					}, 5000);
				});
		}
	},
};
