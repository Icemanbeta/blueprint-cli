import * as program from 'commander';
import * as glob from 'glob-fs';
import { clean } from './clean';
import { render } from './render';

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
  .command('render <images>')
  .alias('r')
  .option('-d, --debug', 'Print debugging log to cwd')
  .description('Renders all images from a blueprint images export')
  .action((images, options) => {
    const files = glob.readdirSync(images);
    render(files);
  });

program.parse(process.argv);
