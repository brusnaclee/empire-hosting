const db = require('../../mongoDB');
const {
	EmbedBuilder,
	ButtonBuilder,
	ActionRowBuilder,
	ButtonStyle,
} = require('discord.js');
const axios = require('axios');

module.exports = async (client, queue, song, interaction) => {
	let lang = await db?.musicbot?.findOne({
		guildID: queue?.textChannel?.guild?.id,
	});
	lang = lang?.language || client.language;
	lang = require(`../../languages/${lang}.js`);

	if (queue) {
		if (!client.config.opt.loopMessage && queue?.repeatMode !== 0) return;
		if (queue?.textChannel) {
			const embed = new EmbedBuilder();
			embed.setColor(client.config.embedColor);
			embed.setThumbnail(song.thumbnail);

			let duration;
			if (song.formattedDuration === 0) {
				duration = `<a:musicnote:1116984203691687997> [${song.name}](${song.url})\n> ${lang.msg143}: \`Live\` <a:live:1118902454646493317>`;
			} else {
				duration = `<a:musicnote:1116984203691687997> [${song.name}](${song.url})\n> ${lang.msg143}: \`${song.formattedDuration}\`<a:loading1:1149363140186882178>`;
			}

			let estimatedTime;
			if (song.duration === 0) {
				estimatedTime = `> ${lang.msg146}: \`Live\` <a:live:1118902454646493317>`;
			} else {
				estimatedTime = `> ${lang.msg144}: <t:${Math.floor(
					(Date.now() + song.duration * 1000) / 1000
				)}:R> <a:loading1:1149363140186882178>`;
			}

			const additionalInfo = `> ${lang.msg66}: <@${song.user.id}> `;

			const description = `${duration}\n${estimatedTime}\n${additionalInfo}`;

			embed.setTitle(
				`<a:Vinyl:1116995858681053184> ${lang.msg13}`.replace(
					'{track?.title}',
					song?.name
				)
			);
			embed.setDescription(description);

			embed.setTimestamp();
			embed.setFooter({ text: 'Empire ❤️' });

			const backBtn = new ButtonBuilder()
				.setCustomId('back_button')
				.setEmoji('◀️')
				.setStyle(ButtonStyle.Secondary);

			const lyricBtn = new ButtonBuilder()
				.setCustomId('lyric_button')
				.setEmoji('📃')
				.setStyle(ButtonStyle.Secondary);

			const pauseBtn = new ButtonBuilder()
				.setCustomId('pause_button')
				.setEmoji('⏸️')
				.setStyle(ButtonStyle.Secondary);

			const stopBtn = new ButtonBuilder()
				.setCustomId('stop_button')
				.setEmoji('⏹️')
				.setStyle(ButtonStyle.Danger);

			const skipBtn = new ButtonBuilder()
				.setCustomId('skip_button')
				.setEmoji('▶️')
				.setStyle(ButtonStyle.Secondary);

			const saveButton = new ButtonBuilder()
				.setCustomId('saveTrack')
				.setEmoji('1117815593043775569')
				.setStyle(ButtonStyle.Secondary);

			const shufleButton = new ButtonBuilder()
				.setCustomId('shufle')
				.setEmoji('🔀')
				.setStyle(ButtonStyle.Secondary);

			const downloadButton = new ButtonBuilder()
				.setCustomId('save')
				.setEmoji('1230868574722064446')
				.setStyle(ButtonStyle.Secondary);

			const autoplayButton = new ButtonBuilder()
				.setCustomId('autoplay')
				.setEmoji('1230869965435961394')
				.setStyle(ButtonStyle.Secondary);

			const actionRow = new ActionRowBuilder().addComponents(
				backBtn,
				pauseBtn,
				skipBtn
			);

			const actionRow2 = new ActionRowBuilder().addComponents(
				lyricBtn,
				stopBtn,
				saveButton
			);

			const actionRow3 = new ActionRowBuilder().addComponents(
				shufleButton,
				downloadButton,
				autoplayButton
			);

			if (queue.lastMessageId) {
				if (queue.lastMessageId.length >= 5) {
					const oldestMessageId = queue.lastMessageId.shift(); // Ambil ID pesan yang paling lama terkirim (indeks terakhir)
					queue.textChannel.messages
						.delete(oldestMessageId)
						.catch(console.error); // Hapus pesan tersebut
				}
			} else {
				queue.lastMessageId = [];
			}

			if (queue.lastMessagesId) {
				if (queue.lastMessagesId.length >= 1) {
					const oldestMessageId = queue.lastMessagesId.shift(); // Ambil ID pesan yang paling lama terkirim (indeks terakhir)
					queue.textChannel.messages
						.fetch(oldestMessageId) // Ambil pesan yang akan dihapus
						.then((message) => {
							if (message) {
								message.edit({ components: [] }).catch(console.error); // Hapus komponen tombol dari pesan sebelumnya
							}
						})
						.catch(console.error);
				}
			} else {
				queue.lastMessagesId = [];
			}

			queue.textChannel
				.send({
					embeds: [embed],
					components: [actionRow, actionRow2, actionRow3],
				})
				.then((newMessage) => {
					// Menyimpan ID pesan baru ke dalam queue.lastMessageId
					queue.lastMessageId.push(newMessage.id);

					// Menyimpan ID pesan baru ke dalam queue.lastMessagesId
					queue.lastMessagesId.push(newMessage.id);
				})
				.catch(console.error);

			if (!queue.songHistory10) {
				queue.songHistory10 = [];
			}

			let title = song.name;

			const removeUnwantedWords = (str) => {
				return str
					.replace(
						/\(.*?\)|\[.*?\]|\bofficial\b|\bmusic\b|\bvideo\b|\blive\b|\blyrics\b|\blyric\b|\blirik\b|\bHD\b|\bversion\b|\bfull\b|\bMV\b|\bmv\b|\bcover\b|\bremix\b|\bfeaturing\b|\bver\b|\bversion\b|\bedit\b|\bclip\b|\bteaser\b|\btrailer\b|\bofficial audio\b|\bperformance\b|\bconcert\b|\bkaraoke\b|\btour\b|\bremastered\b|\bremake\b|\bintro\b|\boutro\b|\bvisualizer\b|\bvisual\b|\btrack\b|\bcensored\b|['.,":;\/\[\]()]/gi, // Menambahkan unwanted words dan simbol
						''
					)
					.replace(/\bft\.?.*$/i, '')
					.replace(/\bfeat\.?.*$/i, '')
					.replace(/\bby\b.*$/i, '')
					.replace(/\|.*$/g, '') // Menambahkan regex untuk menghapus semua kata setelah |
					.trim();
			};

			title = removeUnwantedWords(title);

			// Add the new song to the history with numbering
			queue.songHistory10.push(
				`${queue.songHistory10.length + 1}. ${title} - ${song.uploader.name}`
			);

			// Re-number the songs in the history
			if (queue.songHistory10.length > 10) {
				queue.songHistory10.shift(); // Only keep the last 10 songs
				queue.songHistory10 = queue.songHistory10.map(
					(song, index) => `${index + 1}. ${song.split('. ')[1]}`
				);
			}
		}
	}
};
