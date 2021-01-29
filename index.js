import DotEnv from 'dotenv';
import { App } from '@slack/bolt';
import fetch from 'node-fetch';

DotEnv.config();

const channelID = "C01L9DB4JKD"

// 30 second interval
const interval = 30 * 1000


// Initializes your app with your bot token and signing secret
const app = new App({
	token: process.env.SLACK_BOT_TOKEN,
	signingSecret: process.env.SLACK_SIGNING_SECRET
});

(async () => {
	await app.start(process.env.PORT || 3000);

	let lastAvailableLocationIds = [];

	setInterval(async () => {
		let fetchresp = await fetch("https://nycvaccinelist.com/api/locations");
		let resp = await fetchresp.json()

		let availableLocations = resp.locations.filter(location => location.total_available > 0);
		let availableLocationIds = availableLocations.map(loc => loc.id);

		if (availableLocations.length < 1 || lastAvailableLocationIds == availableLocationIds) {
			return;
		}

		try {
			await app.client.chat.postMessage({
				channel: channelID,
				text: `There are vaccines available at ${availableLocations.map(loc => loc.name).join()}. Check nycvaccinelist.com for more information.`,
				token: process.env.SLACK_BOT_TOKEN,
			})
			lastAvailableLocationIds = availableLocationIds;
		} catch (e) {
		}

	}, interval);
})();