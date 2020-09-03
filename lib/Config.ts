import merge from 'lodash.merge';
import findup from 'findup-sync';
import * as json from 'json-extra';
import path from 'path';
import os from 'os';
import fs from 'fs';

const cwd = process.cwd();
const homedir = os.homedir();

export interface SgcConfig {
  scope?: boolean;
  body?: boolean;
  emoji?: boolean;
  delimiter?: string;
  lowercaseTypes?: boolean;
  addScopeSpace?: boolean;
  initialCommit?: {
    isEnabled: boolean;
    emoji: string;
    message: string;
  };
  types: {
    emoji?: string;
    type: string;
    description?: string;
    argKeys?: string[];
  }[];
  rules?: {
    maxChar?: number;
    minChar?: number;
    endWithDot?: boolean;
  };
}

class Config {
  alternativeCwd: string | null;

  sgcConfigName: string;

  constructor(alternativeCwd: string | null = null, sgcConfigName = '.sgcrc') {
    this.alternativeCwd = alternativeCwd;
    this.sgcConfigName = sgcConfigName;

    this.setConfig();
  }

  static safeRequire = (jsPath: string | null): SgcConfig | false => (
    // eslint-disable-next-line global-require, import/no-dynamic-require
    jsPath && require(jsPath)
  )

  static safeRead = (configPath: string | null): SgcConfig | false => (
    !!configPath && json.readToObjSync<SgcConfig>(configPath)
  )

  static getPath = (configPath: string | null): string | null => (
    !!configPath && fs.existsSync(configPath) ? configPath : null
  )

  private getConfigPath(): { path: string; defaultPath: string; type: 'rc' | 'js' | 'pkg' } {
    // paths
    const localPath = Config.getPath((
      findup(this.sgcConfigName, { cwd: this.alternativeCwd || cwd })
    ));
    const localJsPath = Config.getPath(findup('sgc.config.js', { cwd }));
    const globalPath = Config.getPath(path.join(homedir, this.sgcConfigName));
    const globalJsPath = Config.getPath(path.join(homedir, 'sgc.config.js'));
    const packageJson = Config.getPath(findup('package.json', { cwd }));
    const defaultPath = Config.getPath(path.join(__dirname, '..', '.sgcrc')) as string;
    const testDefaultPath = Config.getPath(path.join(__dirname, '..', '.sgcrc_default')) as string;
    const sgcrcDefault = defaultPath || testDefaultPath;

    // priority order (1. highest priority):
    // 1. local config
    //   - 1. sgc.config.js
    //   - 2. .sgcrc
    //   - 3. (package.json).sgc
    // 2. global config
    // 3. default config
    //   - 1. from ../.sgcrc
    //   - 2. test case ../.sgcrc is renamed to ../.sgcrc_default
    const configPath = localJsPath
      || localPath
      || packageJson
      || globalJsPath
      || globalPath
      || sgcrcDefault;

    let type: 'rc' | 'js' | 'pkg';

    switch (path.extname(configPath)) {
      case '.json':
        type = 'pkg';
        break;

      case '.js':
        type = 'js';
        break;

      default:
        type = 'rc';
        break;
    }

    return {
      path: configPath,
      defaultPath: sgcrcDefault,
      type,
    };
  }

  private setConfig(): SgcConfig {
    const configPath = this.getConfigPath();
    const sgcrcDefault: SgcConfig = Config.safeRead(configPath.defaultPath) as SgcConfig;

    let config: SgcConfig = sgcrcDefault;
    let readConfig: SgcConfig | false;

    switch (configPath.type) {
      case 'js':
        readConfig = Config.safeRequire(configPath.path);
        break;

      case 'pkg':
        readConfig = (
          json.readToObjSync<{ sgc: SgcConfig }>(configPath.path)
          || { sgc: false as false }
        ).sgc;
        break;

      default:
      case 'rc':
        readConfig = Config.safeRead(configPath.path);
    }

    if (readConfig) {
      config = readConfig;
    }

    // set defaults which are necessary
    const modifiedConfig = merge({}, sgcrcDefault, config);

    // do not merge types
    // so return them to their set default
    if (config.types) {
      modifiedConfig.types = config.types;
    }

    if (config.initialCommit) {
      modifiedConfig.initialCommit = config.initialCommit;
    }

    return modifiedConfig;
  }

  public get config(): SgcConfig {
    return this.setConfig();
  }

  public get configPath(): string {
    return this.getConfigPath().path;
  }
}

export default Config;
