const { ApplicationCommandOptionType, EmbedBuilder } = require('discord.js');
const maxVol = require('../config.js').opt.maxVol;
const db = require('../mongoDB');

module.exports = {
	name: 'volume',
	description: 'Allows you to adjust the music volume.',
	permissions: '0x0000000000000800',
	options: [
		{
			name: 'volume',
			description: 'Type the number to adjust the volume.',
			type: ApplicationCommandOptionType.Integer,
			required: false,
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
					.reply({
						content: `${lang.msg5} <a:alert:1116984255755599884>`,
						ephemeral: true,
					})
					.catch((e) => {});

			const vol = parseInt(interaction.options.getInteger('volume'));

			if (!vol)
				return interaction
					.reply({
						content: lang.msg87
							.replace('{queue.volume}', queue.volume)
							.replace('{maxVol}', maxVol),
						ephemeral: true,
					})
					.catch((e) => {});

			if (queue.volume === vol)
				return interaction
					.reply({
						content: `${lang.msg88} <a:alert:1116984255755599884>`,
						ephemeral: true,
					})
					.catch((e) => {});

			if (vol < 0 || vol > maxVol)
				return interaction
					.reply({
						content:
							lang.ms89 +
							' <a:Cross:1116983956227772476>'.replace('{maxVol}', maxVol),
						ephemeral: true,
					})
					.catch((e) => {});

			const success = queue.setVolume(vol);
			const embed = new EmbedBuilder()
				.setColor('00FF7D')
				.setTimestamp()
				.setDescription(
					success
						? `<a:Headphone:1116990535719206993> ${lang.msg90} ** ${vol} **/**${maxVol}** <a:Musicon:1116994369833144350>`
						: lang.msg41
				)
				.setFooter({ text: `Empire ❤️` });

			interaction
				.reply({ embeds: [embed] })
				.then(() => {
					setTimeout(async () => {
						await interaction.deleteReply().catch((err) => console.error(err));
					}, 300000); // 300 seconds or 5 minutes
				})
				.catch((e) => {});
		} catch (e) {
			const errorNotifer = require('../functions.js');
			errorNotifer(client, interaction, e, lang);
		}
	},
};
