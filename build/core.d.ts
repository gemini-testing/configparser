import type { MapParser } from './types/map';
import type { OptionParser, OptionParserConfig } from './types/option';
import type { RootParser, RootPrefixes, ConfigParser } from './types/root';
import type { SectionParser, SectionProperties } from './types/section';
import type { DeepPartial } from './types/utils';
declare type Parser<T, R = any> = OptionParser<T, R> | SectionParser<T, R> | MapParser<T, R>;
/**
 * Single option
 */
export declare function option<T, S = T, R = any>({ defaultValue, parseCli, parseEnv, validate, map: mapFunc }: OptionParserConfig<T, S, R>): OptionParser<S, R>;
/**
 * Object with fixed properties.
 * Any unknown property will be reported as error.
 */
export declare function section<T, R = any>(properties: SectionProperties<T, R>): SectionParser<T, R>;
/**
 * Object with user-specified keys and values,
 * parsed by valueParser.
 */
export declare function map<T extends Record<string, any>, V extends T[string] = T[string], R = any>(valueParser: Parser<V, R>, defaultValue: DeepPartial<Record<string, V>>): MapParser<Record<string, V>, R>;
export declare function root<T>(rootParser: RootParser<T>, { envPrefix, cliPrefix }: RootPrefixes): ConfigParser<T>;
export {};
