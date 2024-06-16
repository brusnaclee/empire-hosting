const { ApplicationCommandOptionType, EmbedBuilder } = require('discord.js');
const db = require('../mongoDB');

function getFormattedTime(seconds) {
	let hours = Math.floor(seconds / 3600);
	let minutes = Math.floor((seconds % 3600) / 60);
	let remainingSeconds = seconds % 60;

	hours = hours < 10 ? `0${hours}` : hours;
	minutes = minutes < 10 ? `0${minutes}` : minutes;
	remainingSeconds =
		remainingSeconds < 10 ? `0${remainingSeconds}` : remainingSeconds;

	return hours > 0
		? `${hours}:${minutes}:${remainingSeconds}`
		: `${minutes}:${remainingSeconds}`;
}

module.exports = {
	name: 'seek',
	description: 'Set the position of the track.',
	permissions: '0x0000000000000800',
	options: [
		{
			name: 'position',
			description: 'The position to set',
			type: ApplicationCommandOptionType.String,
			required: true,
		},
	],
	voiceChannel: true,
	run: async (client, interaction) => {
		let lang = await db?.musicbot?.findOne({ guildID: interaction.guild.id });
		lang = lang?.language || client.language;
		lang = require(`../languages/${lang}.js`);
		try {
			const queue = client.player.getQueue(interaction.guild.id);
			if (!queue || !queue.playing)
				return interaction
					.reply({ content: lang.msg5, ephemeral: true })
					.catch((e) => {});

			let position = getSeconds(interaction.options.getString('position'));
			if (isNaN(position))
				return interaction
					.reply({ content: `${lang.msg134}`, ephemeral: true })
					.catch((e) => {});

			let formattedPosition = getFormattedTime(position);

			queue.seek(position);
			const embed = new EmbedBuilder()
				.setColor('00FF7D')
				.setTimestamp()
				.setDescription(
					`${lang.msg135.replace(
						'{queue.formattedCurrentTime}',
						formattedPosition
					)}`
				)
				.setFooter({ text: `Empire ❤️` });

			interaction
				.reply({ embeds: [embed] })
				.then(() => {
					setTimeout(async () => {
						await interaction.deleteReply().catch((err) => console.error(err));
					}, 120000); // 120 seconds or 2 minute
				})
				.catch((e) => {});
		} catch (e) {
			const errorNotifier = require('../functions.js');
			errorNotifier(client, interaction, e, lang);
		}
	},
};

// Fungsi untuk mengonversi string waktu menjadi detik
function getSeconds(str) {
	var p = str.split(':');
	var s = 0;
	var m = 1;
	while (p.length > 0) {
		s += m * parseInt(p.pop(), 10);
		m *= 60;
	}
	return s;
}
