#! /usr/bin/env node
"use strict"

var path = require('path')
var sh = require('shelljs')
var config = require('yargs')
  .option('s', {
    alias: 'srcDir',
    type: 'string',
    default: 'dist',
    describe: 'The source directory that you want to publish to the gh-pages branch. This directory will become the root directory of the gh-pages branch.'
  })
  .option('p', {
    alias: 'publishDir',
    type: 'string',
    default: '.publish',
    describe: 'When publishing to GitHub pages, this directory will be created to publish from. An absolute or relative path can be used. Relative paths will be resolved from the project root.'
  })
  .option('d', {
    alias: 'deletePublishDir',
    type: 'boolean',
    default: false,
    describe: 'If true, the publishDir will be recursively deleted when the script has finished. If you delete the publish directory, performance will be slower because the cache is being deleted.'
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
    choices: [0, 1, 2, 3],
    describe: 'The verbosity of the output from 0 (no output) to 3 (verbose output).'
  })
  .usage('Usage: $0 [options]')
  .example('$0 -d -s dist', 'Publish the contents of the `dist` directory to the gh-pages branch and delete the publish directory afterwards.')
  .help('h')
  .alias('h', 'help')
  .argv

function logToConsole(msg) {
  if (config.outputLevel >= 1)
    console.log(msg)
}

sh.config.verbose = config.outputLevel >= 2
sh.config.silent = !(config.outputLevel >= 3)

var projectRoot = process.cwd()
var absoluteSourceDir = path.resolve(projectRoot, config.srcDir)
var absolutePublishDir = path.resolve(projectRoot, config.publishDir)
var remoteUrl = sh.exec('git config --get remote.origin.url').trim()

if (!config.allowUncommitted && sh.exec('git diff --exit-code && git diff --staged --exit-code').code !== 0) {
  logToConsole('You have uncommitted changes! Please commit your files and then try again.')
  deletePublishDir()
  return process.exit(1)
}

sh.mkdir('-p', absolutePublishDir)
sh.cd(absolutePublishDir)

if (sh.ls('.git').code !== 0)
  sh.exec('git clone ' + remoteUrl + ' .')

if (sh.exec('git branch -a').indexOf('gh-pages') === -1)
  sh.exec('git branch gh-pages')
sh.exec('git checkout gh-pages')

sh.exec('git rm -r .')
sh.cp('-R', path.join(absoluteSourceDir, '*'), '.')
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

deletePublishDir()

function deletePublishDir() {
  if (!config.deletePublishDir)
    return

  while (sh.pwd().indexOf(absolutePublishDir) >= 0)
    sh.cd('..')

  sh.rm('-rf', absolutePublishDir)
}