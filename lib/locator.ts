import _ from 'lodash';

import type {LocatorArg, Locator, Node, Prefixes} from './types/locator';

function parseArgv(argv: Array<string>, cliPrefix: string): Array<string> {
    return argv.reduce(function(argv, arg) {
        if (!arg.startsWith(cliPrefix) || !_.includes(arg, '=')) {
            return argv.concat(arg);
        }

        const parts = arg.split('=');
        const option = parts[0];
        const value = parts.slice(1).join('=');

        return argv.concat(option, value);
    }, [] as Array<string>);
}

export = function initLocator<Options>({options, env, argv, envPrefix = '', cliPrefix = '--'}: LocatorArg<Options>): Locator<Options> {
    const parsedArgv = parseArgv(argv, cliPrefix);

    function getNested<Options>(option: Options | undefined, {namePrefix, envPrefix, cliPrefix}: Prefixes) {
        return <Key extends keyof Options>(subKey: Key): Locator<Options[Key]> => {
            const stringSubKey = subKey.toString();

            const envName = envPrefix + _.snakeCase(stringSubKey);
            const cliFlag = cliPrefix + _.kebabCase(stringSubKey);

            const argIndex = parsedArgv.lastIndexOf(cliFlag);
            const subOption: Options[Key] = _.get(option, subKey);
            const newName = namePrefix ? `${namePrefix}.${stringSubKey}` : stringSubKey;

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

    function mkLocator<Options>(base: Node<Options>, prefixes: Prefixes): Locator<Options> {
        return _.extend(base, {
            nested: getNested(base.option, prefixes),
            resetOption: function(newOptions: Options): Locator<Options> {
                return _.extend({}, base as Locator<Options>, {
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
