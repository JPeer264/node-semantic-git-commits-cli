# semantic-git-commit-cli

[![Backers on Open Collective](https://opencollective.com/sgc/backers/badge.svg)](#backers) [![Sponsors on Open Collective](https://opencollective.com/sgc/sponsors/badge.svg)](#sponsors)
[![Build Status](https://travis-ci.com/JPeer264/node-semantic-git-commit-cli.svg?branch=master)](https://travis-ci.com/JPeer264/node-semantic-git-commit-cli)
[![Build status](https://ci.appveyor.com/api/projects/status/t9xwo0r3n2oe5ywf/branch/master?svg=true)](https://ci.appveyor.com/project/JPeer264/node-semantic-git-commit-cli/branch/master)
[![Coverage Status](https://coveralls.io/repos/github/JPeer264/node-semantic-git-commit-cli/badge.svg?branch=master)](https://coveralls.io/github/JPeer264/node-semantic-git-commit-cli?branch=master)


> A CLI to keep semantic git commits. With emoji support 😄 👍

<img src="https://raw.githubusercontent.com/JPeer264/node-semantic-git-commit-cli/master/media/screenshot.gif">

## Why?

Many projects got different git commit rules. It is hard to remember them all. Usually you start with `git commit -m "`, and then? You have to think about the projects commit guidelines.

`sgc` will take care of the commit guidelines, so you can focus on the more important stuff: **code**

## Installation

```sh
$ npm i -g semantic-git-commit-cli
```
or
```sh
$ yarn global add semantic-git-commit-cli
```

## Usage

Forget the times when you used `git commit -m "..."`, now just type:
```sh
$ sgc
```
or if you already have an alias for sgc, use following instead:
```sh
$ semantic-git-commit
```

### Usage with parameters

> Note: if any block is added it will get skipped in the questions. If there are still some questions open they will still be asked

Available parameters:

- `m` | `message`: Add and skip the message block
- `t` | `type`: Add and skip the type block (this has to be defined in the [types](#types) as `argKey`)
- `s` | `scope`: Add and skip the scope block

To skip some questions you can add parameters:

Following:
```sh
$ sgc -t feat -m some new features
```

Will generate: `Feat: some new features`

--

Following:
```sh
$ sgc -t feat -s myScope -m some new features
```

Will generate: `Feat(myScope): some new features`

### Usage with [semantic-release](https://github.com/semantic-release/semantic-release)

> Configure sgc for the following [semantic-release options](https://github.com/semantic-release/semantic-release#plugins): `analyzeCommits` and `generateNotes`

First step, install the following plugins with
```sh
$ npm install --save-dev sr-commit-analyzer sr-release-notes-generator conventional-changelog-eslint
```

or

```sh
$ yarn add -D sr-commit-analyzer sr-release-notes-generator conventional-changelog-eslint
```

Then, create  a `release.config.js` file in a `config` folder in the root folder of your project:
```js
/* eslint-disable no-useless-escape */
module.exports = {
  analyzeCommits: {
    preset: 'eslint',
    releaseRules: './config/release-rules.js', // optional, only if you want to set up new/modified release rules inside another file
    parserOpts: { // optional, only you want to have emoji commit support
      headerPattern: /^(?::([\w-]*):)?\s*(\w*):\s*(.*)$/,
      headerCorrespondence: [
        'emoji',
        'tag',
        'message',
      ],
    },
  },
  generateNotes: {
    preset: 'eslint',
    parserOpts: { // optional, only you want to have emoji commit support
      headerPattern: /^(?::([\w-]*):)?\s*(\w*):\s*(.*)$/,
      headerCorrespondence: [
        'emoji',
        'tag',
        'message',
      ],
    },
  },
};
```

Then, update the  `semantic-release ` script to your `package.json` to this : 
```json
"scripts": {
    "semantic-release": "semantic-release -e ./config/release.config.js",
}
```

## Commands

### check

This will check all commits and will fail if your commits do not meet the defined config.

**Flags**
  - `start`: A commit SHA to start, in case you started using `sgc` later of your development

```sh
$ sgc check --start 84a1abd
```

### which-config

This command shows which configs gets applied to `sgc`

```sh
$ sgc which-config
```

## Config

> Just create a `.sgcrc` in your project root or you can add everything in your `package.json` with the value `sgc`

You can even create a global config. Just go to your users home and create a `.sgcrc`. The global config will be triggered if no project configurations are present.

The order and namings of the commit (this can vary with different settings):
```
<type>(<scope>)<delimiter> <message>

<body>
```

**Options:**
- [body](#body)
- [scope](#scope)
- [emoji](#emoji)
- [delimiter](#delimiter)
- [lowercaseTypes](#lowercaseTypes)
- [initialCommit](#initialCommit)
- [types](#types)
- [addScopeSpace](#addScopeSpace)
- [rules](#rules)

### body

**Type:** `boolean`

**Default**: `true`

Asks if more info (body) should be added. This will open your default editor.

Example:
```json
{
  "body": false
}
```

### scope

**Type:** `boolean`

**Default:** `false`

Asks for the scope in parentheses of the commit.

Example:
```json
{
  "scope": true
}
```

### emoji

**Type:** `boolean`

**Default:** `false`

A boolean to enable emoji at the beginning of a commit message

Example:
```json
{
  "emoji": true
}
```

### delimiter

**Type:** `string`

**Default:** `:`

A string which is the delimiter between the type and the message.

Example:
```json
{
  "delimiter": ":"
}
```
or type specific delimiters, which will overwrite the global one:
```json5
{
  "delimiter": ":",
  "types": [
    {
      "type": "Feat",
      "delimiter": " -"
    }, // will generate "Feat - message"
    {
      "type": "Fix",
    } // will generate "Fix: message"
  ]
}
```

### lowercaseTypes

**Type:** `boolean`

**Default:** `false`

A boolean to lowercase types.

Example:
```json
{
  "lowercaseTypes": true
}
```

### initialCommit

**Type:** `object`

**Default:**

```json
{
  "initialCommit": {
    "isEnabled": true,
    "emoji": ":tada:",
    "message": "Initial commit"
  }
}
```

**Keys:**

- `isEnabled` - Whether an explicit initial commit should be used for the very first commit
- `emoji` - An emoji which will be appended at the beginning of the commit ([Emoji Cheat Sheet](https://www.webpagefx.com/tools/emoji-cheat-sheet/))
- `message` - The commit message for the very first commit

### types

> Types will define your git commits. If `types` is not set in your own `.sgcrc`, the `types` of the global [.sgcrc](.sgcrc)

> Notice: If the `type` is `false` it will let you to manually add the type. This is usefull especially if you have a `prefix` named `SGC-` to reference these as a ticket number for your ticket tool

**Keys**

- `type` (`string` or `false`) - This will be your commit convention and will be your start of your commit - e.g.: `Feat:`
- `prefix` (optional) - This option is just valid, if `type` is `false`
- `description` (optional) - The description to explain what your type is about
- `emoji` (optional) - An emoji which will be appended at the beginning of the commit ([Emoji Cheat Sheet](https://www.webpagefx.com/tools/emoji-cheat-sheet/))
- `argKeys` | Array (optional) - Keys which will be accessed through the `-t` [parameter](#usage-with-parameters)

The `.sgcrc`:

```json
{
    "types": [
      {
        "emoji": ":sparkles:",
        "type": "Feat:",
        "description": "Any description to describe the type",
        "argKeys": ["f", "feat", "feature"]
      }
    ]
}
```

or the `package.json`:

```json
{
    "name": "Your application name",
    "version": "1.0.0",
    "sgc": {
        "types": [
            {
              "emoji": ":sparkles:",
              "type": "Feat:",
              "description": "Any description to describe the type",
              "argKeys": ["f", "feat", "feature"]
            }
        ]
    }
}
```

### addScopeSpace

**Type:** `boolean`

**Default:** `true`

> This rule just affects the commit message if `scope` is set to true

If set to `false` there will be no space between `<type>` and `(<scope>)`

Example:
```json
{
  "addScopeSpace": false
}
```


### rules

Available rules:

- [maxChar](#maxChar)
- [minChar](#minChar)
- [endWithDot](#endWithDot)

#### maxChar

**Type:** `number`

**Default:** `72`

If a number is set, it will not allow to commit messages **more than** the given number. If it is set to `-1` the rule is deactivated

Example:
```json
{
  "rules": {
    "maxChar": -1
  }
}
```

#### minChar

**Type:** `number`

**Default:** `10`

If a number is set, it will not allow to commit messages **less than** the given number. If it is set to `-1` the rule is deactivated

Example:
```json
{
  "rules": {
    "minChar": -1
  }
}
```

#### endWithDot

**Type:** `boolean`

**Default:** `true`

If it is set to false, it will not allow to commit messages with a dot at the

Example:
```json
{
  "rules": {
    "endWithDot": false
  }
}
```
