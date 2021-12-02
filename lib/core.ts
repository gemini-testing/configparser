import _ from 'lodash';

import { MissingOptionError, UnknownKeysError } from './errors';
import { buildLazyObject, forceParsing } from './lazy';
import initLocator from './locator';

import type { LazyObject } from '../types/lazy';
import type { RootParsedConfig } from '../types/common';
import type { MapParser } from '../types/map';
import type { OptionParser, OptionParserConfig } from '../types/option';
import type { RootParser, RootPrefixes, ConfigParser } from '../types/root';
import type { SectionParser, SectionProperties } from '../types/section';

type Parser<T, R = any> = OptionParser<T, R> | SectionParser<T, R> | MapParser<T, R>;

/**
 * Single option
 */
export function option<T, S = T, R = any>({
    defaultValue,
    parseCli = _.identity,
    parseEnv = _.identity,
    validate = _.noop,
    map: mapFunc = _.identity
}: OptionParserConfig<T, S, R>): OptionParser<S, R> {
    const validateFunc: typeof validate = validate;

    return (locator, parsed) => {
        const config = parsed.root;
        const currNode = locator.parent ? _.get(parsed, locator.parent) : config;

        let value: unknown;
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

        validateFunc(value, config, currNode);

        return mapFunc(value, config, currNode);
    };
}

/**
 * Object with fixed properties.
 * Any unknown property will be reported as error.
 */
export function section<T, R = any>(properties: SectionProperties<T, R>): SectionParser<T, R> {
    const expectedKeys = _.keys(properties) as Array<keyof T>;

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
export function map<T extends Record<string, any>, V extends T[string] = T[string], R = any>(
    valueParser: Parser<V, R>,
    defaultValue: Record<string, V>
): MapParser<Record<string, V>, R> {
    return (locator, config) => {
        if (locator.option === undefined) {
            if (!defaultValue) {
                return {} as LazyObject<T>;
            }
            locator = locator.resetOption(defaultValue);
        }

        const optionsToParse = Object.keys(locator.option as Record<string, V>);
        const lazyResult = buildLazyObject<Record<string, V>>(optionsToParse, (key) => {
            return () => valueParser(locator.nested(key), config);
        });
        _.set(config, locator.name, lazyResult);

        return lazyResult;
    };
}

export function root<T>(rootParser: RootParser<T>, {envPrefix, cliPrefix}: RootPrefixes): ConfigParser<T> {
    return ({options, env, argv}) => {
        const rootLocator = initLocator({options, env, argv, envPrefix, cliPrefix});
        const parsed = rootParser(rootLocator, {} as RootParsedConfig<T>);

        return forceParsing(parsed);
    };
}
