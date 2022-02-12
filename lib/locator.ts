import _ from 'lodash';

import type { LocatorArg, Locator, Node, Prefixes } from './types/locator';

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

export default function<T>({options, env, argv, envPrefix = '', cliPrefix = '--'}: LocatorArg<T>): Locator<T> {
    const parsedArgv = parseArgv(argv, cliPrefix);

    function getNested<T extends {}>(option: T | undefined, {namePrefix, envPrefix, cliPrefix}: Prefixes): (key: keyof T) => Locator<T[keyof T]> {
        return (subKey) => {
            const envName = envPrefix + _.snakeCase(subKey.toString());
            const cliFlag = cliPrefix + _.kebabCase(subKey.toString());

            const argIndex = parsedArgv.lastIndexOf(cliFlag);
            const subOption = _.get(option, subKey);
            const newName = namePrefix ? `${namePrefix}.${subKey}` : subKey.toString();

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

    function mkLocator<T>(base: Node<T>, prefixes: Prefixes): Locator<T> {
        return _.extend(base, {
            nested: getNested(base.option, prefixes),
            resetOption: function<T>(newOptions: T): Locator<T> {
                return mkLocator({ ...base, option: newOptions }, prefixes);
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
            namePrefix: 'root',
            envPrefix,
            cliPrefix
        }
    );
};
