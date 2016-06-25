#! /usr/bin/env node
"use strict"

var path = require('path')
var sh = require('shelljs')
var config = require('yargs')
  .option('s', {
    alias: 'srcDir',
    type: 'string',
    default: 'gh-pages',
    describe: 'The source directory that you want to publish to the gh-pages branch. This directory will become the root directory of the gh-pages branch.'
  })
  .option('p', {
    alias: 'publishDir',
    type: 'string',
    default: '.publish',
    describe: 'When publishing to GitHub pages, this directory will be created to publish from.'
  })
  .option('d', {
    alias: 'deletePublishDir',
    type: 'boolean',
    default: false,
    describe: 'If true, the publishDir will be recursively deleted when the script has finished.'
  })
  .option('u', {
    alias: 'allowUncommitted',
    type: 'boolean',
    default: false,
    describe: 'If true, the script will allow you to deploy uncommitted changes to the gh-pages branch.'
  })
  .option('o', {
    alias: 'outputLevel',
    type: 'number',
    default: 1,
    choices: [0,1,2,3],
    describe: 'The verbosity of the output from 0 (no output) to 3 (verbose output).'
  })
  .usage('Usage: $0 [options]')
  .example('$0 -c -s dist', 'Publish the contents of the `dist` directory to the gh-pages branch and delete the publish directory afterwards.')
  .help('h')
  .alias('h', 'help')
  .argv

var projectRoot = process.cwd()
var remoteUrl = sh.exec('git config --get remote.origin.url').trim()

function logToConsole(msg) {
  if (config.outputLevel >= 1)
    console.log(msg)
}

sh.config.verbose = config.outputLevel >= 2
sh.config.silent = !(config.outputLevel >= 3)

if (!config.allowUncommitted && sh.exec('git diff --exit-code && git diff --staged --exit-code').code !== 0)
  throw new Error('You have uncommitted changes! Please commit your files and then try again.')

sh.mkdir('-p', config.publishDir)
sh.cd(config.publishDir)

if (sh.ls('.git').code !== 0) {
  sh.exec('git clone ' + remoteUrl + ' .')
}

var branches = sh.exec('git branch -a')
if (branches.indexOf('gh-pages') === -1)
  sh.exec('git branch gh-pages')
sh.exec('git checkout gh-pages')

var sourcePath = path.resolve(projectRoot, config.srcDir, '*')
sh.exec('git rm -r .')
sh.cp('-R', sourcePath, '.')
sh.exec('git add -A .')

if (sh.exec('git diff --staged --exit-code').code === 0) {
  sh.exec('git reset --hard')
  logToConsole('Nothing to deploy - no changes detected.')
}
else {
  sh.exec('git commit -m "update gh-pages ' + new Date().toISOString() + '"')
  sh.exec('git push --set-upstream origin gh-pages')
  logToConsole('Successfully deployed to origin/gh-pages.')
}

function deletePublishDir() {
  if (config.deletePublishDir)
    sh.rm('-rf')
}