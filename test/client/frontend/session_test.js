let expect = require('chai').expect;
let session = require('../../../client/frontend/session');

suite('session', () => {
  teardown(() => {
    session.removeAllListeners('change');
    session.removeAllListeners('foo');
  });

  test('set / get', done => {
    session.once('change', () => {
      expect(session.get('foo')).to.equal('bar');
      done();
    });

    session.set('foo', 'bar');
  });

  test('remove', done => {
    session.once('change', () => {
      expect(session.get('foo')).to.equal('bar');
      session.remove('foo');
      expect(session.get('foo')).to.equal(undefined);
      done();
    });

    session.set('foo', 'bar');
  });

  test('clear', () => {
    session.set('foo', 'bar');
    session.clear();
    expect(session.get('foo')).to.equal(undefined);
  });

  test('subscribe', done => {
    let expected = 'bar';
    session.set('foo', expected);
    session.on('foo', value => {
      expect(value).to.equal(expected);
      if (expected === 'baz') {
        return done();
      }

      expected = 'baz';
      session.set('foo', expected);
    });
  });

  test('unsubscribe', done => {
    let listener = () => done();
    session.on('foo', listener);
    session.removeListener('foo', listener);
    // If unsubscribing didn't work, then we'll call done twice
    // and fail the test.
    session.set('foo', 'bar');
  });
});
