declare module "gemini-configparser" {
  type PartialConfig = never;
  type Locator = never;
  type UnsanitizedRootConfig = any;
  type UnsanitizedConfigNode = any;
  type DeepPartial<T> = {
    [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
  }
  export type Parser<T> = (locator: Locator, config: PartialConfig) => T;

  type RootPrefixes = {
      // If defined as an array and multiple prefixes match, first defined in the array will be used
      envPrefix: string | string[];
      cliPrefix: string;
  };

  type MetaInfo = {
      isSetByUser: boolean;
  };

  export type OptionParserConfig<T> = {
      defaultValue?: T | ((config: UnsanitizedRootConfig, currNode: UnsanitizedConfigNode) => T);
      parseCli?(input: string): T;
      parseEnv?(input: string): T;
      validate?(value: unknown, config: UnsanitizedRootConfig, currNode: UnsanitizedConfigNode, meta: MetaInfo): asserts value is T;
      isDeprecated?: boolean;
  };

  export type MappedOptionParserConfig<S, T> = OptionParserConfig<S> & {
      map(value: S, config: UnsanitizedRootConfig, currNode: UnsanitizedConfigNode, meta: MetaInfo): T;
  };

  type SectionProperties<T> = { [name in keyof T]: Parser<T[name]> };

  export function option<T>(description: OptionParserConfig<T>): Parser<T>;
  export function option<S, T = S>(description: MappedOptionParserConfig<S, T>): Parser<T>;
  export function section<T>(properties: SectionProperties<T>): Parser<T>;
  export function map<T>(properties: Parser<T>, defaultValue?: Record<string, DeepPartial<T>>): Parser<Record<string, T>>;

  type RootParserArg<T> = {
      options: DeepPartial<T>;
      env: NodeJS.ProcessEnv;
      argv: NodeJS.Process['argv'];
  };
  type RootParser<T> = (arg: RootParserArg<T>) => T;
  export function root<T>(rootParser: Parser<T>, prefixes: RootPrefixes): RootParser<T>;

  export class MissingOptionError extends Error {}
  export class UnknownKeysError extends Error {}
}
