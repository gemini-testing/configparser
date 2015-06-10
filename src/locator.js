import _ from 'lodash';

const ENV_PREFIX = 'gemini_';
const CLI_PREFIX = '--';

export default function locator({options, env, argv}) {
    function getNested(options, {namePrefix, envPrefix, cliPrefix}) {
        return (subKey) => {
            const envName = envPrefix + _.snakeCase(subKey);
            const cliFlag = cliPrefix + _.kebabCase(subKey);

            const argIndex = argv.indexOf(cliFlag);
            const option = _.get(options, subKey);
            const newName = `${namePrefix}.${subKey}`;
            return {
                name: newName,
                option: option,
                envVar: env[envName],
                cliOption: argIndex > -1? argv[argIndex + 1] : undefined,
                nested: getNested(option, {
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

