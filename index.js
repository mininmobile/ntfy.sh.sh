const { exec } = require("child_process");
const EventSource = require("eventsource");
const seedrandom = require("seedrandom");
const info = require("./package.json");
const config = require("./conf.json");
const argv = process.argv[0].includes("node") ? process.argv.slice(2) : process.argv.slice(1);

switch (argv[0]) {
	case "-v":
		console.log(info.name, "v" + info.version);
		Object.keys(info.dependencies).forEach(dependency =>
			console.log("→", dependency, require("./node_modules/" + dependency + "/package.json").version))
		break;

	case "-h":
		console.log("ntfyshsh < -v | -h | -t > ...");
		console.log();
		console.log([
			{a: "-v", d: "prints the command version"},
			{a: "-h", d: "prints command help"},
			{a: "-l", d: "lists all topics and tasks along with their ids"},
			{a: "-s", d: "sends a task to a topic, takes arguments: <topic> <task>\n\t\ - " +
			             "<topic> is the topic name or topic id to send the task to\n\t - " +
			             "<task> is the task name or task id to send"},
			{a: "n/a", d: "starts listening to topics for tasks"},
		].map(x => " " + x.a + "\t" + x.d).join("\n")),
		console.log();
		console.log("configuration is stored in", __dirname.replace(/\\/g, "/").replace(/[a-z]:\/Users\/.+?\/|\/home\/.+?\//i, "~/") + "/conf.json");
		break;

	case "-l": config.forEach((source, i) => {
		console.log(i, "|", source.topic);

		let tasks = Object.keys(source.tasks);
		tasks.forEach((t, j) =>
			console.log("\t", j, "|", t))
	}); break;

	case "-s":
		let topic = argv[1];
		let task = argv[2];

		if (!isNaN(parseInt(topic))) topic = config[parseInt(topic)]
		else if (topic) topic = config.find(x => x.topic == topic);
		if (!topic) { console.log("invalid <topic>"); break }

		if (!isNaN(parseInt(task))) task = Object.keys(topic.tasks)[parseInt(task)]
		if (!task) { console.log("invalid <task>"); break }

		console.log(task, "→", topic.topic);
		import("node-fetch").then(({default: fetch}) =>
			fetch((topic.http ? "http" : "https") + "://" + (topic.host || "ntfy.sh") + "/" + topic.topic, { method: "POST", body: task })
				.catch(e => console.log("ntfy.sh.sh:", e.message)));

		break;

	default: config.forEach((source, i) => {
		const stream = new EventSource(`https://ntfy.sh/${source.topic}/sse`);
		stream.onopen = (e) => e.data ? console.log("→ connected to topic", source.topic) : null;
		stream.onerror = (e) => console.log("← [error]", e.data);
		stream.onmessage = (event) => {
			let e = JSON.parse(event.data);
			let commands = source.tasks[e.message];
			if (commands) {
				console.log("←", source.topic, "|", e.message)
				commands.forEach(cmd => exec(cmd, (e, stdout, stderr) => {
					if (stderr || stdout)
						e ? console.log("!", stderr.trimEnd()) : console.log("≡", stdout.trimEnd())
				}));
			}
		};
	});
}
