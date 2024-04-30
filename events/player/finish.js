const db = require('../../mongoDB');
const { EmbedBuilder } = require('discord.js');
const { lastSongMessageId } = require('./addSong.js');

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

		/// Hapus pesan yang disimpan di queue.lastPlaylistMessageId
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

		// Hapus semua pesan yang telah terkirim sebelumnya\
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

	// Menunggu selama 2 menit
	await new Promise((resolve) => setTimeout(resolve, 120000));

	// Setelah 2 menit, cek apakah ada lagu yang sedang diputar
	const queueCheck = client.player.getQueue(queue?.textChannel?.guild?.id);
	if (!queueCheck || !queueCheck.playing) {
		// Jika tidak ada lagu yang diputar, kirim pesan baru
		const newEmbed = new EmbedBuilder()
			.setColor('#FF0000')
			.setTimestamp()
			.setDescription(`${lang.msg148} <a:Thankyou:1117120334810857623>`)
			.setFooter({ text: `Empire ❤️` });

		queue?.textChannel?.send({ embeds: [newEmbed] }).catch(console.error);
		const leaveOnEmpty = client.config.opt.voiceConfig.leaveOnEmpty?.status;

		// Jika konfigurasi leaveOnEmpty tidak diset atau false, maka keluar dari event
		if (!leaveOnEmpty) return;
		// Hentikan pemutaran lagu dan keluar dari voice channel
		queue.stop();
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
			console.error('Gagal menghapus pesan dari queue.FinishMessageId:', error);
		}
	}
};
