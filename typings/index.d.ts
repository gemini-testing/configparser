declare module "gemini-configparser" {
  type PartialConfig = never;
  type Locator = never;
  type UnsanitizedRootConfig = any;
  type UnsanitizedConfigNode = any;

  type Parser<T> = (locator: Locator, config: PartialConfig) => T;

  type RootPrefixes = {
      envPrefix: string;
      cliPrefix: string;
  };

  type OptionParserConfig<T> = {
      defaultValue: T | ((config: UnsanitizedRootConfig, currNode: UnsanitizedConfigNode) => T);
      parseCli?(input: string): T;
      parseEnv?(input: string): T;
      validate?(value: T, config: UnsanitizedRootConfig, currNode: UnsanitizedConfigNode): void;
  };

  type MappedOptionParserConfig<S, T> = OptionParserConfig<S> & {
      map(value: S, config: UnsanitizedRootConfig, currNode: UnsanitizedConfigNode): T;
  };

  type SectionProperties<T> = { [name in keyof T]: Parser<T[name]> };

  export function option<T>(description: OptionParserConfig<T>): Parser<T>;
  export function option<S, T>(description: MappedOptionParserConfig<S, T>): Parser<T>;
  export function section<T>(properties: SectionProperties<T>): Parser<T>;

  type RootParserArg = {
      options: UnsanitizedRootConfig;
      env: NodeJS.ProcessEnv;
      argv: Array<string>;
  };
  type RootParser<T> = (arg: RootParserArg) => T;
  export function root<T>(rootParser: Parser<T>, prefixes: RootPrefixes): RootParser<T>;

  export class MissingOptionError extends Error {}
  export class UnknownKeysError extends Error {}
}
