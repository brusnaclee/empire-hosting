module.exports = async (client, textChannel, e) => {
	if (textChannel) {
		console.log(`${e.toString().slice(0, 1974)}`);
		console.log(e);
		return textChannel?.send(
			`**An error encountered:** ${e.toString().slice(0, 1974)}`
		);
	}
};
