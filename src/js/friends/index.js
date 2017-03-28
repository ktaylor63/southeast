const xhr = require('xhr');

const templates = {
  results: require('./results.pug'),
  noResults: require('./noResults.pug')
};

const list = document.querySelector('.friends-group-list');
const input = document.querySelector('.friends-search');
const totalGroups = document.querySelector('.total-groups');
const totalRefuges = document.querySelector('.total-refuges');
const totalHatcheries = document.querySelector('.total-hatcheries');

let hasWWW = window.location.href.indexOf('www');
hasWWW = (hasWWW < 0) ? false : true;
const baseURL = document.body.getAttribute('data-root');
const dataURL = hasWWW ? baseURL : baseURL.replace('www.', '');

let data;

xhr.get(`${dataURL}data/friends-groups.js`, (err, res, body) => {

  data = JSON.parse(body);
  render(data);
  totalGroups.innerHTML = data.length;
  totalRefuges.innerHTML = updateCount(data, 'refuge');
  totalHatcheries.innerHTML = updateCount(data, 'hatchery');

  input.addEventListener('keyup', search);
});

function search(e) {
  const query = e.target.value;
  const regex = new RegExp(query, 'gi');
  let matches;

  if (query.length === 0) {
    render(data);
    return;
  }

  matches = data.filter(group => {
    const isName = regex.test(group.name);
    const isSupported = regex.test(group.stations_supported);
    const isCity = regex.test(group.city);
    const isState = regex.test(group.state);
    return (isName || isSupported || isCity || isState);
  });

  render(matches);
}

function render(friends) {
  if (friends.length === 0) list.innerHTML = templates.noResults();
  else list.innerHTML = templates.results({ friends: friends });
}

function updateCount(data, type) {
  return data.filter(group => group.station_type === type).length;
}
