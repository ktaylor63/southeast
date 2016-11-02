(function () {
  'use strict';

  var xhr = require('xhr');
  var geojson = require('geojson');
  var qs = require('query-string');
  var _ = {
    each: require('lodash.foreach')
  };

  var baseURL = 'https://www.sciencebase.gov/catalog/items';
  var params = qs.stringify({
    format: 'json',
    q: 'SSPQR, storymap',
    fields: 'title,spatial,body,summary,previewImage,purpose'
  });
  var url = [baseURL, params].join('?');
  var projects = [];

  function init(cb) {
    xhr.get(url, function(err, res, body) {
      if (err) console.log(err);
      // Should check res for 200 response code
      formatResult(body, cb);
    });
  }

  function formatResult(body, cb) {
    var data = JSON.parse(body);

    _.each(data.items, function(project) {
      projects.push(normalizeProject(project));
    });
    projects = geojson.parse(projects, { Point: ['lat', 'lon'] });
    cb(projects);
  }

  function normalizeProject(project) {
    return {
      title: project.title,
      description: project.body,
      url: project.link.url,
      purpose: project.purpose,
      lat: project.spatial.representationalPoint[1],
      lon: project.spatial.representationalPoint[0],
      img: project.previewImage.original.uri || null
    };
  }

  function getProjects(query) {
    // Should be able to return only the projects we need
    return projects;
  }

  module.exports.init = init;
  module.exports.getProjects = getProjects;
})();
