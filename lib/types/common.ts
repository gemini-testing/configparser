import type {LazyObject} from './lazy';
import type {MapParser} from './map';
import type {OptionParser} from './option';
import type {SectionParser} from './section';

export type ParsedConfig<Config> = {[Key in keyof Config]: LazyObject<Config[Key]>};

export type Parser<Config, Result> = OptionParser<Config, Result> | SectionParser<Config, Result> | MapParser<Config, Result>;

export interface Rooted<T> {
    root: T;
}
