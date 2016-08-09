(function () {
  'use strict';

  var fs = require('fs');
  var filter = require('lodash.filter');

  var data = JSON.parse(fs.readFileSync(__dirname + '/friends.js', 'utf8'));
  var templates = {
    results: require('./results.jade'),
    noResults: require('./noResults.jade')
  };

  var list = document.querySelector('.friends-group-list');
  var input = document.querySelector('.friends-search');
  var totalGroups = document.querySelector('.total-groups');
  var totalRefuges = document.querySelector('.total-refuges');
  var totalHatcheries = document.querySelector('.total-hatcheries');

  render(data);
  totalGroups.innerHTML = data.length;
  totalRefuges.innerHTML = updateCount(data, 'refuge');
  totalHatcheries.innerHTML = updateCount(data, 'hatchery');

  input.addEventListener('keyup', search);

  function search(e) {
    var query = e.target.value.toLowerCase(),
        matches;

    if (query.length === 0) {
      render(data);
      return;
    }

    matches = filter(data, function (group) {
      var isName = group.name.toLowerCase().indexOf(query) > -1;
      var isSupported = group.stations_supported.toLowerCase().indexOf(query) > -1;
      var isCity = group.city.toLowerCase().indexOf(query) > -1;
      var isState = group.state.toLowerCase().indexOf(query) > -1;
      return (isName || isSupported || isCity || isState);
    });

    render(matches);
  }

  function render(friends) {
    if (friends.length === 0) list.innerHTML = templates.noResults();
    else list.innerHTML = templates.results({ friends: friends });
  }

  function updateCount(data, type) {
    var groups = filter(data, function (group) {
      return group.station_type === type;
    });
    return groups.length;
  }

})();
