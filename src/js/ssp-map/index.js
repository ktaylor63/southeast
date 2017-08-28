const L = require('leaflet');
const clickDownload = require('client-csv');
const papaparse = require('papaparse');
const inside = require('turf-inside');
require('leaflet-draw');

const sciencebase = require('./sciencebase');
const layers = require('./layers');

const infoWindow = document.querySelector('.info-window');
const downloadButton = document.querySelector('.download-button');
const infoContent = infoWindow.querySelector('.info-window-content');
const markerPath = `${document.body.getAttribute('data-root')}images/`;

L.Icon.Default.imagePath = markerPath;

const editableLayers = new L.FeatureGroup();
const drawOptions = {
  draw: { circle: false, polyline: false, rectangle: false, marker: false },
  edit: { featureGroup: editableLayers, edit: false }
};
const drawControl = new L.Control.Draw(drawOptions);

let map;

function template(project) {
  const props = project.properties;
  const img = props.img
    ? `<figure class="photo-right"><img src="${props.img}" alt="A preview image of this project" /></figure>`
    : '';
  return `
    <h2>${props.title}</h2>
    <p>${props.description}</p>
    ${img}
    <p><a href="${props.url}" target="_blank">More details on ScienceBase.gov</a></p>
  `;
}

// Use Turf.js inside function to return an array of markers that
//  fall inside the user-created polygon
function pointsInPolygon(points, polygon) {
  const allMarkers = Object.values(points._layers); // eslint-disable-line no-underscore-dangle
  return allMarkers.filter(marker => inside(marker.toGeoJSON(), polygon));
}

function normalizeDataForDownload(markers) {
  return markers.map(marker => {
    const normalized = marker.feature.properties;
    normalized.lat = marker.feature.geometry.coordinates[0];
    normalized.lon = marker.feature.geometry.coordinates[1];
    return normalized;
  });
}

function createDownloadLink(data) {
  const string = papaparse.unparse(data);
  clickDownload(downloadButton, encode => ({
    filename: 'ssp-projects.csv',
    contents: encode.text(string)
  }));
  downloadButton.classList.add('active');
}

function toggleInfoWindow(e) {
  const project = e.target.feature;
  infoContent.innerHTML = template(project);
  infoWindow.classList.toggle('active');
}

function clickHandler(feature, layer) {
  layer.on({ click: toggleInfoWindow });
}

// Is called with sciencebase data after the init function is finished
function createMap(projects) {
  map = L.map('sciencebase-map', {
    scrollWheelZoom: false
  });
  const geojson = L.geoJSON(projects, {
    onEachFeature: clickHandler
  }).addTo(map);

  map.addLayer(editableLayers).fitBounds(geojson.getBounds()).addControl(drawControl);

  map.on(L.Draw.Event.CREATED, e => {
    const markersInPolygon = pointsInPolygon(geojson, e.layer.toGeoJSON());
    if (markersInPolygon.length === 0) return;
    const data = normalizeDataForDownload(markersInPolygon);
    createDownloadLink(data);
    editableLayers.addLayer(e.layer);
  });
  layers.esriTopo.addTo(map);
}

sciencebase.init(createMap);
