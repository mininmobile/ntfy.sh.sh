# ntfy.sh.sh
run scripts on ntfy.sh events

![](https://github.com/mininmobile/ntfy.sh.sh/blob/master/docs/demo.gif?raw=true)

# installation
ntfy.sh.sh requires node.js (unfortunately) so you need to have that installed

## from npm
```sh
$ npm i -g ntfy.sh.sh
```

## from source
```sh
$ git clone https://github.com/mininmobile/ntfy.sh.sh.git

$ cd ntfy.sh.sh

$ npm i # install dependencies

$ npm i -g # add to path
```

# usage
to use, run the command `ntfyshsh` (no periods!!) in the terminal, some useful arguments;

`-h` or `--help` will list *all* possible arguments as well as the location of the configuration file

`-l` or `--list` lists all of the topics and tasks with their respective ids in the configuration file

`-s` or `--send` takes a topic name/id and a task name/id argument, then sends that task to the topic

not specifying any argument will start ntfy.sh.sh and listen for tasks on all topics in the configuration file

## configuration
configuration is stored in the `conf.json` file in the package directory. it contains an array of topic objects;

```js
{ // a topic object
	"host": "ntfy.sh" // optional, hostname or ip of a ntfy.sh instance
	"http": false,    // optional, if true use http instead of https
	"topic": "computer-alerts", // required, topic to subscribe to
	"key": "password", // optional, used to add entropy to the event token

	// tasks to perform in the format of <task name> to <array of commands>
	// the following are examples for windows commandline, but ntfy.sh.sh runs anywhere node.js does
	"tasks": {
		// opening an application
		"open file manager": [ "start explorer ." ],
		// run command with output to stdout
		"run test": [ "echo hi" ],
		// run a script in a new window
		"run script": ["start cmd /C \"bin\\script.bat\""],
		// execute multiple commands
		"enter hacker mode": [ "start cmd /C \"color 0a && tree C:", "start cmd /C \"color 0a && tree C:" ],
	}
}
```

# security
when ntfy.sh.sh dispatches an event, it uses a token as the message (eg. `6057429153136659`). when ntfy.sh.sh receives an event it generates tokens locally and compares them to the one in the event, if one matches the task specified by the token will be ran.

as ntfy.sh is unauthenticated by default, the `key`s you set in the configuration can help you to somewhat better protect you on public ntfy.sh instances. if a key is not set it is treated as if it were an empty string. the generated token is simply a random integer seeded with the current unix timestamp with 20 seconds of percision combined with the `task` and `key`

**n.b.** if anyone other then you has access to the stream, they can repeat the task you just called for up to 20 seconds, the only guaranteeably secure method to use ntfy.sh.sh is to use a self-hosted ntfy.sh instance with [access control](https://ntfy.sh/docs/config/#access-control) (todo: allow ntfy.sh.sh to send/receive authenticated events)
