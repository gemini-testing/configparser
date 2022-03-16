/// <reference types="node" />
import type { MapParser } from './map';
import type { SectionParser } from './section';
import type { DeepPartial } from './utils';
export declare type ConfigParserArg<T> = {
    options?: T;
    env: NodeJS.ProcessEnv;
    argv: NodeJS.Process["argv"];
};
export declare type ConfigParser<T> = (arg: ConfigParserArg<DeepPartial<T>>) => T;
export declare type RootPrefixes = {
    envPrefix?: string;
    cliPrefix?: string;
};
export declare type RootParser<T> = SectionParser<T, T> | MapParser<T, T>;
