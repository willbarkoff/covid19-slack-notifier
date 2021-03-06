const DotEnv = require('dotenv');
const { App } = require('@slack/bolt');
const fetch = require('node-fetch');

const { generateBlocks } = require("./payload")

DotEnv.config();

const channelID = "C01L9DB4JKD"

// 30 second interval
const interval = 30 * 1000


// Initializes your app with your bot token and signing secret
const app = new App({
	token: process.env.SLACK_BOT_TOKEN,
	signingSecret: process.env.SLACK_SIGNING_SECRET
});

const arrayEquals = (arr1, arr2) => {
	return (arr1.length == arr2.length
		&& arr1.every(function (u, i) {
			return u === arr2[i];
		})
	)
}

(async () => {
	await app.start(process.env.PORT || 3000);

	let lastAvailableLocationIds = [];

	setInterval(async () => {
		let fetchresp = await fetch("https://nycvaccinelist.com/api/locations");
		let resp = await fetchresp.json()

		let availableLocations = resp.locations.filter(location => {
			if (location.total_available < 9) {
				return false
			}

			if (location.name.indexOf("NYCHA") > -1) {
				return false
			}

			if (location.name.indexOf("Zip Code") > -1) {
				return false
			}

			if (location.name.indexOf("City Employees Only") > -1) {
				return false
			}

			return true
		});
		let availableLocationIds = availableLocations.map(loc => loc.id);

		if (arrayEquals(lastAvailableLocationIds, availableLocationIds) || availableLocationIds.length < 1) {
			return;
		}

		try {
			await app.client.chat.postMessage({
				channel: channelID,
				text: `There are vaccines available at ${availableLocations.map(loc => loc.name).join()}. Check nycvaccinelist.com for more information.`,
				token: process.env.SLACK_BOT_TOKEN,
				blocks: generateBlocks(availableLocations)
			})
		} catch (e) {
			console.error(e)
		} finally {
			lastAvailableLocationIds = availableLocationIds;
		}

	}, interval);
})();