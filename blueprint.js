#!/usr/bin/env node
const program = require('commander'),
      { clean } = require('./clean');

program
  .version('1.0.0')
  .description('Blueprint CLI');

program
  .command('clean [filename]')
  .alias('c')
  .description('Clean a *.blueprint file')
  .action(filename => {
    clean(filename);
  });

program.parse(process.argv);
