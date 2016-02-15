/* @flow */

module.exports = async function preloadImage(url: string): Promise<void> {
  await Promise.resolve();
  let image = document.createElement('img');
  image.src = url;
  image.style.zIndex = '-100';
  document.body.appendChild(image);
};
