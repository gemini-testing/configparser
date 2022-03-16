"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
function parseArgv(argv, cliPrefix) {
    return argv.reduce(function (argv, arg) {
        if (!arg.startsWith(cliPrefix) || !lodash_1.default.includes(arg, '=')) {
            return argv.concat(arg);
        }
        const parts = arg.split('=');
        const option = parts[0];
        const value = parts.slice(1).join('=');
        return argv.concat(option, value);
    }, []);
}
function default_1({ options, env, argv, envPrefix = '', cliPrefix = '--' }) {
    const parsedArgv = parseArgv(argv, cliPrefix);
    function getNested(option, { namePrefix, envPrefix, cliPrefix }) {
        return (subKey) => {
            const envName = envPrefix + lodash_1.default.snakeCase(subKey.toString());
            const cliFlag = cliPrefix + lodash_1.default.kebabCase(subKey.toString());
            const argIndex = parsedArgv.lastIndexOf(cliFlag);
            const subOption = lodash_1.default.get(option, subKey);
            const newName = namePrefix ? `${namePrefix}.${subKey}` : subKey.toString();
            return mkLocator({
                name: newName,
                parent: namePrefix,
                option: subOption,
                envVar: env[envName],
                cliOption: argIndex > -1 ? parsedArgv[argIndex + 1] : undefined
            }, {
                namePrefix: newName,
                envPrefix: `${envName}_`,
                cliPrefix: `${cliFlag}-`
            });
        };
    }
    function mkLocator(base, prefixes) {
        return lodash_1.default.extend(base, {
            nested: getNested(base.option, prefixes),
            resetOption: function (newOptions) {
                return mkLocator(Object.assign(Object.assign({}, base), { option: newOptions }), prefixes);
            }
        });
    }
    return mkLocator({
        name: 'root',
        parent: '',
        option: options,
        envVar: undefined,
        cliOption: undefined
    }, {
        namePrefix: 'root',
        envPrefix,
        cliPrefix
    });
}
exports.default = default_1;
;
