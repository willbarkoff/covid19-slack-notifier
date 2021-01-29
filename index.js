const DotEnv = require('dotenv');
const { App } = require('@slack/bolt');
const fetch = require('node-fetch');

DotEnv.config();

const channelID = "C01L9DB4JKD"

// 30 second interval
const interval = 30 * 1000


// Initializes your app with your bot token and signing secret
const app = new App({
	token: process.env.SLACK_BOT_TOKEN,
	signingSecret: process.env.SLACK_SIGNING_SECRET,
});

(async () => {
	await app.start(process.env.PORT || 3000);

	let lastAvailableLocationIds = [];

	setInterval(async () => {
		let fetchresp = await fetch("https://nycvaccinelist.com/api/locations");
		let resp = await fetchresp.json()

		let availableLocations = resp.locations.filter(location => location.total_available > 0);
		let availableLocationIds = availableLocations.map(loc => loc.id);

		if (JSON.stringify(lastAvailableLocationIds) == JSON.stringify(availableLocationIds)) {
			return;
		}
		try {
			if (availableLocations.length < 1 && lastAvailableLocationIds.length >= 1) {
				await app.client.chat.postMessage({
					channel: channelID,
					text: `These vaccines are no longer available. Check nycvaccinelist.com for more information.`,
					token: process.env.SLACK_BOT_TOKEN,
				})
			} else if (availableLocations.length > 1) {
				await app.client.chat.postMessage({
					channel: channelID,
					text: `There are vaccines available at ${availableLocations.map(loc => loc.name).join()}. Check nycvaccinelist.com for more information.`,
					token: process.env.SLACK_BOT_TOKEN,
				})
			}
		} catch (e) {
			console.error(e)
		} finally {
			lastAvailableLocationIds = availableLocationIds;
		}

	}, interval);
})();