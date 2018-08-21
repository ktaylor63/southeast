const InfiniteScroll = require('infinite-scroll');

const elm = document.querySelector('.card-list');

const options = {
  path: '.pagination-next',
  append: '.card'
};

const infScroll = new InfiniteScroll(elm, options);
