(function () {
  'use strict';

  var xhr = require('xhr');
  var nav = require('fws-scrollnav');
  var map = require('./map');

  var abbreviation = document.querySelector('.state-abbreviation').textContent;
  var state = document.querySelector('.state-name').textContent;
  var list = document.querySelector('.fast-facts');
  var listedUrl = 'http://arsf.us-east-1.elasticbeanstalk.com/listed?state=' + abbreviation;
  var atRiskUrl = 'http://arsf.us-east-1.elasticbeanstalk.com/species?range[]=' + state;

  map.init(abbreviation);

  nav.init({
    content: document.getElementById('content')
  });

  function createListItem(text, src) {
    var li = document.createElement('li');
    var link;
    if (src) {
      link = document.createElement('a');
      link.setAttribute('href', src);
      link.setAttribute('target', '_blank');
      link.textContent = text;
      li.appendChild(link);
    } else {
      li.textContent = text;
    }

    list.appendChild(li);
  }

  xhr.get(listedUrl, function (err, response, body) {
    if (err) console.error(err);
    var listed = JSON.parse(body);
    var src = 'http://ecos.fws.gov/tess_public/reports/species-listed-by-state-report?status=listed&state=' + abbreviation;
    createListItem(listed.threatened + ' Threatened Species', src);
    createListItem(listed.endangered + ' Endangered Species', src);
  });

  xhr.get(atRiskUrl, function (err, response, body) {
    if (err) console.error(err);
    var species = JSON.parse(body);
    createListItem(species.length + ' At-Risk Species');
  });
})();
