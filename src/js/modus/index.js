const xhr = require('xhr');
const L = require('leaflet');
require('leaflet.markerCluster');
require('leaflet.featuregroup.subgroup');
require('leaflet.defaultextent');
const parallel = require('async/parallel');

let hasWWW = window.location.href.indexOf('www');
hasWWW = (hasWWW < 0) ? false : true;
const baseURL = document.body.getAttribute('data-root');
const dataURL = hasWWW ? baseURL : baseURL.replace('www.', '');

const towerUrl = `${dataURL}data/modus-towers.js`;
const detectionsUrl = `${dataURL}data/modus-detections.js`;

const colors = ['blue', 'purple', 'red', 'green', 'yellow'];
const towerColors = [...colors];
const clusterGroup = L.layerGroup();

L.Icon.Default.imagePath = '../images/';

const getTowerIcon = color => {
  return new L.Icon({
    iconUrl: '../images/svg/tower-${color}.svg',
    iconSize:     [20, 40],
    iconAnchor:   [15, 35],
    popupAnchor:  [-5, -28]
  });
}
const getCircleIcon = color => {
  return new L.Icon({
    iconUrl: '../images/svg/circle-${color}.svg',
    iconSize:     [20, 40],
    iconAnchor:   [15, 35],
    popupAnchor:  [-5, -28]
  });
}

const createClusterIcon = (cluster, color) => {
  return L.divIcon({
    html: cluster.getAllChildMarkers().length,
    className: `cluster cluster-${color}`,
    showCoverageOnHover: false
  });
}

const homeIcon = `<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="26px" height="26px" viewBox="0 0 26 26" enable-background="new 0 0 26 26" xml:space="preserve"><g id="home"><polygon fill="#464646" points="11.2,20.65 11.2,15.249 14.8,15.249 14.8,20.65 19.3,20.65 19.3,13.45 22,13.45 13,5.35 4,13.45 6.7,13.45 6.7,20.65"/></g></svg>`;

const esriNatGeo = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}', {
  attribution: 'Tiles &copy; Esri &mdash; National Geographic, Esri, DeLorme, NAVTEQ, UNEP-WCMC, USGS, NASA, ESA, METI, NRCAN, GEBCO, NOAA, iPC',
  maxZoom: 16
});

const esriImagery = L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
});

const createDetectionTemplate = (props) => {
  return `
  <p><strong>${props.spp}</strong><br>${props.tag_site}</p>
  <div>Detected on: ${props.dates}</div>
  `;
}

const createGeoJsonLayer = (geojson, site, colors) => {
  const color = colors.pop();
  const cluster = L.markerClusterGroup({
    maxClusterRadius: 25,
    iconCreateFunction: cluster => {
      return createClusterIcon(cluster, color);
    }
  });
  const layer = L.geoJSON(geojson, {
    filter(feat, layer) {
      return feat.properties.site === site;
    },
    pointToLayer(feat, layer) {
      return pointToLayer(feat, layer, color);
    },
    onEachFeature
  });
  return cluster.addLayer(layer);
}

const createMap = (err, data) => {
  if (err) console.error(err);

  const sites = Array.from(new Set(data.detections.features.map(d => d.properties.site)));
  const labels = sites
    .map(s => s.split(/(?=[A-Z])/))
    .map(a => a.join(' '));

  const towers = L.geoJSON(data.towers, {
    pointToLayer(feat, latlng) {
      return L.marker(latlng, { icon: getTowerIcon(towerColors.pop()) });
    },
    onEachFeature
  });
  const detectionLayers = sites.map(site => createGeoJsonLayer(data.detections, site, colors) );

  const overlays = {
    "Towers": towers,
    [labels[0]]: detectionLayers[0],
    [labels[1]]: detectionLayers[1],
    [labels[2]]: detectionLayers[2],
    [labels[3]]: detectionLayers[3]
  }

  const map = L.map('map', { layers: [esriNatGeo, towers, ...detectionLayers] });

  clusterGroup.addTo(map);
  detectionLayers.forEach(l => l.addTo(map));

  L.control.layers(
    { "National Geographic": esriNatGeo, "Imagery": esriImagery },
    overlays,
    { collapsed: false }
  ).addTo(map);

  map.fitBounds(L.geoJSON(data.detections).getBounds());

  L.control.defaultExtent()
    .addTo(map)
    .setCenter(map.getCenter())
    .setZoom(map.getZoom());

  document.querySelector('.leaflet-control-defaultextent-toggle').innerHTML = homeIcon;
}

const pointToLayer = (feat, latlng, color) => {
  const type = feat.properties.spp ? 'detection' : 'tower';
  let marker;

  switch(type) {
    case 'tower':
      marker = L.marker(latlng, { icon: getTowerIcon(color) });
      break;
    default:
      marker = L.marker(latlng, { icon: getCircleIcon(color) });
  }
  return marker;
};

const onEachFeature = (feat, layer) => {
  const props = feat.properties;
  const type = props.spp ? 'detection' : 'tower';
  switch(type) {
    case 'tower':
      layer.bindPopup(props.content);
      break;
    case 'detection':
      layer.bindPopup(createDetectionTemplate(props));
      break;
  }
};

const getData = (url, cb) => {
  xhr.get(url, (err, res, body) => {
    if (err) return cb(err);
    return cb(null, JSON.parse(body));
  });
}

parallel({
  towers: getData.bind(null, towerUrl),
  detections: getData.bind(null, detectionsUrl)
}, createMap);
