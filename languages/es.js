const language = {
	loadevent: 'Evento de reproductor cargado',
	loadcmd: 'Comando cargado',
	ready: ' conectado correctamente.',
	loadslash: 'Recarga exitosa de comandos de aplicación [/].',
	error1:
		'¡El token de bot que ingresó en su proyecto es incorrecto o los INTENTS de su bot están desactivados!',
	error2:
		'¡Por favor, establezca el token de bot en token.js o en su archivo .env en su proyecto!',
	loadclientevent: 'Evento de cliente cargado',
	embed1:
		'Debe tener el rol <@&{djRole}>(DJ) establecido en este servidor para usar este comando. Los usuarios sin este rol no pueden usar el {cmdMAP}',
	message1: 'No estás conectado a un canal de audio. ',
	message2: 'No estás en el mismo canal de audio que yo. ',
	message3: 'Permiso faltante',
	msg4: 'Algo salió mal',
	msg5: 'No hay música reproduciéndose actualmente. ',
	msg6: 'Guardar música',
	msg7: 'Escribe el nombre de la lista de reproducción.',
	msg8: 'Esta canción es una transmisión en vivo, no hay datos de duración para mostrar. 🎧',
	msg9: '** Éxito:** Actualización de datos de tiempo.',
	msg10: 'No tienes una lista de reproducción con este nombre. ',
	msg11: 'Esta música ya está en esta lista de reproducción. ❌',
	msg12: 'añadido a tu lista de reproducción de música.',
	error3: 'Error al recargar comandos de aplicación [/]: ',
	error4:
		'AVISO: Parece que no escribiste la URL de mongodb? Si no ingresas una URL de mongodb válida en el archivo config.js, no podrás usar el bot.',
	msg13: ` Reproduciendo:`,
	msg14:
		'La cola está actualmente vacía. Por favor, considera agregar más música para disfrutar.',
	msg15: 'Me desconecté porque no quedaba nadie en mi canal. ',
	msg16:
		'Tengo problemas para conectarme al canal de voz. ¿Como si alguien me desconectara? Estoy muy triste. 😔',
	msg17: '¡No hay canción anterior! ',
	msg18: 'Reproduciendo **{queue.previousTracks[1].title}**. ',
	msg19: ' Estadísticas del Bot',
	msg20: 'Actualizar',
	msg21: '**¡Tu tiempo ha terminado!**',
	msg22: '**✅ Datos actualizados.**',
	msg23: 'La cola está vacía. ',
	msg24: 'La cola acaba de ser limpiada. 🗑️',
	msg26: '¡Si no especifica un rol de DJ, no podrá usar el comando!',
	msg25: 'El rol de DJ se estableció con éxito en <@&{role}>.',
	msg27: 'El rol de DJ se ha eliminado con éxito.',
	msg28: 'El rol de DJ no está establecido.',
	msg29: `Por favor ingresa un nombre de filtro válido. ❌\n{filters}`,
	msg30: `No pude encontrar un filtro con ese nombre. ❌\n{filters}`,
	msg31: `Aplicado: **{filter}**, Estado del filtro: **{status}**\n **Recuerda, si la música es larga, el tiempo de aplicación del filtro puede ser mayor en consecuencia.**`,
	msg32: `
	Hello <@{interaction.user.id}>!
¡Bienvenido a la **{client.user.username} Página de Ayuda de Comandos!**

**Instruction**

> Usa **/** como prefijo global.
> Usa **/help [seguido de su pregunta para preguntar cualquier cosa a nuestra IA]** para ver los detalles claros.

**Music Control Panel Button Instruction**

> ⏪ botón se utiliza para retroceder la música 15 segundos.
> 
> ◀️ botón para reproducir la música anterior.
> 
> ⏸️ botón para pausar la música.
> 
> ⏯️ botón para reanudar la música.
> 
> ▶️ botón para saltar la música actual.
> 
> ⏩ botón se utiliza para adelantar la música 15 segundos.
> 
> 🔉 botón se utiliza para reducir el volumen 15.
> 
> 📃 botón para mostrar la letra.
> 
> ⏹️ botón para detener la música.
> 
> <:autoplay:1230869965435961394> botón para activar o desactivar la reproducción automática de la cola.
> 
> 🔊 botón se utiliza para aumentar el volumen 15.
> 
> 🔀 botón para mezclar la música en la cola.
> 
> <:download:1230868574722064446> botón para descargar la música vía gdrive.
> 
> ➕ botón para añadir música o lista de reproducción a la cola.
> 
> 💾 botón para guardar la música en tu lista de reproducción.
> 
> 🔁 botón para repetir la música en la cola.

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

¿Quieres pasar el rato, reportar errores o dar tu opinión? Únete a [The Great Empire]({config.support}) y conéctate con otros amantes de la música.

[Invite Me]({config.botInvite}) • [Support Server]({config.support2}) • [Vote]({config.voteManager.vote_url}) • [Website]({config.supportServer}) • [Sponsor]({config.sponsor.url})

	`,

	msg33: 'Comandos del Bot',
	msg34: 'Ya tienes un comando activo aquí. ❌',
	msg35: 'Cola',
	msg36: 'Reproduciendo Música',
	msg37: 'Cerrar Loop',
	msg38: 'Sistema de Loop',
	msg39: `> **¿Qué tal si hacemos una elección?**
  >
  > **Queue:** Repite la cola.
  > **Now Playing Music:** Repite la canción actual.
  > **Close Loop:** Cierra el loop.`,
	msg40: 'Modo de Loop de Cola',
	msg41: 'Algo salió mal. ',
	msg42: 'Modo de Loop de Música Reproduciendo',
	msg43: 'El modo de loop ya está inactivo. ',
	msg44: `Modo de Loop **Cerrado** `,
	msg45: 'Se acabó el tiempo',
	msg46: 'Sistema de Loop - Terminado',
	msg47: 'Guardar lista de reproducción',
	msg48: 'Música en pausa! ',
	msg49: `Latencia del Mensaje`,
	msg50: `Latencia de la API`,
	msg51: 'No hay lista de reproducción. ',
	msg52: 'No tienes permiso para reproducir esta lista de reproducción. ',
	msg53: 'No tienes ya una música con este nombre. ',
	msg54: 'No puedo unirme a tu canal de voz. ',
	msg55: 'Cargando lista de reproducción... ',
	msg56:
		'<@{interaction.member.id}>, Se añadieron **{music_filter.length}** canciones a la cola. ✅',
	msg57: 'No hay una lista de reproducción con este nombre. ',
	msg58: 'Escribe el nombre de la canción que quieres buscar. ',
	msg59: 'No se encontraron resultados! ',
	msg60: 'Cargando música(s)... ',
	msg61: 'Cargando música(s)... ',
	msg62: 'Lista de reproducción con nombre añadida. ',
	msg63: 'La cola está vacía. ',
	msg64: 'Lista de Música del Servidor',
	msg65: 'Reproduciendo actualmente',
	msg66: 'Solicitado por',
	msg67: 'Página',
	msg68: 'El procesador de comandos ha sido cancelado. ',
	msg69: 'Lista de Música del Servidor - ¡Se acabó el tiempo!',
	msg70:
		'Tu tiempo ha expirado para usar este comando, puedes escribir `/queue` para usar el comando de nuevo.',
	msg71: 'Algo salió mal. Parece que no has detenido la música antes.',
	msg72: '¡Canción reanudada! ',
	msg73: 'Por favor ingresa un nombre de canción válido.',
	msg74: '¡No se encontraron resultados de búsqueda!',
	msg75: 'Música Buscada',
	msg76: 'Elige una canción de **1** a **{maxTracks.length}** ⬇️',
	msg77: 'La búsqueda de música ha sido cancelada.',
	msg78: 'Cargando... 🎧',
	msg79: 'añadido a la cola.',
	msg80: 'El tiempo de búsqueda de canciones ha expirado.',
	msg81: 'Cancelar',
	msg82:
		'El número que ingresaste es mayor que la cantidad de canciones en la cola. ',
	msg83: 'Canción saltada.',
	msg84:
		'Esta canción es una transmisión en vivo, no hay datos de duración para mostrar. 🎧',
	msg85: 'La música ha sido detenida. ¡Hasta la próxima!',
	msg86: 'Actualizar',
	msg87:
		'Volumen actual: **{queue.volume}** <a:Musicon:1116994369833144350>\n**Para cambiar el volumen, con `1` a `{maxVol}` Ingresa un número entre.',
	msg88: 'El volumen que deseas cambiar ya es el volumen actual. ',
	msg89: '**Ingresa un número de `1` a `{maxVol}` para cambiar el volumen.**',
	msg90: 'Volumen cambiado:',
	msg91: 'Escribe el nombre de la lista de reproducción que deseas crear. ❌',
	msg92: 'Ya existe una lista de reproducción con este nombre. ❌',
	msg93: 'No puedes tener más de 30 listas de reproducción. ❌',
	msg94: 'Creando lista de reproducción... 🎧',
	msg95: '¡Lista de reproducción creada! 🎧',
	msg96: 'No tienes ya una lista de reproducción con este nombre. ❌',
	msg97: 'Eliminando lista de reproducción... 🎧',
	msg98: '¡Lista de reproducción eliminada! 🎧',
	msg99: 'Escribe el nombre de la canción que deseas buscar. ❌',
	msg100:
		'Escribe el nombre de la lista de reproducción a la que deseas añadir la música. ❌',
	msg101:
		'No puedes tener más de {max_music} música en una lista de reproducción. ❌',
	msg102: 'Cargando música(s)... 🎧',
	msg103: '¡Todas las músicas añadidas a tu lista de reproducción! 🎧',
	msg104: 'Esta música ya está en esta lista de reproducción. ',
	msg105: '¡Añadido a la lista de reproducción! 🎧',
	msg106:
		'Escribe el nombre de la lista de reproducción de la que deseas eliminar la música. ❌',
	msg107: 'No tienes ya una música con este nombre. ❌',
	msg108: 'Eliminando música... 🎧',
	msg109: '¡Música eliminada! 🎧',
	msg110: 'Escribe el nombre de la lista de reproducción que deseas buscar. ❌',
	msg111: 'No tienes música en esta lista de reproducción. ❌',
	msg112: 'Mejores listas de reproducción públicas',
	msg113:
		'Tu tiempo ha expirado para usar este comando, puedes escribir `/playlist top` para usar el comando de nuevo.',
	msg114: 'No hay listas de reproducción públicas. ❌',
	msg115: 'Tus listas de reproducción',
	msg116: 'músicas',
	msg117: 'No tienes ninguna lista de reproducción. ❌',
	msg118:
		'Tu tiempo ha expirado para usar este comando, puedes escribir `/playlist list {name}` para usar el comando de nuevo.',
	msg119:
		'Usa el comando **/play playlist <list-name>** para escuchar estas listas de reproducción.\nEscribe **/playlist list <list-name>** para ver la música en una lista.',
	msg120: 'Por favor especifica un canal de texto.',
	msg121:
		'<#{channel}> añadido a la lista de canales de uso de comandos, ahora los comandos del bot solo pueden usarse en los canales de la lista.',
	msg122: 'No hay datos registrados.',
	msg123: '<#{channel}> eliminado de la lista de canales de uso de comandos.',
	msg124: 'Este canal ya está en la lista de canales de uso de comandos.',
	msg125: 'Este canal no es un canal de texto.',
	msg126:
		'Aquí está la lista de canales en los que puedes usar comandos en este servidor: {channel_filter}',
	msg127: 'El comando no está definido.',
	error7:
		'Por favor intenta este comando de nuevo más tarde. Posible error reportado a los desarrolladores del bot.',
	msg128:
		'Me silenciaste mientras sonaba la música. Por eso la detuve. Si deshaces el silencio, continuaré. 😔',
	msg129: 'reproducciones',
	msg130: 'Por favor escribe un número válido.',
	msg131: 'para usar los comandos en la lista, necesitas votar por el bot.',
	msg132: 'No hay música pausada.',
	msg133: 'Arruiné el orden en la lista de reproducción.',
	msg134: 'Uso incorrecto. Ejemplo: `5:50` | `1:12:43`',
	msg135:
		'El tiempo de reproducción se estableció en {queue.formattedCurrentTime} con éxito',
	msg136: 'Autoplay está activado. Ahora voy a activar música aleatoria.',
	msg137: 'Autoplay está desactivado ahora.',
	msg138: 'Canal: **{queue?.connection.channel.name}** ',
	msg142: 'Se ha eliminado la pista {trackName}.',
	msg143: 'Duración',
	msg144: 'Siguiente Canción',
	msg145: 'Tiempo estimado hasta reproducirse',
	msg146: 'Tiempo Estimado',
	msg147: 'Posición en la cola',
	msg148:
		'Llevo esperando 3 minutos, pero lamentablemente todavía no hay música sonando. Gracias por elegir nuestro servicio.',

	msg149:
		'La canción **{trackName}** ha sido movida de la **cola {fromOrder}** a la **cola {toOrder}**.',
	msg150: 'Añadir música',
	msg151: 'Escribir nombre de la música.',
};
module.exports = language;
