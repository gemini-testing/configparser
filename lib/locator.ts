const _ = require('lodash');

function parseArgv(argv, cliPrefix) {
    return argv.reduce(function(argv, arg) {
        if (!arg.startsWith(cliPrefix) || !_.includes(arg, '=')) {
            return argv.concat(arg);
        }

        const parts = arg.split('=');
        const option = parts[0];
        const value = parts.slice(1).join('=');

        return argv.concat(option, value);
    }, []);
}

module.exports = function({options, env, argv, envPrefix = '', cliPrefix = '--'}) {
    const parsedArgv = parseArgv(argv, cliPrefix);

    function getNested(option, {namePrefix, envPrefix, cliPrefix}) {
        return (subKey) => {
            const envName = envPrefix + _.snakeCase(subKey);
            const cliFlag = cliPrefix + _.kebabCase(subKey);

            const argIndex = parsedArgv.lastIndexOf(cliFlag);
            const subOption = _.get(option, subKey);
            const newName = namePrefix ? `${namePrefix}.${subKey}` : subKey;

            return mkLocator(
                {
                    name: newName,
                    parent: namePrefix,
                    option: subOption,
                    envVar: env[envName],
                    cliOption: argIndex > -1 ? parsedArgv[argIndex + 1] : undefined
                },
                {
                    namePrefix: newName,
                    envPrefix: `${envName}_`,
                    cliPrefix: `${cliFlag}-`
                }
            );
        };
    }

    function mkLocator(base, prefixes) {
        return _.extend(base, {
            nested: getNested(base.option, prefixes),
            resetOption: function(newOptions) {
                return _.extend({}, base, {
                    option: newOptions,
                    nested: getNested(newOptions, prefixes)
                });
            }
        });
    }

    return mkLocator(
        {
            name: 'root',
            parent: '',
            option: options,
            envVar: undefined,
            cliOption: undefined
        },
        {
            namePrefix: '',
            envPrefix,
            cliPrefix
        }
    );
};
