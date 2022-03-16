import type { RootPrefixes, ConfigParserArg } from './root';
export declare type LocatorArg<T> = RootPrefixes & ConfigParserArg<T>;
export declare type Prefixes = Required<RootPrefixes> & {
    namePrefix: string;
};
export declare type Node<T> = {
    name: string;
    parent: string;
    option?: T;
    envVar?: string;
    cliOption?: string;
};
export interface Locator<T> extends Node<T> {
    nested: (key: keyof T) => Locator<T[keyof T]>;
    resetOption: <T>(newOption: T) => Locator<T>;
}
