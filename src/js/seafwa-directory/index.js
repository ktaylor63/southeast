const qs = require('qs');

const template = require('./template');
const helpers = require('./helpers');

const input = document.querySelector('.employee-search');
const list = document.querySelector('.employee-list');
const cityPickList = document.querySelector('.employee-city');
const statePickList = document.querySelector('.employee-state');
const totalEmployees = document.querySelector('.total-employees');
const filteredEmployees = document.querySelector('.filtered-employees');

let employees;

const byName = (a, b) => a.Name.localeCompare(b.Name);

const getQueryStringValue = () => {
  const queries = ['q', 'query', 's', 'search'];
  const parsed = qs.parse(location.search.replace('?', ''));
  let value = false;
  queries.forEach(query => {
    if (parsed[query]) value = parsed[query];
  });
  return value;
};

const addOptionsToPickList = (arr, select) => {
  const options = helpers.createSelectOptionsFromList(arr.sort());
  options.forEach(o => select.appendChild(o));
};

const init = data => {
  const query = getQueryStringValue();
  employees = data;
  input.addEventListener('input', search);
  cityPickList.addEventListener('input', search);
  statePickList.addEventListener('input', search);

  const cities = helpers.getUniqueByKey(data, 'City');
  const states = helpers.getUniqueByKey(data, 'State');

  addOptionsToPickList(cities, cityPickList);
  addOptionsToPickList(states, statePickList);

  if (query) {
    search({ target: { value: query } });
    input.value = query;
  } else {
    render(employees);
  }

  input.focus();
  filteredEmployees.innerHTML = employees.length;
  totalEmployees.innerHTML = employees.length;
};

const filterByRegex = (query, list, key) => {
  const regex = new RegExp(query, 'gi');
  return list.filter(x => regex.test(x[key]));
};

const search = () => {
  const query = input.value;
  const regex = new RegExp(query, 'gi');

  const matches = employees.filter(e => {
    const isName = regex.test(e.Name);
    const isTitle = regex.test(e.Title);
    const isDepartment = regex.test(e.Department);
    return isTitle || isName || isDepartment;
  });

  const cityMatches = filterByRegex(cityPickList.value, employees, 'City');
  const stateMatches = filterByRegex(statePickList.value, employees, 'State');

  if (!matches && !statePickList.value && !cityPickList.value) {
    filteredEmployees.innerHTML = 0;
    renderBlank();
  } else if (query.length === 0 && !stateMatches && !cityMatches) {
    filteredEmployees.innerHTML = employees.length;
    render(employees);
  } else {
    const filtered = helpers.intersect(matches, stateMatches, cityMatches);
    render(filtered);
    filteredEmployees.innerHTML = filtered.length;
  }
};

const render = data => {
  list.innerHTML = data
    .sort(byName)
    .map(template)
    .join('');
};

const renderBlank = () => (list.innerHTML = '<li class="card card-text employee"><h2 style="margin:auto;">Your query did not return any results</h2></li>');

fetch('../data/seafwa-directory.js')
  .then(res => res.json())
  .then(init);
