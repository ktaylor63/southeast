(function() {
  'use strict';
  var moment = require('moment');
  var filter = require('lodash.filter');
  var fs = require('fs');

  var templates = {
    result: require('./result.jade'),
    error: require('./error.jade')
  };

  var dataUpdated = '2016-08-08';
  var updatedNode = document.querySelector('.permits-last-updated');

  updatedNode.innerHTML = moment(dataUpdated).format('MMMM Do YYYY');

  var permits = JSON.parse(fs.readFileSync(__dirname + '/permits.js', 'utf8')),
      output = document.querySelector('.output'),
      search = document.getElementById('permit-search');

  // Turn into a function instead of anonymous callback
  search.addEventListener('keyup', function (e) {
    var query = e.target.value,
        match;

    if (query.length < 6) {
      output.innerHTML = '';
      return;
    }

    match = filter(permits, function (permit) {
      return permit.number === query;
    });

    if (match.length === 1) output.innerHTML = templates.result({ data: match[0] });
    else if (query.length < 6 && match.length === 0) output.innerHTML = templates.error();
  });

}());
