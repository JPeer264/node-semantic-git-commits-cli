#!/usr/bin/env node

import updateNotifier from 'update-notifier';
import chalk from 'chalk';
import yargs from 'yargs';

import pkg from '../package.json';
import cli from './cli';
import check from './check';
import Config from './Config';

const { argv } = yargs
  .usage('Usage: $0')
  .alias('v', 'version')
  .describe('v', 'Version number')
  .alias('r', 'retry')
  .describe('r', 'Retry your previous failed commit')
  .alias('m', 'message')
  .describe('m', 'Use this to add it as commit message. If this option is given, it will skip the original message prompt')
  .alias('s', 'scope')
  .describe('s', 'Use this to add it as commit scope. If this option is given, it will skip the original message prompt. If scope is deactivated by the sgcrc this argument will get ignored')
  .alias('t', 'type')
  .describe('t', 'Use this to choose the type. Remember: the given key must be specified in your config file (types). If this option is given, it will skip the original message prompt')
  .help('h')
  .alias('h', 'help')
  .command(
    'check',
    'Check if commits follow the specs',
    {
      start: {
        alias: 'st',
        description: 'A git SHA where to start for checking. This could be helpful if sgc is implemented after a specific commit',
      },
    },
    check,
  )
  .command(
    'which-config',
    'Check which config got applied',
    () => console.log('Following config gets used:\n', chalk.bold(new Config().configPath)),
  );

updateNotifier({ pkg }).notify();

if (argv._.length <= 0) {
  cli(argv);
}
