(function () {
  'use strict';

  var qs = require('query-string');
  var xhr = require('xhr');
  var templates = {
    results: require('./results.jade'),
    error: require('./error.jade')
  };

  var output  = document.querySelector('.card-list');
  var API_KEY = '84OIdzD2Zota1B7hzOQmuWydt/kh8k1z2bdCx6dHpBY=';
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
    if (err) expandSearch();

    if (!err && res.statusCode == 200) {
      var data = JSON.parse(body);
      if (data.SearchResult.SearchResultCount === 0) expandSearch();
      else render('results', { results: data.SearchResult.SearchResultItems });
    }
  });

  function render(template, data) {
    output.innerHTML = templates[template](data);
  }

  function expandSearch() {
    var h2 = document.createElement('h2');
    h2.innerHTML = 'No Results in the Southeast, Expanding Search Nationwide:';
    queryString = qs.stringify({ Organization: 'IN15' });
    options.url = [baseURL, queryString].join('?');

    xhr.get(options, function (err, res, body) {
      if (err) {
        render('error', {
          error: 'Could not download jobs listings',
          message: 'Visit <a href="https://usajobs.gov">USAjobs.gov</a> to create your own search.'
        });
      }

      if (!err && res.statusCode == 200) {
        var data = JSON.parse(body);
        if (data.SearchResult.SearchResultCount === 0) {
          render('error', {
            error: 'No U.S. Fish and Wildlife job openings found.',
            message: 'Try <a href="https://usajobs.gov">USAjobs.gov</a> to expand your search criteria.'
          });
        } else {
          render('results', { results: data.SearchResult.SearchResultItems });
          output.parentNode.insertBefore(h2, output);
        }
      }
    })

  }

})();
