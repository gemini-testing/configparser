import _ from 'lodash';
import {buildLazyObject, forceParsing} from './lazy';
import {MissingOptionError, UnknownKeysError} from './errors';
import initLocator from './locator';

/**
 * Single option
 */
export function option({
        defaultValue,
        parseCli = _.identity,
        parseEnv = _.identity,
        validate = _.noop,
        map: mapFunc = _.identity
    }) {

    return (locator, parsed) => {
        const config = parsed.root;
        let value;
        if (locator.cliOption !== undefined) {
            value = parseCli(locator.cliOption);
        } else if (locator.envVar !== undefined) {
            value = parseEnv(locator.envVar);
        } else if (locator.option !== undefined) {
            value = locator.option;
        } else if (defaultValue !== undefined) {
            value = _.isFunction(defaultValue)
                ? defaultValue(config)
                : defaultValue;
        } else {
            throw new MissingOptionError(locator.name);
        }
        validate(value, config);

        return mapFunc(value, config);
    };
}

/**
 * Object with fixed properties.
 * Any unknown property will be reported as error.
 */
export function section(properties) {
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
export function map(valueParser, defaultValue) {
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

export function root(rootParser) {
    return ({options, env, argv}) => {
        const rootLocator = initLocator({options, env, argv});
        const parsed = {};
        rootParser(rootLocator, parsed);
        return forceParsing(parsed.root);
    };
}
