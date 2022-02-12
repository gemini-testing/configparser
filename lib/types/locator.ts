import type {RootPrefixes, ConfigParserArg} from './root';

export type LocatorArg<Config> = RootPrefixes & ConfigParserArg<Config>;

export type Prefixes = Required<RootPrefixes> & {
    namePrefix: string;
};

export interface Node<Options> {
    name: string;
    parent: string | null;
    option: Options;
    envVar?: string;
    cliOption?: string;
}

export interface Locator<Options> extends Node<Options> {
    nested<Key extends keyof Options>(key: Key): Locator<Options[Key]>;
    resetOption(newOption: Options): Locator<Options>;
}
