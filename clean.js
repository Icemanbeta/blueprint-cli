const path = require('path'),
      jsonfile = require('jsonfile'),
      _ = require('lodash'),
      traverse = require('traverse');
      config = {
        cwd: process.cwd()
      };

let data,
    options,
    type = 'steps';

function logger(suffix) {
  if(options.debug) {
    jsonfile.writeFileSync(
      path.join(`./blueprint-cli.${suffix}.log`),
      data.model.steps
    );
  }
}

function isEmpty(data) {
  return !(data || []).length;
}

function walk(value) {
  let parent = this.isRoot ? this.node : this.parent.node,
      parentType = type;

  switch(this.key) {
    case 'steps':
    case 'submodels':
    case 'parts':

      switch(parentType) {
        case 'steps':
          if(isEmpty(parent.submodels) && isEmpty(parent.parts)) {
            this.parent.delete();
          }

          break;

        case 'submodels':
          if(isEmpty(parent.steps) && isEmpty(parent.parts)) {
            this.parent.delete();
          }

          break;
      }

      type = this.key;

      break;

    break;
  }
}

const clean = (filename, params) => {
  let file = filename || './test/Dubai.5.blueprint',
      stats = {
        before: null,
        after: null
      },

      map = {
        parts: {},
        submodels: {},
        steps: {},
      },

      treeMap = {},
      type = 'steps';

  options = params;
  data = jsonfile.readFileSync(file);
  stats.before = data.model.steps.length;
  stats.after = data.model.steps.length;

  logger('import');

  traverse(data.model).forEach(walk)
  type = 'steps';
  traverse(data.model).forEach(walk)

  if(options.debug) {
    jsonfile.writeFileSync(
      path.join('./blueprint-cli.export.log'),
      data.model.steps
    );
  }

  logger('export');

  stats.after = data.model.steps.length;

  console.log('Blueprint file was successfully clean!');
  console.log(`Initial Step Count: ${stats.before}`);
  console.log(`Current Step Count: ${stats.after}`);

  jsonfile.writeFileSync(
    file,
    data
  );
};

module.exports = {
  clean
};
