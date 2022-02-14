const _ = require('lodash');
const {buildLazyObject, forceParsing} = require('./lazy');
const {MissingOptionError, UnknownKeysError} = require('./errors');
const initLocator = require('./locator');

/**
 * Single option
 */
function option({
    defaultValue,
    parseCli = _.identity,
    parseEnv = _.identity,
    validate = _.noop,
    map: mapFunc = _.identity
}) {
    return (locator, parsed) => {
        const config = parsed.root;
        const currNode = locator.parent ? _.get(config, locator.parent) : config;

        let value;
        if (locator.cliOption !== undefined) {
            value = parseCli(locator.cliOption);
        } else if (locator.envVar !== undefined) {
            value = parseEnv(locator.envVar);
        } else if (locator.option !== undefined) {
            value = locator.option;
        } else if (defaultValue !== undefined) {
            value = _.isFunction(defaultValue)
                ? defaultValue(config, currNode)
                : defaultValue;
        } else {
            throw new MissingOptionError(locator.name);
        }
        validate(value, config, currNode);

        return mapFunc(value, config, currNode);
    };
}

/**
 * Object with fixed properties.
 * Any unknown property will be reported as error.
 */
function section(properties) {
    const expectedKeys = _.keys(properties);
    return (locator, config) => {
        const unknownKeys = _.difference(
            _.keys(locator.option),
            expectedKeys
        );
        if (unknownKeys.length > 0) {
            throw new UnknownKeysError(
                unknownKeys.map((key) => `${locator.name}.${key}`)
            );
        }

        const lazyResult = buildLazyObject(expectedKeys, (key) => {
            const parser = properties[key];
            return () => parser(locator.nested(key), config);
        });

        _.set(config, locator.name, lazyResult);

        return lazyResult;
    };
}

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
        const lazyResult = buildLazyObject(optionsToParse, (key) => {
            return () => valueParser(locator.nested(key), config);
        });
        _.set(config, locator.name, lazyResult);

        return lazyResult;
    };
}

function root(rootParser, {envPrefix, cliPrefix}) {
    return ({options, env, argv}) => {
        const rootLocator = initLocator({options, env, argv, envPrefix, cliPrefix});
        const parsed = {};
        rootParser(rootLocator, parsed);
        return forceParsing(parsed.root);
    };
}

module.exports = {option, section, map, root};
