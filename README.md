# @gemini/configparser

Parser for [`gemini`](https://github.com/gemini-testing/gemini) configuration files.

Config is described with a combination of a functions:

```js
var parser = root(section({
    system: section({
        parallelLimit: option({
            parseEnv: Number,
            parseCli: Number,
            validate: function() {...}
        })
    }),
    browsers: map(
        section({
            calibrate: option(...),
            windowSize: option(...)
        })
    )
})
```

There are 4 types of values:

* `option({defaultValue, parseCli, parseEnv, validate, map})` - a single scalar option.
    - `defaultValue` - a default value to use if option is not provided
    - `defaultValue(config)` - a function to compute default value
    - `parseCli(value)` - a function used to parse command-line arguments
    - `parseEnv(value)` - a function used to parse environment variable
    - `validate(value, config)` - a function used to validate the option value
    - `map(value, config)` - a function used to transform the option value
* `section({sectionName1: valueParser1, sectionName2: valueParser2, ...})` - a section of a
  values with specified key names. Each option will parsed with appropriate parser function. 
  Any unknown value passed by user will be treated as an error.
* `map(valueParser)` - a map with any number of user-specifed keys. Each value is parsed by 
  `valueParser`.
* `root(parser)` - creates a root config parsers from specifed parser function. Returns function
  with signature `f({options, env, argv})`.



