const { exec } = require("child_process");
const EventSource = require("eventsource");
const seedrandom = require("seedrandom");

const config = require("./conf.json") || [
	{
		"topic": "disk-alerts",
		"key": "password123",
		"tasks": {
			"open file manager": [ "explorer" ],
		}
	}
];

if (process.argv[0] == "-v") {
	console.log("ntfysh :)");
} else if (process.argv[0] == "-d") {
	console.log("ntfysh :)");
} else {
	config.forEach(source => {
		const stream = new EventSource(`https://ntfy.sh/${source.topic}/sse`);

		stream.onmessage = (e) => {
			Object.keys(source.tasks).forEach(t => {
				if (e.data.includes(t)) {
					source.tasks[t].forEach(x => {
						let cmd = `start cmd /C "${x}"`;
						console.log(cmd);
						exec(cmd);
					});
				}
			})
		};
	});
}

function init() {

}
