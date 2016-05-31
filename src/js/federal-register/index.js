(function () {
  'use strict';

  var jsonp = require('jsonp');

  var template = require('./results.jade');
  var list = document.querySelector('.register-list');
  var more = document.getElementById('load-more-fr-docs');

  more.addEventListener('click', function () {
    searchRegister(moreUrl);
  });

  var url = 'https://www.federalregister.gov/api/v1/articles.json?per_page=20&order=newest&conditions%5Bagencies%5D%5B%5D=fish-and-wildlife-service&conditions%5Bdocket_id%5D=fws-r4';
  var moreUrl;

  function searchRegister(url) {
    var options = {
      "prefix": "foo"
    };

    jsonp(url, options, function (err, data) {
      if (err) console.log(err);
      appendResults(data.results);
      moreUrl = data.next_page_url;
    });
  }

  function appendResults(results) {
    list.insertAdjacentHTML('beforeend', template({ results: results }));
  }

  searchRegister(url);
})();
