/* @flow */

module.exports = async function preloadImage(url: string): Promise<void> {
  await Promise.resolve();
  // $FlowFixMe: Why does flow not like this?
  let image = document.createElement('img');
  image.src = url;
  image.zIndex = '-100';
  document.body.appendChild(image);
};
