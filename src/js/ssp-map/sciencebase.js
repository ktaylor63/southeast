const jsonp = require('jsonp');
const geojson = require('geojson');
const qs = require('query-string');

const baseURL = 'https://www.sciencebase.gov/catalog/items';
const params = qs.stringify({
  format: 'jsonp',
  q: 'SSPQR, storymap',
  fields: 'title,spatial,body,summary,previewImage,purpose',
  max: 200
});

const url = [baseURL, params].join('?');

let projects;

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

function getProjects() {
  // Should be able to return only the projects we need
  return projects;
}

function init(cb) {
  jsonp(url, (err, data) => {
    // Should check res for 200 response code
    if (err) console.log(err);

    const filtered = data.items.filter(project => project.spatial).map(normalizeProject);

    projects = geojson.parse(filtered, { Point: ['lat', 'lon'] });
    cb(projects);
  });
}

module.exports.init = init;
module.exports.getProjects = getProjects;