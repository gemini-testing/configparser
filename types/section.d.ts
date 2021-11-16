import type { Parser, RootParsedConfig } from './common';
import type { LazyObject } from './lazy';
import type { Locator } from './locator';

export type SectionProperties<T, R = any> = {[K in keyof T]: Parser<T[K], R>};
export type SectionParser<T, R = any> = (locator: Locator<T>, config: RootParsedConfig<R>) => LazyObject<T>;
