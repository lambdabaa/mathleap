/* @flow */

module.exports = function preloadImage(url: string): void {
  process.nextTick((): void => {
    let image = document.createElement('img');
    image.src = url;
    image.zIndex = '-100';
    document.body.appendChild(image);
  });
};
