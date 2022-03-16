"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.root = exports.map = exports.section = exports.option = void 0;
const lodash_1 = __importDefault(require("lodash"));
const errors_1 = require("./errors");
const lazy_1 = require("./lazy");
const locator_1 = __importDefault(require("./locator"));
/**
 * Single option
 */
function option({ defaultValue, parseCli = lodash_1.default.identity, parseEnv = lodash_1.default.identity, validate = lodash_1.default.noop, map: mapFunc = lodash_1.default.identity }) {
    const validateFunc = validate;
    return (locator, parsed) => {
        const config = parsed.root;
        const currNode = locator.parent ? lodash_1.default.get(parsed, locator.parent) : config;
        let value;
        if (locator.cliOption !== undefined) {
            value = parseCli(locator.cliOption);
        }
        else if (locator.envVar !== undefined) {
            value = parseEnv(locator.envVar);
        }
        else if (locator.option !== undefined) {
            value = locator.option;
        }
        else if (defaultValue !== undefined) {
            value = lodash_1.default.isFunction(defaultValue)
                ? defaultValue(config, currNode)
                : defaultValue;
        }
        else {
            throw new errors_1.MissingOptionError(locator.name);
        }
        validateFunc(value, config, currNode);
        return mapFunc(value, config, currNode);
    };
}
exports.option = option;
/**
 * Object with fixed properties.
 * Any unknown property will be reported as error.
 */
function section(properties) {
    const expectedKeys = lodash_1.default.keys(properties);
    return (locator, config) => {
        const unknownKeys = lodash_1.default.difference(lodash_1.default.keys(locator.option), expectedKeys);
        if (unknownKeys.length > 0) {
            throw new errors_1.UnknownKeysError(unknownKeys.map((key) => `${locator.name}.${key}`));
        }
        const lazyResult = (0, lazy_1.buildLazyObject)(expectedKeys, (key) => {
            const parser = properties[key];
            return () => parser(locator.nested(key), config);
        });
        lodash_1.default.set(config, locator.name, lazyResult);
        return lazyResult;
    };
}
exports.section = section;
/**
 * Object with user-specified keys and values,
 * parsed by valueParser.
 */
function map(valueParser, defaultValue) {
    return (locator, config) => {
        if (locator.option === undefined) {
            if (!defaultValue) {
                return {};
            }
            locator = locator.resetOption(defaultValue);
        }
        const optionsToParse = Object.keys(locator.option);
        const lazyResult = (0, lazy_1.buildLazyObject)(optionsToParse, (key) => {
            return () => valueParser(locator.nested(key), config);
        });
        lodash_1.default.set(config, locator.name, lazyResult);
        return lazyResult;
    };
}
exports.map = map;
function root(rootParser, { envPrefix, cliPrefix }) {
    return ({ options, env, argv }) => {
        const rootLocator = (0, locator_1.default)({ options, env, argv, envPrefix, cliPrefix });
        const parsed = rootParser(rootLocator, {});
        return (0, lazy_1.forceParsing)(parsed);
    };
}
exports.root = root;
