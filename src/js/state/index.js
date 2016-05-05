(function () {
  'use strict';

  var xhr = require('xhr');

  var state = document.querySelector('.state-name').textContent;
  var list = document.querySelector('.fast-facts');
  var listedUrl = 'http://arsf.us-east-1.elasticbeanstalk.com/listed?state=' + state;
  var atRiskUrl = 'http://arsf.us-east-1.elasticbeanstalk.com/species?range[]=' + state;

  function createListItem(text, src) {
    var li = document.createElement('li');
    var link;
    if (src) {
      link = document.createElement('a');
      link.setAttribute('src', src);
      link.textContent = text;
      li.appendChild(link);
    } else {
      li.textContent = text;
    }

    list.appendChild(li);
  }

  xhr.get(listedUrl, function (err, response, body) {
    if (err) console.error(err);
    console.log(response);
    var listed = JSON.parse(body);
    var src = 'http://ecos.fws.gov/tess_public/reports/species-listed-by-state-report?status=listed&state=' + state;
    createListItem(listed.threatened + ' Threatened Species', src);
    createListItem(listed.endangered + ' Endangered Species', src);
  });

  xhr.get(atRiskUrl, function (err, response, body) {
    if (err) console.error(err);
    var species = JSON.parse(body);
    createListItem(species.length + ' At-Risk Species');
  });
})();
