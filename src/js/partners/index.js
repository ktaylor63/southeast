require('image-comparison');

const images = document.querySelectorAll('.comparison-image');

const comparison = new ImageComparison({
  container: document.querySelector('.image-comparison'),
  startPosition: 50,
  data: [
    {
      image: images[0],
      label: 'Before'
    },
    {
      image: images[1],
      label: 'After'
    }
  ]
});
