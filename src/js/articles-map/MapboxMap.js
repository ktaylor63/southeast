const mapboxgl = require('mapbox-gl');
const emitter = require('./eventBus');
const GeoJSON = require('geojson');

mapboxgl.accessToken =
  'pk.eyJ1Ijoicmhld2l0dCIsImEiOiJjamJwZHNpZTQ0YzJvMnhxd2R5Z2djMHM2In0.KBV_ugD7VoECqIyzDBTOkA';

class MapboxMap {
  constructor(options) {
    this.popup = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false
    });
    this.sidebar = false;
    this.container = options.container || document.querySelector('#map');
    this.geojson = options.geojson || null;
    this.map = new mapboxgl.Map({
      container: options.container || 'map',
      style: options.style || 'mapbox://styles/mapbox/light-v9',
      center: options.center || [-96, 37.8],
      zoom: options.zoom || 3,
      maxZoom: options.maxZoom || 22,
      hash: options.hash || true
    });

    this.paddingSmall = 50;
    this.paddingLarge = { top: 40, right: 40, bottom: 40, left: 350 };

    this.map.addControl(new mapboxgl.NavigationControl(), 'bottom-left');

    if (options.getBoundsFromGeojson && this.geojson) {
      const padding =
        this.container.offsetWidth < 800
          ? this.paddingSmall
          : this.paddingLarge;
      this.map.on('load', () => {
        this.map.fitBounds(this.getBounds(this.geojson), { padding });
      });
    }

    if (options.geojson) {
      this.map.on('load', () => {
        this.map.addLayer({
          id: 'stories',
          type: 'circle',
          source: {
            type: 'geojson',
            data: options.geojson
            // cluster: true
          },
          paint: options.paint || {
            'circle-radius': ['case', ['get', 'highlight'], 9, 6],
            'circle-color': [
              'case',
              ['get', 'highlight'],
              '#0070e8',
              '#003977'
            ],
            'circle-stroke-width': 1,
            'circle-stroke-color': 'white'
          }
        });
      });

      this.map.on('mouseenter', 'stories', this.mouseEnter.bind(this));
      this.map.on('mouseleave', 'stories', this.mouseLeave.bind(this));
      this.map.on('click', 'stories', this.selectStory.bind(this));
      emitter.on('infowindow.show', this.panMap.bind(this));
      emitter.on('infowindow.hide', this.panMap.bind(this));
      emitter.on('story.selected', this.highlightStory.bind(this));
      emitter.on('search.results', this.updateGeoJSON.bind(this));
    }
  }

  highlightStory(selected) {
    const geojson = this.map.getSource('stories')._data;

    const features = geojson.features.map(s => {
      if (s.properties.title === selected.title) {
        return Object.assign({}, s, {
          properties: { ...s.properties, highlight: true }
        });
      }
      return Object.assign({}, s, {
        properties: { ...s.properties, highlight: false }
      });
    });

    const newData = Object.assign({}, { features, type: 'FeatureCollection' });
    this.map.getSource('stories').setData(newData);
    emitter.emit('map.highlightedFeatures');
  }

  updateGeoJSON(json) {
    const geojson = GeoJSON.parse(json, { Point: ['lat', 'lng'] });
    this.map.getSource('stories').setData(geojson);
    const highlighted = geojson.features.filter(f => f.properties.highlight);
    if (highlighted.length) this.zoomToFeatures(highlighted);
    else this.zoomToFeatures(geojson.features);
    emitter.emit('map.highlightedFeatures');
  }

  zoomToFeatures(features) {
    const padding =
      this.container.offsetWidth < 600 ? this.paddingSmall : this.paddingLarge;
    const highlightedBounds = this.getBounds({ features });
    this.map.fitBounds(highlightedBounds, { padding });
  }

  selectStory(e) {
    const selected = e.features[0];
    const feature = Object.assign({}, selected.properties, {
      tags: JSON.parse(selected.properties.tags)
    });
    emitter.emit('story.selected', feature);
  }

  panMap(direction) {
    const distance = this.map._containerDimensions()[0] / 5;
    this.map.panBy([distance * direction, 0], {
      duration: 500,
      easing: t => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t)
    });
  }

  mouseLeave() {
    this.map.getCanvas().style.cursor = '';
    this.popup.remove();
  }

  mouseEnter(e) {
    const feat = e.features[0];
    const props = feat.properties;
    // prettier-ignore
    const img = props.img !== 'null'
      ? `<img src="https://www.fws.gov/southeast/images/hero/small/${props.img}"
          alt="${props.alt}"/>`
      : '';
    this.map.getCanvas().style.cursor = 'pointer';
    this.popup
      .setLngLat(feat.geometry.coordinates)
      .setHTML(`${img}<h2>${props.title}</h2><p><em>Click for more</em></p>`)
      .addTo(this.map);
  }

  getBounds(data) {
    const stuff = data || this.geojson;
    return stuff.features.reduce(
      (bounds, feature) => bounds.extend(feature.geometry.coordinates),
      new mapboxgl.LngLatBounds()
    );
  }
}

module.exports = MapboxMap;
