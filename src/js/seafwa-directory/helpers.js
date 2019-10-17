const uniq = require('lodash.uniq');
const intersect = require('lodash.intersection');

const getUniqueByKey = (arr, key) => {
  const valuesByKey = arr.map(x => x[key]);
  return uniq(valuesByKey);
};

const createSelectOptionsFromList = list => list.map(i => {
  const option = document.createElement('option');
  option.value = i;
  option.text = i;
  return option;
});

module.exports = {
  unique: uniq,
  intersect,
  createSelectOptionsFromList,
  getUniqueByKey
};
