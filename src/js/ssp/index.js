(function () {
  'use strict';

  var xhr = require('xhr');
  var qs = require('query-string');
  var random = require('random-item');

  var template = require('./project.jade');

  var output = document.querySelector('.featured-project');
  var baseURL = 'https://www.sciencebase.gov/catalog/items';

  var params = qs.stringify({
    format: 'json',
    tags: 'SSPQR',
    max: 20,
    fields: 'title,spatial,body,summary,previewImage,purpose'
  });

  // Join the BaseURL with query string
  var url = [baseURL, params].join('?');

  xhr.get(url, handleResponse);

  function handleResponse(err, res, body) {
    if (err) console.log(err);
    var data = JSON.parse(body);
    var project = random(data.items);
    output.innerHTML = template({ project: project });

    console.log(project);
  }


})();
