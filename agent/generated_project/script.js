// script.js
// Calculator engine and UI integration

// ====================
// Calculator Class
// ====================

/**
 * Calculator implements a basic arithmetic expression evaluator using the
 * Shunting‑Yard algorithm to respect operator precedence.
 * It is UI‑agnostic – only string/number handling.
 */
class Calculator {
  constructor() {
    /** @type {string} */
    this.currentInput = '';
    /** @type {string[]} */
    this.expressionStack = [];
    /** @type {number|null} */
    this.lastResult = null;
  }

  /** Append a digit (0‑9) to the current input, handling leading zeros. */
  appendDigit(digit) {
    if (digit < '0' || digit > '9') return;
    // Prevent leading zeros like "00" unless after a decimal point
    if (this.currentInput === '0' && digit === '0') return;
    if (this.currentInput === '0' && digit !== '0' && !this.currentInput.includes('.')) {
      this.currentInput = digit; // replace leading zero
    } else {
      this.currentInput += digit;
    }
  }

  /** Append a decimal point if not already present. */
  appendDecimal() {
    if (!this.currentInput.includes('.')) {
      // If currentInput is empty, start with "0."
      this.currentInput = this.currentInput ? this.currentInput + '.' : '0.';
    }
  }

  /** Push the current input and operator onto the expression stack and reset input. */
  setOperator(op) {
    if (!['+', '-', '*', '/'].includes(op)) return;
    // If there is a pending number, push it first
    if (this.currentInput !== '') {
      this.expressionStack.push(this.currentInput);
    }
    // If the last token is also an operator, replace it (allows changing operator before entering next number)
    const last = this.expressionStack[this.expressionStack.length - 1];
    if (last && ['+', '-', '*', '/'].includes(last)) {
      this.expressionStack[this.expressionStack.length - 1] = op;
    } else {
      this.expressionStack.push(op);
    }
    this.currentInput = '';
  }

  /** Reset the calculator to its initial state. */
  clear() {
    this.currentInput = '';
    this.expressionStack = [];
    this.lastResult = null;
  }

  /** Evaluate the current expression.
   * Returns a number on success, or the string "Error" on failure (e.g., division by zero).
   */
  evaluate() {
    // Assemble the full token list
    const tokens = [...this.expressionStack];
    if (this.currentInput !== '') tokens.push(this.currentInput);
    if (tokens.length === 0) return this.lastResult !== null ? this.lastResult : 0;

    // Shunting‑Yard: convert infix tokens to RPN
    const outputQueue = [];
    const operatorStack = [];
    const precedence = { '+': 1, '-': 1, '*': 2, '/': 2 };
    const associativity = { '+': 'L', '-': 'L', '*': 'L', '/': 'L' };

    for (const token of tokens) {
      if (!isNaN(token)) {
        // token is a number
        outputQueue.push(token);
      } else if (['+', '-', '*', '/'].includes(token)) {
        while (
          operatorStack.length &&
          ['+', '-', '*', '/'].includes(operatorStack[operatorStack.length - 1]) &&
          ((associativity[token] === 'L' && precedence[token] <= precedence[operatorStack[operatorStack.length - 1]]) ||
            (associativity[token] === 'R' && precedence[token] < precedence[operatorStack[operatorStack.length - 1]]))
        ) {
          outputQueue.push(operatorStack.pop());
        }
        operatorStack.push(token);
      }
    }
    while (operatorStack.length) {
      outputQueue.push(operatorStack.pop());
    }

    // Evaluate RPN
    const evalStack = [];
    for (const token of outputQueue) {
      if (!isNaN(token)) {
        evalStack.push(parseFloat(token));
      } else {
        const b = evalStack.pop();
        const a = evalStack.pop();
        let res;
        switch (token) {
          case '+':
            res = a + b;
            break;
          case '-':
            res = a - b;
            break;
          case '*':
            res = a * b;
            break;
          case '/':
            if (b === 0) {
              this.clear();
              return 'Error';
            }
            res = a / b;
            break;
          default:
            this.clear();
            return 'Error';
        }
        evalStack.push(res);
      }
    }
    const result = evalStack.pop();
    // Store result and reset stacks for next calculation
    this.lastResult = result;
    this.currentInput = '';
    this.expressionStack = [];
    return result;
  }

  /** Get the value that should be shown on the calculator display. */
  getDisplayValue() {
    if (this.currentInput !== '') return this.currentInput;
    if (this.lastResult !== null) return String(this.lastResult);
    return '0';
  }
}

// Export to global scope for external usage
window.Calculator = Calculator;

// ====================
// UI Binding & Keyboard Support
// ====================

(function () {
  // Ensure the DOM is ready before we query elements
  document.addEventListener('DOMContentLoaded', () => {
    const calc = new Calculator();
    const display = document.getElementById('display');
    const buttons = document.querySelectorAll('.buttons button');

    const updateDisplay = () => {
      if (display) display.value = calc.getDisplayValue();
    };

    // Button click handling
    buttons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const action = btn.dataset.action;
        const value = btn.dataset.value;
        switch (action) {
          case 'digit':
            calc.appendDigit(value);
            break;
          case 'decimal':
            calc.appendDecimal();
            break;
          case 'operator':
            calc.setOperator(value);
            break;
          case 'equals':
            const result = calc.evaluate();
            if (result === 'Error') {
              if (display) display.value = 'Error';
            }
            break;
          case 'clear':
            calc.clear();
            break;
          default:
            // No action
            break;
        }
        updateDisplay();
      });
    });

    // Keyboard handling
    document.addEventListener('keydown', (e) => {
      const key = e.key;
      // Allow only relevant keys
      if (key >= '0' && key <= '9') {
        calc.appendDigit(key);
      } else if (key === '.' || key === ',') {
        // Some keyboards use comma for decimal – treat as decimal point
        calc.appendDecimal();
      } else if (['+', '-', '*', '/'].includes(key)) {
        calc.setOperator(key);
      } else if (key === 'Enter' || key === '=') {
        const result = calc.evaluate();
        if (result === 'Error' && display) display.value = 'Error';
      } else if (key === 'Escape' || key === 'c' || key === 'C') {
        calc.clear();
      } else {
        // Unhandled key – ignore
        return;
      }
      e.preventDefault();
      updateDisplay();
    });

    // Initial display
    updateDisplay();
  });
})();
