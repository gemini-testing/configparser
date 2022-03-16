import type { LazyObject } from './types/lazy';
export declare const isLazy: unique symbol;
export declare function buildLazyObject<T>(keys: Array<keyof T>, getKeyGetter: (key: keyof T) => () => (T[keyof T] | LazyObject<T[keyof T]>)): LazyObject<T>;
export declare function forceParsing<T>(lazyObject: LazyObject<T>): T;
