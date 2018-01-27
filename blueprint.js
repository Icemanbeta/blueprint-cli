#!/usr/bin/env node
const program = require('commander'),
      { clean } = require('./clean');

program
  .version('1.0.0')
  .description('Blueprint CLI');

program
  .command('clean <files...>')
  .alias('c')
  .option('-d, --debug', 'Print debugging log to cwd')
  .description('Clean a *.blueprint file')
  .action((files, options) => {
    files.forEach(file => {
      clean(file, options);
    });
  });

program.parse(process.argv);
