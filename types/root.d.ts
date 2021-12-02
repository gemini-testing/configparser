import type { DeepPartial } from './utils';
import type { MapParser } from './map';
import type { SectionParser } from './section';

export type ConfigParserArg<T> = {
    options: DeepPartial<T>;
    env: NodeJS.ProcessEnv;
    argv: NodeJS.Process["argv"];
};

export type ConfigParser<T> = (arg: ConfigParserArg<T>) => T;

export type RootPrefixes = {
    envPrefix?: string;
    cliPrefix?: string;
};

export type RootParser<T> = SectionParser<T, T> | MapParser<T, T>;
