import type { RootParsedConfig } from './common';
import type { LazyObject } from './lazy';
import type { Locator } from './locator';
import type { DeepPartial } from './utils';
export declare type OptionParserConfig<T, S, R = any, P = any> = {
    defaultValue?: T | ((config: LazyObject<R>, currNode: LazyObject<R> | LazyObject<P>) => T);
    parseCli?: (input: string) => T;
    parseEnv?: (input: string) => T;
    validate?: (value: unknown, config: LazyObject<R>, currNode: LazyObject<R> | LazyObject<P>) => asserts value is T;
    map?(value: T, config: LazyObject<R>, currNode: LazyObject<R> | LazyObject<P>): S;
};
export declare type OptionParser<T, R = any> = (locator: Locator<DeepPartial<T>>, config: RootParsedConfig<R>) => T;
