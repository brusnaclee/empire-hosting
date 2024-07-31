const language = {
	loadevent: 'Memuat acara pemain',
	loadcmd: 'Perintah dimuat',
	siap: 'berhasil terhubung.',
	loadlash: 'Perintah aplikasi [/] berhasil dimuat ulang.',
	error1:
		'Token Bot yang Anda Masukkan Ke Proyek Anda Salah Atau Maksud Bot Anda MATI!',
	error2:
		'Silakan setel token bot di token.js atau di file .env Anda di proyek Anda!',
	loadclientevent: 'Acara klien dimuat',
	embed1:
		'Anda harus menetapkan peran <@&{djRole}>(DJ) di server ini untuk menggunakan perintah ini. Pengguna tanpa peran ini tidak dapat menggunakan {cmdMAP}',
	message1: 'Anda tidak tersambung ke saluran audio. ',
	message2: 'Anda tidak berada di saluran audio yang sama dengan saya. ',
	message3: 'Tidak ada izin',
	msg4: 'Ada yang tidak beres',
	msg5: 'Tidak ada musik yang sedang diputar. ',
	msg6: 'Simpan Musik',
	msg7: 'Tulis nama playlist.',
	msg8: 'Lagu ini live streaming, tidak ada data durasi untuk ditampilkan. 🎧',
	msg9: '** Berhasil:** Data waktu diperbarui.',
	msg10: 'Anda belum memiliki playlist dengan nama ini. ',
	msg11: 'Musik ini sudah ada di playlist ini. ❌',
	msg12: 'ditambahkan ke daftar putar musik Anda.',
	error3: 'Kesalahan memuat ulang aplikasi [/] perintah: ',
	error4:
		'PERINGATAN: Sepertinya Anda tidak menulis url mongodb? Jika Anda tidak memasukkan url mongodb yang valid di file config.js, Anda tidak akan dapat menggunakan bot.',
	msg13: ` Memulai memainkan:`,
	msg14:
		'Antrian saat ini kosong. Mohon tambahkan lebih banyak musik untuk dinikmati.',
	msg15:
		'Saya memutuskan sambungan karena tidak ada member lagi di saluran saya. 👋',
	msg16:
		'Saya mengalami masalah saat menghubungkan ke saluran suara. Seperti seseorang memutuskan hubungan saya? Saya sangat sedih. 😔',
	msg17: 'Tidak ada trek sebelumnya! ',
	msg18: 'Sekarang diputar **{queue.previousTracks[1].title}**. ',
	msg19: ' Statistik Bot',
	msg20: 'Segarkan',
	msg21: '**Waktu Anda Berakhir!**',
	msg22: '**✅ Data Diperbarui.**',
	msg23: 'Antrean kosong. ',
	msg24: 'Antrean baru saja dibersihkan. 🗑️',
	msg26:
		'Jika Anda tidak menentukan peran DJ, Anda tidak akan dapat menggunakan perintah!',
	msg25: 'Peran DJ berhasil disetel ke <@&{role}>.',
	msg27: 'Peran DJ berhasil dihapus.',
	msg28: 'Peran DJ belum ditetapkan.',
	msg29: `Silakan masukkan nama filter yang valid. ❌\n{filters}`,
	msg30: `Saya tidak dapat menemukan filter dengan nama itu. ❌\n{filters}`,
	msg31: `Diterapkan: **{filter}**, Status Filter: **{status}**\n **Ingat, jika musiknya panjang, waktu aplikasi filter mungkin lebih lama.**`,
	msg32: `
		Hello <@{interaction.user.id}>!
Selamat datang di **{client.user.username} Halaman Bantuan Perintah!**

**Instruction**

> Gunakan **/** sebagai awalan global.
> Gunakan **/help [diikuti dengan pertanyaan Anda untuk menanyakan apa pun kepada AI kami]** untuk melihat detail yang jelas.

**Music Control Panel Button Instruction**

> ⏪ tombol digunakan untuk memundurkan musik 15 detik.
> 
> ◀️ tombol untuk memutar musik sebelumnya.
> 
> ⏸️ tombol untuk menjeda musik.
> 
> ⏯️ tombol untuk melanjutkan musik.
> 
> ▶️ tombol untuk melewati musik saat ini.
> 
> ⏩ tombol digunakan untuk memajukan musik 15 detik.
> 
> 🔉 tombol digunakan untuk mengurangi volume 15.
> 
> 📃 tombol untuk menampilkan lirik.
> 
> ⏹️ tombol untuk menghentikan musik.
> 
> <:autoplay:1230869965435961394> tombol untuk mengaktifkan atau menonaktifkan autoplay antrian.
> 
> 🔊 tombol digunakan untuk menambah volume 15.
> 
> 🔀 tombol untuk mengacak musik dalam antrian.
> 
> <:download:1230868574722064446> tombol untuk mengunduh musik melalui gdrive.
> 
> ➕ tombol untuk menambahkan musik atau playlist ke antrian.
> 
> 💾 tombol untuk menyimpan musik ke playlist kamu.
> 
> 🔁 tombol untuk memutar ulang musik dalam antrian.

**Bot Information**

> ***help, statistic, invite, ping.***

**Music Commands**

> ***play music, play next, play playlist, search.***

**Music Control**

> ***autoplay, volume, shuffle, loop, filter, seek, remove, move, clear, back, skip, pause, resume, stop.***

**Music Information**

> ***nowplaying, lyrics, download, queue, time, suggest.***

**Playlist Commands**

> ***playlist create, playlist delete, playlist add-music, playlist delete-music, playlist lists, playlist top, save.***

**Admin Server Commands**

> ***channel add, channel remove, dj set, dj reset, language.***

**Feedback**

> ***feedback, report.***

Ingin bersantai, melaporkan bug, atau memberikan umpan balik? Bergabunglah dengan [The Great Empire]({config.support}) dan terhubung dengan sesama pecinta musik!

[Invite Me]({config.botInvite}) • [Support Server]({config.support2}) • [Vote]({config.voteManager.vote_url}) • [Website]({config.supportServer}) • [Sponsor]({config.sponsor.url})

		`,
	msg33: 'Perintah Bot',
	msg34: 'Anda sudah memiliki perintah aktif di sini. ❌',
	msg35: 'Antrian',
	msg36: 'Musik Sedang Diputar',
	msg37: 'Tutup Lingkaran',
	msg38: 'Sistem Putaran',
	msg39: `> **Bagaimana kalau membuat pilihan?**
   > 
   > **Antrean:** Memutar antrean.
   > **Musik Sedang Diputar:** Memutar ulang lagu saat ini.
   > **Tutup Loop:** Menutup loop.`,
	msg40: 'Mode Putaran Antrean',
	msg41: 'Ada yang tidak beres. ',
	msg42: 'Mode Loop Musik Sedang Diputar',
	msg43: 'Mode loop sudah tidak aktif. ',
	msg44: `Mode Putaran **Dihentikan** `,
	msg45: 'Waktu Habis',
	msg46: 'Sistem Loop - Berakhir',
	msg47: 'Simpan Daftar Putar',
	msg48: 'musik dijeda! ',
	msg49: `Pesan Ping`,
	msg50: `Latensi Pesan`,
	msg51: `Latensi API`,
	msg52: `Tidak ada daftar putar. `,
	msg53: `Anda tidak memiliki izin untuk memutar daftar putar ini. `,
	msg54: `Anda belum memiliki musik dengan nama ini. `,
	msg55: `Saya tidak dapat bergabung dengan saluran suara Anda. <a:Cross:1116983956227772476>`,
	msg56: `Memuat daftar putar... `,
	msg57: `<@{interaction.member.id}>, Menambahkan **{music_filter.length}** trek ke antrean. `,
	msg58: `Tidak ada playlist dengan nama ini. `,
	msg59: `Tulis nama trek yang ingin Anda cari. `,
	msg60: `Tidak ada hasil yang ditemukan! `,
	msg61: 'Memuat musik... ',
	msg62: 'daftar playlist ditambahkan ke daftar putar. ',
	msg63: `Antrian kosong. `,
	msg64: 'Daftar Musik Server',
	msg65: 'Sedang Diputar',
	msg66: 'Diminta oleh',
	msg67: 'Halaman',
	msg68: `Prosesor perintah telah dibatalkan. `,
	msg69: `Daftar Musik Server - Waktu Berakhir!`,
	msg70: `Waktu Anda telah habis untuk menggunakan perintah ini, Anda dapat mengetik \`/queue\` untuk menggunakan perintah ini lagi.`,
	msg71: `Ada yang tidak beres. Sepertinya Anda belum pernah menghentikan musik sebelumnya.`,
	msg72: 'Lagu dilanjutkan! ',
	msg73: `Silakan masukkan nama lagu yang valid.`,
	msg74: `Tidak ada hasil pencarian yang ditemukan! `,
	msg75: 'Musik yang Dicari',
	msg76: 'Pilih lagu dari **1** hingga **{maxTracks.length}** ⬇️',
	msg77: `Pencarian musik dibatalkan.`,
	msg78: `Memuat... 🎧`,
	msg79: 'ditambahkan ke antrean. ',
	msg80: `Waktu pencarian lagu habis.`,
	msg81: 'Batal',
	msg82: `Jumlah yang Anda masukkan lebih tinggi dari jumlah lagu dalam antrean. `,
	msg83: 'Berhasil dilewati ',
	msg84: `Lagu ini streaming langsung, tidak ada data durasi untuk ditampilkan. 🎧`,
	msg85: `Musik berhenti. Terima kasih telah menggunakan layanan kami.  `,
	msg86: 'Perbarui',
	msg87: `Volume saat ini: **{queue.volume}** <a:Musicon:1116994369833144350>\n**Untuk mengubah volume, dari \`1\` menjadi \`{maxVol}\` Ketik angka di dalam command /volume.**`,
	msg88: `Volume yang ingin Anda ubah sudah menjadi volume saat ini `,
	msg89: `**Ketik angka dari \`1\` ke \`{maxVol}\` untuk mengubah volume .** `,
	msg90: 'Volume berubah:',
	msg91: `Tulis nama daftar putar yang ingin Anda buat. ❌`,
	msg92: `Daftar putar dengan nama ini sudah ada. ❌`,
	msg93: `Anda tidak dapat memiliki lebih dari 30 daftar putar. ❌`,
	msg94: 'Membuat playlist... 🎧',
	msg95: 'Daftar putar dibuat! 🎧',
	msg96: `Anda belum memiliki daftar putar dengan nama ini. ❌`,
	msg97: 'Menghapus playlist... 🎧',
	msg98: 'Daftar putar dihapus! 🎧',
	msg99: `Tulis nama trek yang ingin Anda cari. ❌
  Silakan buat playlist terlebih dahulu dengan /playlist create (nama playlist)`,
	msg100: `Tulis nama daftar putar yang ingin Anda tambahkan musiknya. ❌`,
	msg101: `Anda tidak boleh memiliki lebih dari {max_music} musik dalam daftar putar. ❌`,
	msg102: 'Memuat musik... 🎧',
	msg103: 'Semua musik ditambahkan ke daftar putar Anda! 🎧',
	msg104: `Musik ini sudah ada di playlist ini. `,
	msg105: 'ditambahkan ke playlist! 🎧',
	msg106: `Tulis nama daftar putar yang musiknya ingin Anda hapus. ❌`,
	msg107: `Anda belum memiliki musik dengan nama ini. ❌`,
	msg108: 'Menghapus musik... 🎧',
	msg109: 'Musik dihapus! 🎧',
	msg110: 'Tulis nama playlist yang ingin dicari. ❌',
	msg111: `Anda tidak memiliki musik apa pun di daftar putar ini. ❌`,
	msg112: 'Daftar Putar Publik Teratas',
	msg113: `Waktu Anda telah habis untuk menggunakan perintah ini, Anda dapat mengetikkan \`/playlist top\` untuk menggunakan perintah ini lagi.`,
	msg114: `Tidak ada daftar putar publik. ❌`,
	msg115: 'Daftar Putar Anda',
	msg116: `musik`,
	msg117: `Anda tidak memiliki daftar putar apa pun. ❌`,
	msg118:
		'Waktu Anda telah habis untuk menggunakan perintah ini, Anda dapat mengetikkan `/playlist list {nama}` untuk menggunakan perintah itu lagi.',
	msg119:
		'Gunakan perintah **/play playlist <list-name>** untuk mendengarkan playlist ini.\nKetik **/playlist list <list-name>** untuk melihat musik dalam daftar.',
	msg120: 'Harap tentukan saluran teks.',
	msg121:
		'<#{channel}> ditambahkan ke daftar saluran penggunaan perintah, sekarang perintah bot hanya dapat digunakan pada saluran dalam daftar.',
	msg122: 'Belum ada data yang terdaftar.',
	msg123: '<#{channel}> dihapus ke daftar saluran penggunaan perintah.',
	msg124: 'Saluran ini sudah ada dalam daftar saluran penggunaan perintah.',
	msg125: 'Saluran ini bukan saluran teks.',
	msg126:
		' Berikut adalah daftar saluran yang dapat Anda perintahkan di server ini: {channel_filter}',
	msg127: 'Perintah tidak ditentukan.',
	error7:
		'Silakan coba perintah ini lagi nanti. Kemungkinan bug dilaporkan ke pengembang bot.',
	msg128:
		'Anda mendiamkan saya saat musik diputar. Itu sebabnya saya menghentikan musik. Jika Anda membatalkan mutenya, saya akan melanjutkan. 😔',
	msg129: 'bermain',
	msg130: 'Silakan tulis nomor yang valid.',
	msg131: 'untuk menggunakan perintah dalam daftar, Anda harus mendukung bot.',
	msg132: 'Tidak ada musik yang dijeda.',
	msg133: 'Saya mengacak urutan daftar putar.',
	msg134: 'Penggunaan salah. Contoh: `5:50` | `1:12:43`',
	msg135: 'Waktu pemutaran disetel ke {queue.formattedCurrentTime} berhasil',
	msg136:
		'Putar otomatis sekarang diaktifkan. Saya akan mengaktifkan musik acak mulai sekarang.',
	msg137: 'Putar otomatis tidak aktif sekarang.',
	msg138: 'Channel: **{queue?.connection.channel.name}** ',
	msg139:
		'Saya memberhentikan musik sejenak karena seluruh member telah keluar dari voice channel ❌',
	msg140:
		'Saya memainkan musik kembali karena telah ada member yang masuk ke voice channel 🎧',
	msg141:
		'Saya akan keluar sekarang karena tidak ada musik yang diputar selama 2 menit, sampai jumpa lagi... 👋',
	msg142: 'Lagu {trackName} telah dihapus.',
	msg143: 'Durasi',
	msg144: 'Lagu Berikutnya',
	msg145: 'Perkiraan waktu sampai dimainkan',
	msg146: 'Perkiraan waktu',
	msg147: 'Posisi Antrian',
	msg148:
		'Saya sudah menunggu selama 3 menit, tetapi sayangnya masih belum ada musik yang diputar. Terima kasih telah memilih layanan kami.',

	msg149:
		'Lagu **{trackName}** telah dipindahkan dari **antrian {fromOrder}** ke **antrian {toOrder}**.',
	msg150: 'Tambahkan Musik',
	msg151: 'Tulis nama musik.',
};
module.exports = language;
