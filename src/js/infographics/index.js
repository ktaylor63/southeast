const Masonry = require('masonry-layout');

const msnry = new Masonry('.masonry-grid', {
  itemSelector: '.masonry-item',
  columnWidth: 250,
  gutter: 10
});
