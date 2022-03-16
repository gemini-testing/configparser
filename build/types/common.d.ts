import type { LazyObject } from './lazy';
import type { MapParser } from './map';
import type { OptionParser } from './option';
import type { SectionParser } from './section';
export declare type ParsedConfig<T> = {
    [K in keyof T]: LazyObject<T[K]>;
};
export declare type RootParsedConfig<T> = ParsedConfig<{
    root: LazyObject<T>;
}>;
export declare type Parser<T, R = any> = OptionParser<T, R> | SectionParser<T, R> | MapParser<T, R>;
