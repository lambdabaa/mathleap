/* @flow */
/**
 * @fileoverview Takes a question type and returns the question "environment".
 *     Examples are the equation editor, simple text input, graph multiple choice, etc.
 */

function getQuestionType(name: string): string {
  switch (name) {
    case 'Simple addition':
    case 'Simple subtraction':
    case 'Simple multiplication':
    case 'Simple division':
    case 'Simple exponentiation':
    case 'Simple absolute value':
    case 'Decimal addition':
    case 'Decimal subtraction':
    case 'Decimal multiplication':
    case 'Decimal division':
    case 'Adding and subtracting fractions':
    case 'Multiplying fractions':
    case 'Dividing fractions':
    case 'Factoring the difference of squares':
      return 'text-input-response';
    default:
      return 'equation-editor';
  }
}

module.exports = getQuestionType;
