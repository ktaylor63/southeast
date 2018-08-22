const InfiniteScroll = require('infinite-scroll');

const elm = document.querySelector('.card-list');
const pagination = document.querySelector('.pagination-next');

const options = {
  path: '.pagination-next',
  append: '.card'
};

if (pagination) new InfiniteScroll(elm, options);
