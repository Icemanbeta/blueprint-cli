const jsonfile = require('jsonfile'),
      _ = require('lodash');

_.mixin(require('lodash-deep'));

const clean = (filename) => {
  let file = filename || './test/Dubai.3.blueprint';
      data = jsonfile.readFileSync(file),
      stats = {
        before: data.model.steps.length,
        after: data.model.steps.length
      },

      map = {};
      treeMap = {};

  _.deepMapValues(data.model, (value, paths) => {
    let path = paths.join('.'),
        node;

    if(path.match(/(submodels|steps|parts)[.0-9]+id$/i)) {
      node = paths.filter((key, intKey) => key !== 'id');
      node.pop();
      node = node.join('.');

      map[node] = '';

      _.set(treeMap, path, value);
    }
  });

  map = _.keys(map).sort((a, b) => b.length - a.length);

  // console.log(map);

  stats.after = data.model.steps.length;

  //jsonfile.writeFileSync('/Users/kchiu/Downloads/models/dubai/test.blueprint', data);
  //jsonfile.writeFileSync(file, data);

  console.log('Blueprint file was successfully clean!');
  console.log(`Initial Step Count: ${stats.before}`);
  console.log(`Current Step Count: ${stats.after}`);
};

module.exports = {
  clean
};
