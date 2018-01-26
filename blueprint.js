#!/usr/bin/env node
const program = require('commander'),
      { clean } = require('./clean');

program
  .version('1.0.0')
  .description('Blueprint CLI');

program
  .command('clean [filename]')
  .alias('c')
  .option('-d, --debug', 'Print debugging log to cwd')
  .description('Clean a *.blueprint file')
  .action((filename, options) => {
    clean(filename, options);
  });

program.parse(process.argv);
