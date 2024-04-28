const db = require('../../mongoDB');
const { EmbedBuilder } = require('discord.js');

module.exports = async (client, queue, playlist) => {
	let lang = await db?.musicbot?.findOne({
		guildID: queue?.textChannel?.guild?.id,
	});
	lang = lang?.language || client.language;
	lang = require(`../../languages/${lang}.js`);

	const embed = new EmbedBuilder()
		.setColor('00FF7D')
		.setTimestamp()
		.setDescription(
			`<@${playlist.user.id}>, \`${playlist.name} (${playlist.songs.length} ${lang.msg116})\` ${lang.msg62} <a:Ceklis:1116989553744552007>`
		)
		.setFooter({ text: `Empire ❤️` });

	// Menghapus pesan sebelumnya dari bot jika ada
	if (queue.lastPlaylistMessageId) {
		queue.textChannel.messages
			.fetch(queue.lastPlaylistMessageId)
			.then((message) => {
				if (message) {
					message.delete().catch(console.error);
				}
			})
			.catch(console.error);
	}

	// Mengirim pesan baru dan menyimpan ID-nya untuk dihapus nanti
	queue?.textChannel
		?.send({ embeds: [embed] })
		.then((newMessage) => {
			queue.lastPlaylistMessageId = newMessage.id; // Menyimpan ID pesan baru dengan nama lastPlaylistMessageId
		})
		.catch((e) => {});
};
