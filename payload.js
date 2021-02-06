const generateBlocks = (locations) => {
	const locBlocks = locations.map((loc) => ({
		"type": "section",
		"text": {
			"type": "mrkdwn",
			"text": "*" + loc.name + "*" + '\n' + loc.total_available + " slots are available."
		},
		"accessory": {
			"type": "button",
			"text": {
				"type": "plain_text",
				"emoji": true,
				"text": "Reserve"
			},
			"url": loc.url
		}
	}))

	let blocks = [
		{
			"type": "section",
			"text": {
				"type": "mrkdwn",
				"text": "*Hello there!* These new vaccine appointments are available."
			}
		},
		{
			"type": "divider"
		},
		{
			"type": "context",
			"elements": [
				{
					"type": "image",
					"image_url": "https://api.slack.com/img/blocks/bkb_template_images/notificationsWarningIcon.png",
					"alt_text": "notifications warning icon"
				},
				{
					"type": "mrkdwn",
					"text": `This message was posted at ${new Date().toLocaleTimeString()}. Vaccine appointments go quickly, so it might still be hard to get one. Data is fetched every 30 seconds from <https://nycvaccinelist.com/|nycvaccinelist.com>.`
				}
			]
		},
		{
			"type": "divider"
		},
		{
			"type": "context",
			"elements": [
				{
					"type": "mrkdwn",
					"text": "If this bot has helped you, or you have feedback, please consider filling out <https://g.willbarkoff.dev/vaccinefeedback|this> quick, 45 second feedback survey."
				}
			]
		}
	]

	return blocks.concat(locBlocks)
}

module.exports = {
	generateBlocks
}