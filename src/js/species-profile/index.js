(function () {
  'use strict';

  var jsonp = require('jsonp');
  var templates = {
    results: require('./result.jade'),
    error: require('./error.jade'),
    noResults: require('./noResults.jade')
  };

  var list = document.querySelector('.register-list');
  var sciName = document.querySelector('.scientific-name').textContent;
  var animal = encodeURIComponent(sciName.replace('(', '').replace(')', ''));
  var url = 'https://www.federalregister.gov/api/v1/articles.json?per_page=1000&order=relevance&conditions%5Bterm%5D=' + animal + '&conditions%5Bagencies%5D%5B%5D=fish-and-wildlife-service';

  jsonp(url, function (err, data) {
    if (err) {
      console.log(err);
      list.innerHTML = templates.error();
    }
    else if (data.count === 0) list.innerHTML = templates.noResults({ name: decodeURIComponent(animal) });
    else if (data.count > 0) list.innerHTML = templates.results({ results: data.results });
  });
})();
