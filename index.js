#!/usr/bin/env node
const { exec } = require("child_process");
const EventSource = require("eventsource");
const seedrandom = require("seedrandom");
const info = require("./package.json");
const config = require("./conf.json");
const argv = process.argv[0].includes("node") ? process.argv.slice(2) : process.argv.slice(1);

switch (argv[0]) {
	case "-v": case "--version":
		console.log(info.name, "v" + info.version);
		Object.keys(info.dependencies).forEach(dependency =>
			console.log("→", dependency, require("./node_modules/" + dependency + "/package.json").version));
		break;

	case "-h": case "--help": default:
		console.log("ntfyshsh < -v | -h | -l | -s > ...");
		console.log();
		console.log([
			["-v", "prints the command version"],
			["-h", "prints command help"],
			["-l", "lists all topics and tasks along with their ids"],
			["-s", "sends a task to a topic, takes arguments: <topic> <task>\n\t\ - " +
			       "<topic> is the topic name or topic id to send the task to\n\t - " +
			       "<task> is the task name or task id to send"],
			["n/a", "starts listening to topics for tasks"],
		].map(x => " " + x[0] + "\t" + x[1]).join("\n"));
		console.log();
		console.log("configuration is stored in", __dirname.replace(/\\/g, "/").replace(/[a-z]:\/Users\/.+?\/|\/home\/.+?\//i, "~/") + "/conf.json");
		break;

	case "-l": case "--list":
		config.forEach((source, i) => {
			console.log(i, "|", source.topic);

			let tasks = Object.keys(source.tasks);
			tasks.forEach((t, j) =>
				console.log("\t", j, "|", t))
		});
		break;

	case "-s": case "--send":
		let topic = argv[1];
		let task = argv[2];

		if (!isNaN(parseInt(topic))) topic = config[parseInt(topic)]
		else if (topic) topic = config.find(x => x.topic == topic);
		if (!topic) { console.log("invalid <topic>"); break }

		if (!isNaN(parseInt(task))) task = Object.keys(topic.tasks)[parseInt(task)]
		if (!task) { console.log("invalid <task>"); break }

		let token = generateToken(task, topic.key || "");
		console.log(task, "→", topic.topic);
		console.log(":", token);
		import("node-fetch").then(({default: fetch}) =>
			fetch((topic.http ? "http" : "https") + "://" + (topic.host || "ntfy.sh") + "/" + topic.topic, { method: "POST", body: token})
				.catch(e => console.log("ntfy.sh.sh:", e.message)));

		break;

	case undefined: config.forEach((source, i) => {
		const stream = new EventSource(`https://ntfy.sh/${source.topic}/sse`);
		stream.onopen = (e) => e.data ? console.log("→ connected to topic", source.topic) : null;
		stream.onerror = (e) => console.log("←", source.topic, "[error]", e.data);
		stream.onmessage = (event) => {
			let e = JSON.parse(event.data);
			if (isNaN(e.message)) return;
			Object.keys(source.tasks).forEach(task => {
				if (checkToken(e.message, task, e.time, source.key)) {
					let commands = source.tasks[task];
					console.log("←", source.topic, "|", task);
					commands.forEach(cmd => exec(cmd, (e, stdout, stderr) => {
						if (stderr || stdout)
							e ? console.log("!", stderr.trimEnd()) : console.log("≡", stdout.trimEnd())
					}));
				}
			});
		};
	});
}

function getTime(time = undefined, alt = false) {
	return new Date((alt ? Math.ceil : Math.floor)(new Date(time || new Date()).getTime() / (time ? 20 : 20000)) * 20000);
}

function generateToken(task, password = "") {
	return seedrandom(getTime(undefined, true).toString() + task + password).double().toString().substring(2);
}

function checkToken(token, task, time = undefined, password = "") {
	return token == seedrandom(getTime(time).toString() + task + password).double().toString().substring(2)
		|| token == seedrandom(getTime(time, true).toString() + task + password).double().toString().substring(2);
}
