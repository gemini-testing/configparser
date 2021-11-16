import type { LazyObject } from './lazy';
import type { MapParser } from './map';
import type { OptionParser } from './option';
import type { SectionParser } from './section';

export type ParsedConfig<T> = {[K in keyof T]: LazyObject<T[K]>};

export type RootParsedConfig<T> = ParsedConfig<{root: LazyObject<T>}>;

export type Parser<T, R = any> = OptionParser<T, R> | SectionParser<T, R> | MapParser<T, R>;
