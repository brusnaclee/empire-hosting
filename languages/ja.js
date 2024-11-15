const language = {
	loadevent: 'プレイヤーイベントの読み込みが完了',
	loadcmd: 'コマンドの読み込みが完了',
	ready: ' 接続に成功しました。',
	loadslash: 'スラッシュコマンドの再読み込みに成功しました。',
	error1:
		'プロジェクトに入力したボットのトークンが間違っているか、ボットのINTENTSがオフになっています!',
	error2:
		'ボットのトークンをtoken.jsまたはプロジェクト内の.envファイルに設定してください。!',
	loadclientevent: 'クライアントイベントの読み込みが完了',
	embed1:
		'このコマンドを使用するには、このサーバーに <@&{djRole}>(DJ) ロールが設定されている必要があります。このロールを持たないユーザは {cmdMAP} を使用できません。',
	message1: ' ボイスチャンネルに参加してください。',
	message2: ' 私と同じボイスチャンネルに接続してください。',
	message3: '❌ 権限が不足しています。',
	msg4: '⚠️ 何らかのエラーが発生しました。',
	msg5: ' 現在再生中の楽曲はありません。',
	msg6: '楽曲を保存する',
	msg7: 'プレイリスト名を入力してください',
	msg8: 'この楽曲はライブストリーミングであり、使用できるデュレーションデータはありません。',
	msg9: '** 成功:** タイムデータを更新しました。',
	msg10: ' この名前のプレイリストはまだありません。',
	msg11: '❌ この楽曲は既にこのプレイリストに入っています。',
	msg12: '楽曲をプレイリストに追加しました。',
	error3: '⚠️ スラッシュコマンドの再読み込み時にエラーが発生しました。： ',
	error4:
		'⚠️ 警告: mongodbのurlを書いてないようです。config.jsファイルに有効なmongodbのurlを書かないと、ボットを使用することができません。',
	msg13: ` 現在再生中：`,
	msg14: '現在キューは空です。もっと音楽を追加して楽しんでください。',
	msg15: '❌ 自分のチャンネルに誰もいなくなったので、切断しました。',
	msg16:
		' ボイスチャンネルに接続できませんでした。誰かに切断させられたようです。悲しいです…😔',
	msg17: ' 前のトラックはありません！',
	msg18: ' 「**{queue.previousTracks[1].title}**」を再生中です。',
	msg19: ' ボットの統計情報',
	msg20: '再読み込み',
	msg21: '**時間切れです！**',
	msg22: '**✅ データを更新しました。**',
	msg23: '❌ キューが空です。',
	msg24: '🗑️ キューの中身を削除しました。',
	msg26: 'DJロールを指定しない場合は、このコマンドを使用することができません!',
	msg25: 'DJロールが<@&{role}>に正常に設定されました。',
	msg27: 'DJロールは正常に削除されました。',
	msg28: 'DJロールは、まだ設定されていません。',
	msg29: `❌ 有効なフィルター名を入力してください。\n{filters}`,
	msg30: `❌ その名前のフィルターは見つかりませんでした。\n{filters}`,
	msg31: `選択されたフィルター: **{filter}**, フィルターのステータス: **{status}**\n **楽曲が長い場合、フィルターを適用させるために時間を要することがありますので、ご注意ください。**`,
	msg32: `
	Hello <@{interaction.user.id}>!
		{client.user.username}コマンドヘルプページへようこそ！
		
		**Instruction**

		> グローバルプレフィックスとして **/** を使用してください。
		> > 質問するときは **/help [質問内容]** を使用してください。
		
		**Music Control Panel Button Instruction**

> ⏪ ボタンは音楽を15秒巻き戻すために使用されます。
> 
> ◀️ ボタンは前の音楽を再生します。
> 
> ⏸️ ボタンは音楽を一時停止します。
> 
> ⏯️ ボタンは音楽を再開します。
> 
> ▶️ ボタンは現在の音楽をスキップします。
> 
> ⏩ ボタンは音楽を15秒進めるために使用されます。
> 
> 🔉 ボタンは音量を15下げるために使用されます。
> 
> 📃 ボタンは歌詞を表示します。
> 
> ⏹️ ボタンは音楽を停止します。
> 
> <:autoplay:1230869965435961394> ボタンはキューの自動再生をオンまたはオフにします。
> 
> 🔊 ボタンは音量を15上げるために使用されます。
> 
> 🔀 ボタンはキューの音楽をシャッフルします。
> 
> <:download:1230868574722064446> ボタンは音楽をgdrive経由でダウンロードします。
> 
> ➕ ボタンはキューに音楽やプレイリストを追加します。
> 
> 💾 ボタンは音楽をプレイリストに保存します。
> 
> 🔁 ボタンはキューの音楽をループします。
		
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

		遊びに来たり、バグを報告したり、フィードバックをしたいですか？ [The Great Empire]({config.support})に参加して、他の音楽愛好家とつながりましょう！

		[Invite Me]({config.botInvite}) • [Support Server]({config.support2}) • [Vote]({config.voteManager.vote_url}) • [Website]({config.supportServer}) • [Sponsor]({config.sponsor.url})
		
	`,

	msg33: 'ボットのコマンド',
	msg34: '❌ 既にアクティブなコマンドがあります。',
	msg35: 'キュー',
	msg36: '現在再生中の楽曲',
	msg37: 'ループをやめる',
	msg38: 'ループシステム',
	msg39: `> **以下からお選びください。**
   >
   > **キュー:** キューをループ再生します。.
   > **現在再生中の楽曲:** 現在再生中の楽曲をループ再生します。
   > **ループを閉じる:** ループ再生をやめます。`,
	msg40: 'キューをループします。',
	msg41: ' 何らかのエラーが発生しました。',
	msg42: '現在再生中の楽曲をループします。',
	msg43: ' ループモードは既に無効です。',
	msg44: `ループ再生をやめます。`,
	msg45: 'タイムアウトしました。',
	msg46: 'ループシステムを終了しました。',
	msg47: 'プレイリストに保存する',
	msg48: ' 楽曲の再生を一時停止しました。',
	msg49: `メッセージのPing`,
	msg50: `メッセージのLatency`,
	msg51: `APIのLatency`,
	msg52: ` プレイリストがありません。`,
	msg53: ` このプレイリストを再生する権限がありません。`,
	msg54: ` そのプレイリストにその名前の楽曲はありません。`,
	msg55: `<a:Cross:1116983956227772476> あなたが接続しているボイスチャンネルに接続できませんでした。`,
	msg56: ` プレイリストを読み込み中…`,
	msg57: `<@{interaction.member.id}>\n **{music_filter.length}** 件の楽曲をキューに追加しました。`,
	msg58: ` この名前のプレイリストはありません。`,
	msg59: ` 検索したい楽曲の名前を書いてください。`,
	msg60: ` 見つかりませんでした！`,
	msg61: ' 楽曲を読み込んでいいます...',
	msg62: 'という名前のリストがプレイリストに追加されました。',
	msg63: ` キューが空です。`,
	msg64: 'サーバー楽曲リスト',
	msg65: '現在再生中',
	msg66: '追加したユーザー',
	msg67: 'ページ',
	msg68: `コマンドプロセッサはキャンセルされました。`,
	msg69: `サーバー再生リストを終了しました。`,
	msg70: `一定時間経過したため、キューの表示を終了しました。再度表示するには\`/queue\`を実行してください。`,
	msg71: ` エラーが発生しました。一時停止していなかった可能性があります。`,
	msg72: ' 楽曲の再生を再開しました。',
	msg73: ` 有効な曲名を入力してください。`,
	msg74: ` 検索結果が見つかりませんでした！`,
	msg75: '検索結果',
	msg76:
		'**1** から **{maxTracks.length}** の中から、キューに追加する楽曲を選んでください ⬇️',
	msg77: ` 楽曲検索がキャンセルされました。`,
	msg78: `🎧 読み込み中...`,
	msg79: ' キューに楽曲を追加しました。',
	msg80: ` 一定時間経過したため、検索結果の表示を終了しました。`,
	msg81: 'キャンセル',
	msg82: ` 入力された数字が、キュー内の曲数より多いです。番号を確認してください。`,
	msg83: ' 楽曲をスキップしました。',
	msg84: `🎧 この楽曲はライブストリーミングであり、使用できるデュレーションデータはありません。`,
	msg85: `音楽が止まりました。平素は弊社サービスをご利用いただき誠にありがとうございます。 `,
	msg86: '更新',
	msg87: `現在の音量: **{queue.volume}** <a:Musicon:1116994369833144350>\n**音量を変えるには、\`1\` から \`{maxVol}\` の間の数字を入力してください。**`,
	msg88: ` 既にその音量で再生しています。`,
	msg89: ` **音量を変えるには、\`1\` から \`{maxVol}\` の間の数字を入力してください。**`,
	msg90: '音量が変更されました:',
	msg91: `❌ 作成したいプレイリストの名前を入力してください。`,
	msg92: `❌ この名前のプレイリストは既に存在しています。`,
	msg93: `❌ 30個以上プレイリストを所有することが出来ません。`,
	msg94: '🎧 プレイリストを作成中...',
	msg95: '🎧 プレイリストを作成しました！',
	msg96: `❌ この名前のプレイリストはまだありません。`,
	msg97: '🎧 プレイリストを削除しています...',
	msg98: '🎧 プレイリストを削除しました！',
	msg99: `❌ 検索したいトラックの名前を書いてください。`,
	msg100: `❌ 楽曲を追加したいプレイリストの名前を書いてください。`,
	msg101: `❌ プレイリストに {max_music} 件以上の楽曲を入れることはできません。`,
	msg102: '🎧 楽曲を読み込み中...',
	msg103: '🎧 すべての楽曲がプレイリストに追加されます！',
	msg104: ` この楽曲は、既にこのプレイリストに含まれています。`,
	msg105: '🎧 プレイリストに追加しました!',
	msg106: `❌ 楽曲を削除したいプレイリストの名前を書いてください。`,
	msg107: `❌ この名前の楽曲はありません。`,
	msg108: '🎧 楽曲を削除しています...',
	msg109: '🎧 楽曲を削除しました！',
	msg110: '❌ 検索したいプレイリストの名前を書いてください。',
	msg111: `❌ このプレイリストには、楽曲がありません。`,
	msg112: 'トップ公開プレイリスト',
	msg113: `一定時間経過したため、トップ公開プレイリストの表示を終了しました。再度表示するには\`/playlist top\`を実行してください。`,
	msg114: `❌ 再生されたことのある公開プレイリストがありません。`,
	msg115: 'あなたのプレイリスト',
	msg116: `件の楽曲`,
	msg117: `❌ あなたはプレイリストを所有していません。`,
	msg118:
		'一定時間経過したため、プレイリストの表示を終了しました。再度使用するには `/playlist list {プレイリスト名}` を実行してください。',
	msg119:
		'これらのプレイリストを聴くには、**/play playlist <プレイリスト名>**コマンドを実行してください。\n楽曲をリストで見るには、**/playlist list <プレイリスト名>**を実行してください。',
	msg120: 'テキストチャンネルを指定してください。',
	msg121:
		'<#{channel}> をコマンド使用チャンネルに追加しました。これにより、それ以外のチャンネルではコマンドが使用できなくなりました。',
	msg122: '既に登録されているデータはありません。',
	msg123: '<#{channel}> をコマンド使用チャンネルから削除しました。',
	msg124: 'このチャンネルは、すでにコマンド使用チャンネルに登録されています。',
	msg125: 'このチャンネルは、テキストチャンネルではありません。',
	msg126:
		' このサーバーでコマンド可能なチャンネルの一覧です： {channel_filter}',
	msg127: 'コマンドは定義されていません。',
	error7:
		'このコマンドは後でもう一度試してください。ボット開発者に報告されたバグの可能性があります。',
	msg128:
		'楽曲再生中にミュートに設定されたため、楽曲の再生を停止しました。再生を再開するには、ミュートを解除してください。',
	msg129: '再生',
	msg130: '有効な番号を入力してください。',
	msg131: 'このコマンドを実行するためには、ボットに投票する必要があります。',
	msg132: '一時停止している楽曲はありません。',
	msg133: 'キューの中身をシャッフルしました。',
	msg134: '誤った使い方をしています。 正しい例: `5:50` | `1:12:43`',
	msg135: '再生時間を {queue.formattedCurrentTime} に正常に設定しました。',
	msg136:
		'自動再生を有効にしました。これからはランダムな楽曲再生を有効にします。',
	msg137: '自動再生を無効にしました。',
	msg138: 'チャンネル: **{queue?.connection.channel.name}** ',
	msg142: 'トラック {trackName} が削除されました.',
	msg143: '期間',
	msg144: '次の曲',
	msg145: '再生までの推定時間',
	msg146: '推定時間',
	msg147: 'キューの位置',
	msg148:
		'3分間待っていますが、残念ながらまだ音楽が再生されていません。当サービスをご利用いただきありがとうございます。',

	msg149:
		'**{trackName}** が **キュー {fromOrder}** から **キュー {toOrder}** に移動しました。',
	msg150: '音楽を追加',
	msg151: '音楽の名前を書いてください。',
};
module.exports = language;
