/* @flow */

module.exports = async function preloadImage(url: string): Promise<void> {
  await Promise.resolve();
  let image = document.createElement('img');
  image.src = url;
  image.classList.add('preload-image');
  document.body.appendChild(image);
};
