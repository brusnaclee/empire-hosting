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
		'Kailangan mong magtakda ng <@&{djRole}>(DJ) role sa server na ito upang magamit ang command na ito. Ang mga user na walang role na ito ay hindi makakagamit ng {cmdMAP}',
	message1: 'Hindi ka konektado sa isang audio channel. ',
	message2: 'Hindi ka nasa parehong audio channel tulad ng akin. ',
	message3: 'Kulang sa pahintulot',
	msg4: 'May mali',
	msg5: 'Walang musika na tumutugtog ngayon. ',
	msg6: 'I-save ang Musika',
	msg7: 'Ilagay ang pangalan ng playlist.',
	msg8: 'Ang kantang ito ay live streaming, walang data ng duration na maipapakita. 🎧',
	msg9: '** Tagumpay:** Na-update ang oras ng data.',
	msg10: 'Wala ka pang playlist sa pangalan na ito. ',
	msg11: 'Ang musika na ito ay nasa playlist na. ❌',
	msg12: 'nadagdag sa iyong playlist ng musika.',
	error3: 'Error sa pag-reload ng application [/] commands: ',
	error4:
		'BABALA: Mukhang hindi mo isinulat ang url ng mongodb? Kung hindi ka maglalagay ng valid mongodb url sa config.js file, hindi mo magagamit ang bot.',
	msg13: `Nagsimula ng pag-play:`,
	msg14:
		'Ang pila ay kasalukuyang walang laman. Mangyaring magdagdag ng higit pang musika upang masiyahan.',
	msg15:
		'Ako ay nag-disconnect dahil walang miyembro na natitira sa aking channel. 👋',
	msg16:
		'May problema ako sa pag-connect sa voice channel. Parang may nag-disconnect sa akin? Napakalungkot. 😔',
	msg17: 'Walang naunang track! ',
	msg18: 'Ngayon ay tumutugtog **{queue.previousTracks[1].title}**. ',
	msg19: ' Estadistika ng Bot',
	msg20: 'I-refresh',
	msg21: '**Natapos na ang Iyong Oras!**',
	msg22: '**✅ Na-update ang Data.**',
	msg23: 'Ang queue ay walang laman. ',
	msg24: 'Ang queue ay bagong linis. 🗑️',
	msg26: 'Kung hindi mo itinukoy ang DJ role, hindi ka makakagamit ng command!',
	msg25: 'Ang DJ role ay matagumpay na itinakda sa <@&{role}>.',
	msg27: 'Ang DJ role ay matagumpay na tinanggal.',
	msg28: 'Ang DJ role ay hindi pa itinakda.',
	msg29: `Mangyaring maglagay ng valid na filter name. ❌\n{filters}`,
	msg30: `Hindi ko mahanap ang filter na may ganitong pangalan. ❌\n{filters}`,
	msg31: `Naipatupad: **{filter}**, Kalagayan ng Filter: **{status}**\n **Tandaan, kung mahaba ang kanta, maaaring mas matagal ang oras ng pag-aplay ng filter.**`,
	msg32: `
		Hello <@{interaction.user.id}>!
		Maligayang pagdating sa **{client.user.username} Command Help Page!**
		
		**Instruction**

		> Gamitin ang **/** bilang global na prefix.
		> Gamitin ang **/help [kasunod ng iyong tanong para magtanong ng kahit anong bagay sa aming AI]** upang makita ang malinaw na mga detalye.
		
		**Music Control Panel Button Instruction**

		> ⏪ pindutan ay ginagamit upang i-rewind ang musika ng 15 segundo.
> 
> ◀️ pindutan para i-play ang nakaraang musika.
> 
> ⏸️ pindutan para i-pause ang musika.
> 
> ⏯️ pindutan para i-resume ang musika.
> 
> ▶️ pindutan para i-skip ang kasalukuyang musika.
> 
> ⏩ pindutan ay ginagamit upang i-forward ang musika ng 15 segundo.
> 
> 🔉 pindutan ay ginagamit upang bawasan ang volume ng 15.
> 
> 📃 pindutan para ipakita ang lyrics.
> 
> ⏹️ pindutan para itigil ang musika.
> 
> <:autoplay:1230869965435961394> pindutan para i-on o i-off ang autoplay ng queue.
> 
> 🔊 pindutan ay ginagamit upang taasan ang volume ng 15.
> 
> 🔀 pindutan para i-shuffle ang musika sa queue.
> 
> <:download:1230868574722064446> pindutan para i-download ang musika sa pamamagitan ng gdrive.
> 
> ➕ pindutan para magdagdag ng musika o playlist sa queue.
> 
> 💾 pindutan para i-save ang musika sa iyong playlist.
> 
> 🔁 pindutan para i-loop ang musika sa queue.
		
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

		Naghahanap ka ba ng kaibigan, nais magbigay ng feedback, o mag-ulat ng mga bugs? Sumali sa [The Great Empire]({config.support}) at makipag-ugnayan sa iba pang mga mahihilig sa musika!

		[Invite Me]({config.botInvite}) • [Support Server]({config.support2}) • [Vote]({config.voteManager.vote_url}) • [Website]({config.supportServer}) • [Sponsor]({config.sponsor.url})
		
		`,
	msg33: 'Bot na mga Utos',
	msg34: 'Meron ka nang aktibong utos dito. ❌',
	msg35: 'Pila',
	msg36: 'Tinutugtog na Musika',
	msg37: 'Itigil ang Loop',
	msg38: 'Sistema ng Loop',
	msg39: `> **Ano ang iyong pagpipilian?**
   > 
   > **Pila:** Pagtugtog ng pila.
   > **Tinutugtog na Musika:** Pag-ikot muli sa kasalukuyang kanta.
   > **Itigil ang Loop:** Pagtigil sa loop.`,
	msg40: 'Mode ng Loop ng Pila',
	msg41: 'May hindi maayos na nangyari. ',
	msg42: 'Mode ng Loop ng Tinutugtog na Musika',
	msg43: 'Ang mode ng loop ay hindi na aktibo. ',
	msg44: `Mode ng Loop **Itinigil** `,
	msg45: 'Nalipasan na ng oras',
	msg46: 'Sistema ng Loop - Nagwakas',
	msg47: 'I-save ang Playlist',
	msg48: 'Ang musika ay naka-pause! ',
	msg49: `Mensahe ng Ping`,
	msg50: `Latensya ng Mensahe`,
	msg51: `Latensya ng API`,
	msg52: `Wala pang playlist. `,
	msg53: `Wala kang pahintulot na mag-play ng playlist na ito. `,
	msg54: `Wala ka pang musika na may ganitong pangalan. `,
	msg55: `Hindi ako makapag-join sa inyong voice channel. <a:Cross:1116983956227772476>`,
	msg56: `Naglo-load ng playlist... `,
	msg57: `<@{interaction.member.id}>, Nagdagdag ng **{music_filter.length}** na track sa pila. `,
	msg58: `Walang playlist na may ganitong pangalan. `,
	msg59: `Ilagay ang pangalan ng track na gusto mong hanapin. `,
	msg60: `Walang natagpuang resulta! `,
	msg61: 'Naglo-load ng musika... ',
	msg62: 'Ang playlist na listahan ay idinagdag sa iyong listahan ng musika. ',
	msg63: `Ang pila ay walang laman. `,
	msg64: 'Listahan ng Musik na Server',
	msg65: 'Tumutugtog ngayon',
	msg66: 'Inihingi ng',
	msg67: 'Pahina',
	msg68: `Nabigo ang processor ng utos. `,
	msg69: `Listahan ng Musik na Server - Nagtapos ang Oras!`,
	msg70: `Nalipasan na ang iyong oras para gamitin ang utos na ito, maaari kang mag-type ng \`/queue\` para gamitin muli ang utos na ito.`,
	msg71: `Mayroong mali. Mukhang hindi mo pa itinigil ang musika noon.`,
	msg72: 'Nagpatuloy ang kanta! ',
	msg73: `Mangyaring ilagay ang isang valid na pangalan ng kanta.`,
	msg74: `Walang natagpuang resulta sa paghahanap! `,
	msg75: 'Inaasam na Musika',
	msg76: 'Pumili ng kanta mula sa **1** hanggang **{maxTracks.length}** ⬇️',
	msg77: `Ang paghahanap ng musika ay kanselado.`,
	msg78: `Naglo-load... 🎧`,
	msg79: 'idinagdag sa pila. ',
	msg80: `Nalipasan na ang oras sa paghahanap ng kanta.`,
	msg81: 'Kanselahin',
	msg82: `Ang bilang na inilagay mo ay mas mataas kaysa sa bilang ng mga kanta sa pila. `,
	msg83: 'Matagumpay na inilaktaw ',
	msg84: `Ang kanta na ito ay nagli-live streaming, walang data ng duration na maipapakita. 🎧`,
	msg85: `Itinigil ang musika. Salamat sa paggamit ng aming serbisyo.  `,
	msg86: 'I-update',
	msg87: `Kasalukuyang volume: **{queue.volume}** <a:Musicon:1116994369833144350>\n**Upang baguhin ang volume, mula sa \`1\` hanggang \`{maxVol}\` I-type ang numero sa loob ng command /volume.**`,
	msg88: `Ang volume na nais mong baguhin ay pareho na sa kasalukuyang volume `,
	msg89: `**I-type ang numero mula sa \`1\` hanggang \`{maxVol}\` para baguhin ang volume .** `,
	msg90: 'Nabago ang Volume:',
	msg91: `I-type ang pangalan ng playlist na gusto mong lumikha. ❌`,
	msg92: `Mayroon nang playlist na may ganitong pangalan. ❌`,
	msg93: `Hindi ka maaaring magkaroon ng higit sa 30 na playlist. ❌`,
	msg94: 'Naglilikhâ ng playlist... 🎧',
	msg95: 'Ang playlist ay naibuo! 🎧',
	msg96: `Wala ka pang playlist na may ganitong pangalan. ❌`,
	msg97: 'Binubura ang playlist... 🎧',
	msg98: 'Ang playlist ay binura! 🎧',
	msg99: `I-type ang pangalan ng kanta na gusto mong hanapin. ❌
  Mangyaring lumikha muna ng playlist gamit ang /playlist create (pangalan ng playlist)`,
	msg100: `I-type ang pangalan ng playlist na nais mong idagdag ang musika. ❌`,
	msg101: `Hindi ka dapat magkaroon ng higit sa {max_music} na musika sa playlist. ❌`,
	msg102: 'Nagloload ng musika... 🎧',
	msg103: 'Ang lahat ng musika ay idinagdag sa iyong playlist! 🎧',
	msg104: `Ang musikang ito ay nasa playlist na ito na. `,
	msg105: 'idinagdag sa playlist! 🎧',
	msg106: `I-type ang pangalan ng playlist na nais mong alisin ang musika. ❌`,
	msg107: `Wala ka pang musika na may ganitong pangalan. ❌`,
	msg108: 'Binubura ang musika... 🎧',
	msg109: 'Ang musika ay binura! 🎧',
	msg110: 'I-type ang pangalan ng playlist na nais mong hanapin. ❌',
	msg111: `Wala kang anumang musika sa playlist na ito. ❌`,
	msg112: 'Pinaka-Una sa Publikong Playlist',
	msg113: `Nalipasan na ang iyong oras para gamitin ang utos na ito, maaari kang mag-type ng \`/playlist top\` para gamitin muli ang utos na ito.`,
	msg114: `Walang mga publikong playlist. ❌`,
	msg115: 'Ang Iyong Playlist',
	msg116: `musika`,
	msg117: `Wala kang anumang playlist. ❌`,
	msg118:
		'Nalipasan na ang iyong oras para gamitin ang utos na ito, maaari kang mag-type ng `/playlist list {pangalan}` para gamitin muli ang utos na ito.',
	msg119:
		'Gamitin ang utos na **/play playlist <pangalan-ng-listahan>** para makinig sa playlist na ito.\nI-type **/playlist list <pangalan-ng-listahan>** para tingnan ang musika sa listahan.',
	msg120: 'Pakiusap tukuyin ang isang text channel.',
	msg121: `<#{channel}> idinagdag sa listahan ng mga channel na maaaring gamitin ang command, ngayon ang bot command ay maaaring gamitin lamang sa mga channel sa listahan.`,
	msg122: 'Walang data na naitala.',
	msg123: `<#{channel}> tinanggal sa listahan ng mga channel na maaaring gamitin ang command.`,
	msg124:
		'Ang channel na ito ay nasa listahan na ng mga channel na maaaring gamitin ang command.',
	msg125: 'Ang channel na ito ay hindi text channel.',
	msg126:
		'Ito ang listahan ng mga channel na maaari mong i-command sa server na ito: {channel_filter}',
	msg127: 'Command hindi nakalagay.',
	error7:
		'Mangyaring subukang muli ang command mamaya. Posible na may bug na naiulat sa developer ng bot.',
	msg128:
		'Ikaw ay tahimik habang nagpe-play ng musika. Kaya ko itinigil ang musika. Kung ikaw ay mag-unmute, magpapatuloy ako. 😔',
	msg129: 'nagpe-play',
	msg130: 'Mangyaring ilagay ang isang valid na numero.',
	msg131:
		'Upang gamitin ang command sa listahan, kailangan mong suportahan ang bot.',
	msg132: 'Walang musika na naka-pause.',
	msg133: 'Ako ay nag-shuffle ng playlist.',
	msg134: 'Maling paggamit. Halimbawa: `5:50` | `1:12:43`',
	msg135:
		'Tagal ng pag-play ay naitakda sa {queue.formattedCurrentTime} nang matagumpay',
	msg136:
		'Ang Auto-play ay ngayon ay aktibo. Ako ay mag-aactivate ng random music simula ngayon.',
	msg137: 'Ang Auto-play ay hindi aktibo ngayon.',
	msg138: 'Channel: **{queue?.connection.channel.name}**',
	msg139:
		'Itinigil ko pansamantala ang musika dahil lahat ng miyembro ay umalis sa voice channel ❌',
	msg140:
		'Ako ay nagpatuloy ng pag-play ng musika dahil may miyembro na bumalik sa voice channel 🎧',
	msg141:
		'Ako ay aalis na dahil walang musika na nagpe-play sa loob ng 2 minuto, hanggang sa muli... 👋',
	msg142: 'Ang kanta na {trackName} ay tinanggal.',
	msg143: 'Oras',
	msg144: 'Susunod na Kanta',
	msg145: 'Inaasahang oras bago ito mag-play',
	msg146: 'Inaasahang oras',
	msg147: 'Queue Position',
	msg148:
		'Tatlong minuto na akong naghihintay, ngunit sa kasamaang palad, wala pa ring musika na tumutugtog. Salamat sa pagpili ng aming serbisyo.',

	msg149:
		'Nailipat ang **{trackName}** mula **sa pila {fromOrder}** papunta **sa pila {toOrder}**.',
	msg150: 'Magdagdag ng Musika',
	msg151: 'Isulat ang pangalan ng musika.',
};
module.exports = language;
