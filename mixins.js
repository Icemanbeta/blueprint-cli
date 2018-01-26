const mixins = function(_) {
  let mixins = {
    deepMapValues(object, callback, propertyPath) {
      propertyPath = propertyPath || '';

      if(_.isArray(object)) {
        return _.map(object, deepMapValuesIteratee);
      } else if(_.isObject(object) && !_.isDate(object) && !_.isRegExp(object) && !_.isFunction(object)) {
        return _.extend({}, object, _.mapValues(object, deepMapValuesIteratee));
      } else {
        return callback(object, propertyPath);
      }

      function deepMapValuesIteratee(value, key) {
        let valuePath = propertyPath ? `${propertyPath}.${key}` : key;
        return _.deepMapValues(value, callback, valuePath);
      }
    };
  }

  _.mixins(mixins);
}

export {
  mixins
}
