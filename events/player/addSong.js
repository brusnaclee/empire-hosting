const db = require('../../mongoDB');
const { EmbedBuilder } = require('discord.js');

module.exports = async (client, queue, song) => {
	let lang = await db?.musicbot?.findOne({
		guildID: queue?.textChannel?.guild?.id,
	});
	lang = lang?.language || client.language;
	lang = require(`../../languages/${lang}.js`);

	const position = queue.songs.indexOf(song) + 1;

	const track = queue.songs[0];

	let totalDuration = queue.songs
		.slice(0, position - 1)
		.reduce((acc, song) => acc + song.duration, 0);
	let queuePositionString = '';
	let formattedDuration = totalDuration - queue.currentTime;
	let formattedtotalTime = Math.round(formattedDuration);

	const currentTime = Math.floor(Date.now() / 1000);
	const estimatedTimestamp = currentTime + formattedtotalTime;
	const formattedTimestamp = `<t:${estimatedTimestamp}:R>`;

	const channel = lang.msg138.replace(
		'{queue?.connection.channel.name}',
		`<#${queue.voice.connection.joinConfig.channelId}>`
	);

	if (position > 1) {
		queuePositionString = `${lang.msg147}: ${position}`;
	}

	const embed = new EmbedBuilder();
	embed.setColor('00FF7D');
	embed.setThumbnail(song.thumbnail);
	embed.setDescription(
		`<a:musicnote:1116984203691687997> [${song.name}](${song.url})\n<a:Radio:1116993120681328670> ${lang.msg79} <a:Ceklis:1116989553744552007>`
	);

	const fields = [
		{
			name: lang.msg143,
			value: `> ${song.formattedDuration} <a:loading1:1149363140186882178>`,
			inline: true,
		},
		{
			name: lang.msg145,
			value: `> ${formattedTimestamp} <a:loading1:1149363140186882178>`,
			inline: true,
		},
		{ name: ' ', value: ` `, inline: true },
		{ name: lang.msg147, value: `> ${queuePositionString}`, inline: true },
		{
			name: lang.msg66,
			value: `> ${lang.msg66}: <@${song.user.id}>`,
			inline: true,
		},
		{ name: ' ', value: ` `, inline: true },
	];

	embed.addFields(fields);

	embed.setTimestamp();
	embed.setFooter({ text: 'Empire ❤️' });

	const messageEmbed = {
		embeds: [embed],
	};

	// Jika sudah ada 5 pesan dalam array, hapus pesan yang paling lama terkirim
	if (queue.lastSongMessageId) {
		if (queue.lastSongMessageId.length >= 3) {
			const oldestMessageId = queue.lastSongMessageId.shift(); // Ambil ID pesan yang paling lama terkirim (indeks terakhir)
			queue.textChannel.messages.delete(oldestMessageId).catch(console.error); // Hapus pesan tersebut
		}
	} else {
		queue.lastSongMessageId = [];
	}

	// Mengirim pesan baru dan menyimpan ID-nya untuk dihapus nanti
	queue.textChannel
		.send(messageEmbed)
		.then((newMessage) => {
			queue.lastSongMessageId.push(newMessage.id); // Menyimpan ID pesan baru dengan nama queue.lastSongMessageId
		})
		.catch(console.error);
};
