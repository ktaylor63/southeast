const InfiniteScroll = require('infinite-scroll');

const elm = document.querySelector('.card-list');
const pagination = document.querySelector('.pagination');

const remove = el => el.parentNode.removeChild(el);

const options = {
  path: '.pagination-next',
  append: '.card'
};

if (pagination) {
  const infScroll = new InfiniteScroll(elm, options);
  infScroll.once('append', () => remove(pagination));
}
