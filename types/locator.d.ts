import type { DeepPartial } from './utils';
import type { RootPrefixes, ConfigParserArg } from './root';

export type LocatorArg<T> = RootPrefixes & ConfigParserArg<T>;

export type Prefixes = Required<RootPrefixes> & {
    namePrefix: string;
};

export type Node<T> = {
    name: string;
    parent: string;
    option?: DeepPartial<T>;
    envVar?: string;
    cliOption?: string;
};

export interface Locator<T> extends Node<T> {
    nested: (key: keyof T) => Locator<T[keyof T]>;
    resetOption: <T>(newOption: T) => Locator<T>;
}
