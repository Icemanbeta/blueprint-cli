import * as os from 'os';
import * as fs from 'fs';
import * as path from 'path';
import * as jsonfile from 'jsonfile';
import * as traverse from 'traverse';
import * as $ from 'jsonpath';
import * as _ from 'lodash';

const config = {
        cwd: process.cwd(),
      };

function getParts(data: any) {
  data = $.query(data, '$..parts');
  data = _.chain(data)
    .flatten()
    .compact()
    .value();

  return data;
}

export const clean = (filename: string, params: any) => {
  let file,
      options = params,
      data,
      stats = {
        before: 0,
        after: 0,
        deleted: 0
      };

  if(!filename) {
    file = options.debug ? '/media/www/prototypes/blueprint-cli/test/Dubai.3.blueprint' : null;

    if(!file) {
      console.log('The path of the file to import is required!');
      return;
    }
  } else {
    file = path.resolve(filename);
  }

  // Read blueprint file
  data = jsonfile.readFileSync(file);
  stats.before = data.model.steps.length;
  stats.after = data.model.steps.length

  function logger(data, suffix) {
    let file = path.join(`./blueprint-cli.${suffix}.log`);

    if(options.debug) {
      jsonfile.writeFileSync(file, data);
    }
  }

  logger(data.model.steps, 'import');

  traverse(data.model.steps[0]).forEach(function(node) {
    let type = this.isRoot ? 'steps' : this.parent.key,
        parts;

    switch(type) {
      case 'submodels':
      case 'steps':
        if(this.parent) {
          parts = getParts(this.parent.node);

          if(!parts.length) {
            stats.deleted++;
            this.parent.delete();
          }
        }

        break;
    }
  })

  logger(data.model.steps, 'export');

  stats.after = data.model.steps.length;

  console.log('Blueprint file was successfully clean!');
  console.log(`Items Deleted: ${stats.before}`);

  if(!options.debug) {
    // Make a backup first
    fs.renameSync(file, file.replace(/\.([a-z]+)$/, '.old.$1'));
    jsonfile.writeFileSync(file, data);
  }
};
