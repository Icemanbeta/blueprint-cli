import * as program from 'commander';
import * as fs from 'fs';
import * as globfs from 'glob-fs';
import * as path from 'path';

import { clean } from './clean';
import { render } from './render';

const glob = globfs();

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

program
  .command('render <dir> <outfile>')
  .alias('r')
  .option('-d, --debug', 'Print debugging log to cwd')
  .description('Renders all images from a blueprint images export')
  .action((images, outfile, options) => {
    const basepath = process.cwd(),
          pattern = fs.lstatSync(images).isDirectory() ? path.join(images, './*.{png,jpeg,jpg}') : images,
          files = glob
            .readdirSync(pattern)
            .filter(file => !file.match(/(glossary|title)/))
            .map(file => path.join(basepath, images, file));

    render(files, outfile, options);
  });

program.parse(process.argv);
