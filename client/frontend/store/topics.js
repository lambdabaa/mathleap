module.exports = [
  {
    "name": "Arithmetic",
    "types": [
      {
        "name": "Simple addition",
        "example": "2 + 2"
      },

      {
        "name": "Simple subtraction",
        "example": "5 - 2"
      },

      {
        "name": "Simple multiplication",
        "example": "7 * 4"
      },

      {
        "name": "Simple division",
        "example": "16 / 4"
      },

      {
        "name": "Arithmetic distribution",
        "example": "6 * (2 + 3)"
      },

      {
        "name": "Simple exponentiation",
        "example": "5 ^ 3"
      },

      {
        "name": "Compound exponents",
        "example": "(2 ^ 3 + 4 ^ 2) ^ 2"
      },

      {
        "name": "Simple absolute value",
        "example": "|6 - 9|"
      },

      {
        "name": "Complex absolute value",
        "example": "|6 - 9| + 2 * |4 + 1|"
      }
    ]
  },

  {
    "name": "Decimals",
    "types": [
      {
        "name": "Decimal addition",
        "example": "2.3 + 5.1"
      },
      {
        "name": "Decimal subtraction",
        "example": "4.8 - 1.3"
      },
      {
        "name": "Decimal multiplication",
        "example": "3.1 * 8.8"
      },
      {
        "name": "Decimal division",
        "example": "5.94 / 5.4"
      }
    ]
  },

  {
    "name": "Expressions with variables",
    "types": [
      {
        "name": "Evaluating expressions with one variable",
        "example": "5t + 3, t = 2"
      },
      {
        "name": "Evaluating expressions with two variables",
        "example": "xy - y + 3x, x = 3, y = 2"
      },
      {
        "name": "Evaluating fractional expressions with two variables",
        "example": "m - 12n + 8, m = 30, n = 1 / 4"
      }
    ]
  },

  {
    "name": "One Variable Linear Equations",
    "types": [
      {
        "name": "Solving equations of the form Ax = B",
        "example": "3x = 9"
      },

      {
        "name": "Solving equations of the form x/A = B",
        "example": "x / 2 = 5"
      },

      {
        "name": "Solving equations in one step with addition",
        "example": "-20 + t = 5"
      },

      {
        "name": "Solving equations in two steps",
        "example": "2x + 1 = 4"
      },

      {
        "name": "Equations with variables on both sides",
        "example": "5x = x + 4"
      },

      {
        "name": "Simple distribution",
        "example": "3(x - 2) = 4"
      },

      {
        "name": "Clever distribution",
        "example": "x/2 + 1 = x/4 + 6"
      }
    ]
  },


  {
    "name": "Two variable manipulation",
    "types": [
      {
        "name": "Point slope to slope intercept form",
        "instruction": "Express the equation in slope intercept form.",
        "example": "y + 2 = 3(x - 2)"
      },
      {
        "name": "Solving for one variable in terms of another variable",
        "example": "2y - 2 = -x + 3y"
      }
    ]
  },

  {
    "name": "Polynomials",
    "types": [
      {
        "name": "Adding and subtracting polynomials",
        "example": "(2x + y) - (4 - x - 2y)"
      },
      {
        "name": "Differing polynomial coefficients",
        "example": "2(3x - 4y) + 3(-x + 3y - 2)"
      },
      {
        "name": "Factoring the difference of squares",
        "example": "4x^2 - 9",
        "instruction": "Factor."
      }
    ]
  },

  {
    "name": "Inequalities in one variable",
    "types": [
      {
        "name": "One step inequalities",
        "example": "-8p > -80"
      },
      {
        "name": "Two step inequalities",
        "example": "p / 3 - 3 > 0"
      }
    ]
  }
];
