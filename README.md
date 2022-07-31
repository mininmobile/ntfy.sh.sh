# ntfysh
run scripts on ntfy.sh events

## configuration
```js
const config = [
	{
		"topic": "computer-alerts",
		"key": "password",
		"tasks": {
			"open file manager": [ "start explorer ." ],
			"enter hacker mode": [ "color 0a && tree E:", "color 0a && tree E:", "color 0a && tree E:" ],
			"run script": ["bin\\script.bat"],
		}
	}
]
```
