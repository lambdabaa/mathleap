let assignment = require('../../../src/frontend/helpers/assignment');
let session = require('../../../src/frontend/session');

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

  suite('submission', () => {
    let subject = {
      submissions: {
        '54321': {studentId: '54321', complete: false},
        '12345': {studentId: '12345', complete: true},
        'abcde': {studentId: 'abcde', complete: false},
        'bob': {student: 'bob', complete: true}
      }
    };

    setup(() => {
      session.clear();
    });

    test('#getSubmission', () => {
      assignment.getSubmission(subject, {id: '12345'})
      .should
      .deep
      .equal({
        key: '12345',
        submission: {
          studentId: '12345',
          complete: true
        }
      });
    });

    test('#getStudentSubmission', () => {
      session.set('user', {id: '12345'});
      assignment.getStudentSubmission(subject)
      .should
      .deep
      .equal({
        key: '12345',
        submission: {
          studentId: '12345',
          complete: true
        }
      });
    });

    test('#containsStudentSubmission true', () => {
      session.set('user', {id: '12345'});
      assignment.containsStudentSubmission(subject)
      .should
      .equal(true);
    });

    test('#containsStudentSubmission true', () => {
      session.set('user', {id: 'vwxyz'});
      assignment.containsStudentSubmission(subject)
      .should
      .equal(false);
    });

    test('#getStudentStatus not started', () => {
      session.set('user', {id: 'vwxyz'});
      assignment.getStudentStatus(subject).should.equal('Not started');
    });

    test('#getStudentStatus in progress', () => {
      session.set('user', {id: '54321'});
      assignment.getStudentStatus(subject).should.equal('In progress');
    });

    test('#getStudentStatus submitted', () => {
      session.set('user', {id: '12345'});
      assignment.getStudentStatus(subject).should.equal('Submitted');
    });

    test('#getCompleteSubmissionCount', () => {
      assignment.getCompleteSubmissionCount(subject).should.equal(2);
    });
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
