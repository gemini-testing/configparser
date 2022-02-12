import type { MapParser } from './map';
import type { SectionParser } from './section';
import type { DeepPartial } from './utils';

export type ConfigParserArg<T> = {
    options?: T;
    env: NodeJS.ProcessEnv;
    argv: NodeJS.Process["argv"];
};

export type ConfigParser<T> = (arg: ConfigParserArg<DeepPartial<T>>) => T;

export type RootPrefixes = {
    envPrefix?: string;
    cliPrefix?: string;
};

export type RootParser<T> = SectionParser<T, T> | MapParser<T, T>;
