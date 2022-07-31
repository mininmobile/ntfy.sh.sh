# ntfy.sh.sh
run scripts on ntfy.sh events

![](https://github.com/mininmobile/ntfy.sh.sh/blob/master/docs/demo.gif?raw=true)

## configuration
configuration is stored in the `conf.json` file in the package directory. it contains an array of topic objects;

```js
{ // a topic object
	"host": "ntfy.sh" // optional, hostname or ip of a ntfy.sh instance
	"http": false,    // optional, if true use http instead of https
	"topic": "computer-alerts", // required, topic to subscribe to

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
