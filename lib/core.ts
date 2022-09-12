import _ from 'lodash';

import {MissingOptionError, UnknownKeysError} from './errors';
import {buildLazyObject, forceParsing} from './lazy';
import initLocator from './locator';

import type {Rooted, Parser} from './types/common';
import type {LazyObject} from './types/lazy';
import type {Locator} from './types/locator';
import type {MapParser} from './types/map';
import type {OptionParser, OptionParserConfig} from './types/option';
import type {RootParser, RootPrefixes, ConfigParser} from './types/root';
import type {SectionParser, SectionProperties} from './types/section';
import type {Map} from './types/utils';

/**
 * Single option
 */
export function option<Value, Result, MappedValue = Value>({
    defaultValue,
    parseCli = _.identity,
    parseEnv = _.identity,
    validate = _.noop,
    map: mapFunc = _.identity,
    isDeprecated = false
}: OptionParserConfig<Value, MappedValue, Result> = {}): OptionParser<MappedValue, Result> {
    const validateFunc: typeof validate = validate;

    return (locator, parsed) => {
        const config = parsed.root;
        const currNode = locator.parent ? _.get(config, locator.parent) : config;

        let value: unknown, isSetByUser = true;
        if (locator.cliOption !== undefined) {
            value = parseCli(locator.cliOption);
        } else if (locator.envVar !== undefined) {
            value = parseEnv(locator.envVar);
        } else if (locator.option !== undefined) {
            value = locator.option;
        } else if (defaultValue !== undefined) {
            isSetByUser = false;
            value = _.isFunction(defaultValue)
                ? defaultValue(config, currNode)
                : defaultValue;
        } else {
            throw new MissingOptionError(locator.name);
        }

        if (isSetByUser && isDeprecated) {
            console.warn(`Using "${locator.name}" option is deprecated`);
        }

        validateFunc(value, config, currNode, {isSetByUser});

        return mapFunc(value, config, currNode, {isSetByUser});
    };
}

/**
 * Object with fixed properties.
 * Any unknown property will be reported as error.
 */
export function section<Config, Result>(properties: SectionProperties<Config, Result>): SectionParser<Config, Result> {
    const expectedKeys = _.keys(properties) as Array<keyof Config>;

    return (locator, config) => {
        const unknownKeys = _.difference(
            _.keys(locator.option),
            expectedKeys as Array<string>
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
export function map<SubConfig, Result>(
    valueParser: Parser<SubConfig, Result>,
    defaultValue: Map<SubConfig>
): MapParser<Map<SubConfig>, Result> {
    return (locator, config) => {
        if (locator.option === undefined) {
            if (!defaultValue) {
                return {} as LazyObject<Map<SubConfig>>;
            }
            locator = locator.resetOption(defaultValue);
        }

        const optionsToParse = Object.keys(locator.option as Map<SubConfig>);
        const lazyResult = buildLazyObject<Map<SubConfig>>(optionsToParse, (key) => {
            return () => valueParser(locator.nested(key), config);
        });

        _.set(config, locator.name, lazyResult);

        return lazyResult;
    };
}

export function root<Config, Result = Config>(rootParser: RootParser<Config, Result>, {envPrefix, cliPrefix}: RootPrefixes = {}): ConfigParser<Config> {
    return ({options, env, argv}) => {
        const rootLocator = initLocator({options, env, argv, envPrefix, cliPrefix});
        const parsed = rootParser(rootLocator as Locator<Config>, {} as Rooted<Result>);

        return forceParsing(parsed);
    };
}
