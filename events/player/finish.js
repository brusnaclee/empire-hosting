const db = require('../../mongoDB');
const {
	EmbedBuilder,
	ButtonBuilder,
	ActionRowBuilder,
	ButtonStyle,
} = require('discord.js');
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

	const startTime = Date.now();

	// Set interval timer untuk melakukan pengecekan setiap beberapa detik
	const interval = setInterval(async () => {
		const queueCheck = client.player.getQueue(queue?.textChannel?.guild?.id);
		if (!queueCheck || !queueCheck.playing) {
			// Jika tidak ada lagu yang diputar
			const elapsedTime = Date.now() - startTime; // Waktu yang telah berlalu sejak queue dimulai
			const maxElapsedTime = 180000; // Durasi maksimum dalam milisecond (180 detik)
			if (elapsedTime >= maxElapsedTime) {
				// Jika waktu yang berlalu sudah mencapai durasi maksimum

				const newEmbed = new EmbedBuilder()
					.setColor('#FF0000')
					.setTimestamp()
					.setDescription(`${lang.msg148} <a:Thankyou:1117120334810857623>`)
					.setFooter({ text: `Empire ❤️` });

				const linkvote = new ButtonBuilder()
					.setLabel('Vote Us!')
					.setURL('https://top.gg/bot/1044063413833302108/vote')
					.setStyle(ButtonStyle.Link);

				const linkinvite = new ButtonBuilder()
					.setLabel('Invite Us!')
					.setURL(
						'https://discord.com/oauth2/authorize?client_id=1044063413833302108&permissions=414585318465&scope=bot+applications.commands'
					)
					.setStyle(ButtonStyle.Link);

				const Row = new ActionRowBuilder().addComponents(linkvote, linkinvite);

				queue?.textChannel
					?.send({ embeds: [newEmbed], components: [Row] })
					.catch(console.error);

				const leaveOnEmpty = client.config.opt.voiceConfig.leaveOnEmpty?.status;
				if (!leaveOnEmpty) {
					clearInterval(interval); // Hentikan interval timer jika tidak perlu lagi
					return;
				}
				// Hentikan pemutaran lagu dan keluar dari voice channel
				queue.stop();
				clearInterval(interval); // Hentikan interval timer setelah keluar
			}
		} else {
			// Jika ada lagu yang diputar, hapus pesan sebelumnya jika ada
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
				console.error(
					'Gagal menghapus pesan dari queue.FinishMessageId:',
					error
				);
			}
			clearInterval(interval); // Hentikan interval timer jika lagu sudah diputar
		}
	}, 3000); // Set interval timer untuk berjalan setiap 3 detik
};
