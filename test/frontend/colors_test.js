let colors = require('../../src/frontend/colors');

suite('colors', () => {
  test('getPalette', () => {
    let palette = colors.getPalette(8);
    palette.length.should.equal(3);
    palette.forEach(row => {
      row.forEach(color => {
        color.should.match(/^#[0-9a-f]+$/);
      });
    });
  });

  test('random', () => {
    colors.colors.should.include(colors.random());
  });
});
