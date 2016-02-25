/* @flow */

let $ = document.querySelectorAll.bind(document);

module.exports = async function preloadImage(url: string): Promise<void> {
  // We want to preload images async.
  await Promise.resolve();

  // Check to make sure we haven't already loaded.
  let loaded = Array.from($('.preload-image')).some((el: HTMLElement): boolean => {
    return el.src.indexOf(url) !== -1;
  });

  if (loaded) {
    return;
  }

  let image = document.createElement('img');
  image.src = url;
  image.classList.add('preload-image');
  document.body.appendChild(image);
};
