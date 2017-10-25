const xhr = require('xhr');
const geojson = require('geojson');
const qs = require('query-string');

const baseURL = 'https://www.sciencebase.gov/catalog/items';
const params = qs.stringify({
  format: 'json',
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

function formatResult(body, cb) {
  const data = JSON.parse(body);
  const filtered = data.items.filter(project => project.spatial).map(normalizeProject);

  projects = geojson.parse(filtered, { Point: ['lat', 'lon'] });
  cb(projects);
}

function getProjects() {
  // Should be able to return only the projects we need
  return projects;
}

function init(cb) {
  xhr.get(url, (err, res, body) => {
    if (err) console.log(err);
    // Should check res for 200 response code
    formatResult(body, cb);
  });
}

module.exports.init = init;
module.exports.getProjects = getProjects;
