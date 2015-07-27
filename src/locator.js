import _ from 'lodash';

const ENV_PREFIX = 'gemini_';
const CLI_PREFIX = '--';

export default function initLocator({options, env, argv}) {
    argv = argv.reduce(function(argv, arg) {
        if (!_.includes(arg, '=')) {
            return argv.concat(arg);
        }
        const parts = arg.split('=');
        const option = parts[0];
        const value = parts.slice(1).join('=');
        return argv.concat(option, value);
    }, []);

    function getNested(option, {namePrefix, envPrefix, cliPrefix}) {
        return (subKey) => {
            const envName = envPrefix + _.snakeCase(subKey);
            const cliFlag = cliPrefix + _.kebabCase(subKey);

            const argIndex = argv.lastIndexOf(cliFlag);
            const subOption = _.get(option, subKey);
            const newName = `${namePrefix}.${subKey}`;
            return {
                name: newName,
                option: subOption,
                envVar: env[envName],
                cliOption: argIndex > -1 ? argv[argIndex + 1] : undefined,
                nested: getNested(subOption, {
                    namePrefix: newName,
                    envPrefix: `${envName}_`,
                    cliPrefix: `${cliFlag}-`
                })
            };
        };
    }

    return {
        name: 'root',
        option: options,
        envVar: undefined,
        cliOption: undefined,
        nested: getNested(options, {
            namePrefix: '',
            envPrefix: ENV_PREFIX,
            cliPrefix: CLI_PREFIX
        })
    };
}

