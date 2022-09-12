import type {MapParser} from './map';
import type {SectionParser} from './section';
import type {DeepPartial} from './utils';

export interface ConfigParserArg<Options> {
    options: Options;
    env: NodeJS.ProcessEnv;
    argv: NodeJS.Process['argv'];
}

export interface ConfigParser<Config> {
    (arg: ConfigParserArg<DeepPartial<Config>>): Config;
}

export interface RootPrefixes {
    envPrefix?: string;
    cliPrefix?: string;
}

export type RootParser<Config, Result> = SectionParser<Config, Result> | MapParser<Config, Result>;
