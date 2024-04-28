const {
	EmbedBuilder,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
} = require('discord.js');
const db = require('../mongoDB');

module.exports = {
	name: 'nowplaying',
	description: 'Provides information about the music being played.',
	permissions: '0x0000000000000800',
	options: [],
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

			const track = queue.songs[0];
			if (!track)
				return interaction
					.reply({ content: lang.msg5, ephemeral: true })
					.catch((e) => {});

			let totalDuration = queue.songs
				.slice(0, 1)
				.reduce((acc, song) => acc + song.duration, 0);
			let formattedDuration = totalDuration - queue.currentTime;
			let formattedTotalTime = Math.round(formattedDuration);

			let estimatedTime;
			if (queue.duration === 0) {
				estimatedTime = 'Estimated Time: `Live` <a:live:1118902454646493317>';
			} else {
				estimatedTime = `Next Song: <t:${Math.floor(
					(Date.now() + formattedTotalTime * 1000) / 1000
				)}:R> <a:loading1:1149363140186882178>`;
			}

			const channel = lang.msg138.replace(
				'{queue?.connection.channel.name}',
				`<#${queue.voice.connection.joinConfig.channelId}>`
			);

			const embed = new EmbedBuilder();
			embed.setColor(client.config.embedColor);
			embed.setThumbnail(track.thumbnail);
			embed.setTitle(`<a:Radio:1116993120681328670> ${track.name}`);
			embed.setDescription(`> Audio \`%${
				queue.volume
			}\` <a:Musicon:1116994369833144350>
> Duration \`${track.formattedDuration}\` <a:loading1:1149363140186882178>
> ${estimatedTime}
> URL: **${track.url}**
> Loop Mode \`${
				queue.repeatMode
					? queue.repeatMode === 2
						? 'All Queue'
						: 'This Song'
					: 'Off'
			}\`
> Filter: \`${queue.filters.names.join(', ') || 'Off'}\`
> ${lang.msg66}: <@${track.user.id}>
> ${channel} <a:Headphone:1116990535719206993>`);
			embed.setTimestamp();
			embed.setFooter({ text: `Empire ❤️` });

			const saveButton = new ButtonBuilder();
			saveButton.setLabel(lang.msg47);
			saveButton.setCustomId('saveTrack');
			saveButton.setStyle(ButtonStyle.Success);
			saveButton.setEmoji('1117815593043775569');

			const row = new ActionRowBuilder().addComponents(saveButton);

			interaction
				.reply({ embeds: [embed], components: [row] })
				.then(() => {
					setTimeout(async () => {
						await interaction.deleteReply().catch((err) => console.error(err));
					}, 120000); // 120 seconds or 2 minute
				})
				.catch((e) => {});
		} catch (e) {
			const errorNotifer = require('../functions.js');
			errorNotifer(client, interaction, e, lang);
		}
	},
};
