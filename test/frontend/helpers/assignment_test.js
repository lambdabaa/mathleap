let assignment = require('../../../src/frontend/helpers/assignment');

let topic = {
  name: 'One Variable Linear Equations',
  types: [
    {
      name: 'Solving equations of the form Ax = B',
      example: '3x = 9',
      questions: []
    },
    {
      name: 'Solving equations of the form x/A = B',
      example: 'x / 2 = 5',
      questions: []
    }
  ]
};

let typeA = {
  name: 'Solving equations of the form Ax = B',
  example: '3x = 9',
  questions: []
};

let typeB = {
  name: 'Solving equations of the form x/A = B',
  example: 'x / 2 = 5',
  questions: []
};

suite('helpers/assignment', () => {
  let subject;

  setup(() => {
    subject = assignment.createAssignment();
    assignment.addTopic(subject, topic, typeA);
    assignment.addTopic(subject, topic, typeB);
    assignment.addTopic(subject, topic, typeA);
    assignment.addTopic(subject, topic, typeB);
    assignment.incrementTopicCount(subject, 0);
    assignment.incrementTopicCount(subject, 1);
    assignment.incrementTopicCount(subject, 1);
    assignment.incrementTopicCount(subject, 1);
    assignment.decrementTopicCount(subject, 1);
    assignment.decrementTopicCount(subject, 2);
  });

  test('#addTopic', () => {
    subject.composition.should.have.length(3);
    subject.composition[0].topic.should.deep.equal(topic);
    subject.composition[0].type.should.deep.equal(typeA);
    subject.composition[1].topic.should.deep.equal(topic);
    subject.composition[1].type.should.deep.equal(typeB);
    subject.composition[2].topic.should.deep.equal(topic);
    subject.composition[2].type.should.deep.equal(typeB);
    subject.composition.forEach(section => {
      section.color.should.match(/^#[0-9a-f]+$/);
    });
  });

  test('#getSize', () => {
    assignment.getSize(subject).should.equal(6);
  });

  test('topic count', () => {
    subject.composition[0].count.should.equal(2);
    subject.composition[1].count.should.equal(3);
    subject.composition[2].count.should.equal(1);
  });

  test('change deadline', () => {
    subject.deadline.date().should.equal(tomorrow());
    assignment.decrementDeadline(subject);
    subject.deadline.date().should.equal(today());
    assignment.incrementDeadline(subject);
    subject.deadline.date().should.equal(tomorrow());
  });
});

function today() {
  return getDate(0);
}

function tomorrow() {
  return getDate(1);
}

function getDate(delta) {
  let date = new Date();
  date.setDate(date.getDate() + delta);
  return date.getDate();
}
