let format = require('../../../../client/frontend/helpers/format');

suite('helpers/format', () => {
  test('#student', () => {
    format.student({
      first: 'Gareth',
      last: 'Aye',
      username: 'gareth'
    })
    .should
    .equal('Gareth Aye (gareth)');
  });

  test('#student w/o first', () => {
    format.student({
      last: 'Aye',
      username: 'gareth'
    })
    .should
    .equal('Aye (gareth)');
  });

  test('#studentName', () => {
    format.studentName({
      first: 'Gareth',
      last: 'Aye'
    })
    .should
    .equal('Gareth Aye');
  });

  test('#studentName w/o first', () => {
    format.studentName({last: 'Aye'}).should.equal('Aye');
  });

  test('#teacher', () => {
    format.teacher({
      title: 'Dr.',
      last: 'Aye'
    })
    .should
    .equal('Dr. Aye');
  });

  test('#teacher w/o title', () => {
    format.teacher({last: 'Aye'}).should.equal('Aye');
  });
});
