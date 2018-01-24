const jsonfile = require('jsonfile'),
      _ = require('lodash');

function pickDeep(collection, predicate, thisArg) {
  let keys;

  if(_.isFunction(predicate)) {
    predicate = _.rest(predicate, thisArg);
  } else {
    keys = _.flatten(_.tail(arguments));
    predicate = (val, key) => _.includes(keys, key);
  }

  return _.transform(collection, (memo, val, key) => {
    let include = predicate(val, key);

    if(!include && _.isObject(val)) {
      val = pickDeep(val, predicate);
      include = !_.isEmpty(val);
    }

    if(include) {
      _.isArray(collection) ? memo.push(val) : memo[key] = val;
    }
  });
}

const clean = (filename) => {
  let file = filename || '/Users/kchiu/Downloads/models/dubai/Dubai.3.blueprint';
      data = jsonfile.readFileSync(file),
      stats = {
        before: data.model.steps.length,
        after: data.model.steps.length
      };

  //console.log(mapByKeyDeep(data.model, 'steps'));
  //console.log(paths(data.model, 'steps'));
  console.log(pickDeep(data.model, 'steps'));

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
