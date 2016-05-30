(function () {
  'use strict';

  var qs = require('query-string');
  var xhr = require('xhr');
  var template = require('./results.jade');

  var output  = document.querySelector('.job-list');
  var API_KEY = '84OIdzD2Zota1B7hzOQmuWydt/kh8k1z2bdCx6dHpBY=';
  var EMAIL   = 'roy_hewitt@fws.gov';
  var HOST    = 'data.usajobs.gov';
  var baseURL = 'https://data.usajobs.gov/api/search';
  var parameters = {
    Organization: 'IN15',// Get results for USFWS only
    // Get results from R4 States/Provinces only
    LocationName: 'Alabama;Arkansas;Florida;Georgia;Kentucky;Mississippi;North Carolina;Puerto Rico;South Carolina;Tennessee;Virgin Islands'
  };

  var queryString = qs.stringify(parameters);
  var url = [baseURL, queryString].join('?');

  var options = {
    url: url,
    headers: {
      'Authorization-Key': API_KEY
    }
  };

  xhr(options, function(err, res, body) {
    if (err) console.error(err);
    if (!err && res.statusCode == 200) {
      var data = JSON.parse(body);
      output.innerHTML = template({ results: data.SearchResult.SearchResultItems });
    }
  });

})();
