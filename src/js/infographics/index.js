const Masonry = require('masonry-layout');
const loaded = require('imagesloaded');

const grid = document.querySelector('.masonry-grid');

loaded(grid, () => {
  const msnry = new Masonry(grid, {
    itemSelector: '.masonry-item',
    columnWidth: 250,
    gutter: 10
  });
});
