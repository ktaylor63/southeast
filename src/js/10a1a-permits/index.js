(function() {
  'use strict';
  var filter = require('lodash.filter');
  var fs = require('fs');

  var permits = JSON.parse(fs.readFileSync(__dirname + '/permits.js', 'utf8')),
      output = document.querySelector('.output'),
      search = document.getElementById('permit-search'),
      html = '';

  search.addEventListener('keyup', function (e) {
    var query = e.target.value,
        match;
    console.log(query);

    if (query.length < 6) {
      output.innerHTML = '';
      return;
    }

    match = filter(permits, function (permit) {
      return permit.number === query;
    });

    if (match.length === 1) {
      html = 'Status: ' + match[0].status + '<br>';
      html += 'Federal Register Status: ' + match[0].fed_register;
      output.innerHTML = html;
    } else if (query.length < 6 && match.length === 0) {
      output.innerHTML = 'An error occurred. Could not find permit number.';
    }
  });

}());
