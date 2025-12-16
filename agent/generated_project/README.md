# Simple Calculator Web App

## Short Description
A lightweight, browser‑based calculator that performs basic arithmetic operations. It demonstrates clean separation of HTML, CSS, and JavaScript while keeping the logic encapsulated in a reusable `Calculator` class.

---

## Tech Stack
- **HTML** – Structure of the web page.
- **CSS** – Styling and responsive layout.
- **JavaScript** – Core calculator logic (`Calculator` class) and UI interaction.

---

## Features
- **Basic Operations** – Addition, subtraction, multiplication, and division.
- **Clear & Delete** – Reset the entire expression or delete the last entry.
- **Keyboard Support** – Users can type numbers and operators directly.
- **Responsive Design** – Works on desktop, tablet, and mobile screens.
- **Modular Code** – Logic lives in `script.js`; UI markup in `index.html`; styling in `style.css`.

---

## Installation / Usage
1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/simple-calculator-web-app.git
   cd simple-calculator-web-app
   ```
2. **Open the app**
   - Open `index.html` in any modern web browser (Chrome, Firefox, Edge, Safari). No build tools or package managers are required.
3. **Start calculating!**
   - Click the on‑screen buttons or use your keyboard to enter numbers and operators.

---

## Development Notes
### File Responsibilities
- **`index.html`** – Contains the markup for the calculator layout and includes the stylesheet and script.
- **`style.css`** – Provides visual styling, grid layout, and media queries for responsiveness.
- **`script.js`** – Implements the `Calculator` class and wires UI events to its methods.

### How the `Calculator` Class Works
```js
class Calculator {
  constructor(displayElement) { /* ... */ }
  appendNumber(num) { /* adds a digit or decimal */ }
  chooseOperation(op) { /* stores the pending operation */ }
  compute() { /* performs the calculation */ }
  delete() { /* removes the last character */ }
  clear() { /* resets the calculator */ }
  updateDisplay() { /* renders the current state */ }
}
```
- The class holds the current operand, previous operand, and the selected operation.
- All UI updates are funneled through `updateDisplay()`, keeping the DOM manipulation isolated.
- Event listeners in `script.js` instantiate the class with the display element and forward button clicks/keyboard events to the appropriate methods.

### Extending the Calculator
To add more operations (e.g., exponentiation, modulo, or scientific functions):
1. Extend the `chooseOperation` method to recognize new operator symbols.
2. Update the `compute` method with the corresponding calculation logic.
3. Add new buttons to `index.html` and style them in `style.css`.
4. Register the new buttons in the event‑binding section of `script.js`.

---

## Screenshots
<img width="1501" height="823" alt="image" src="https://github.com/user-attachments/assets/fc59121a-e768-448b-9c12-87c23818f2ca" />


---

## Responsive Design Notes
- The layout uses CSS Grid to adapt the button grid based on viewport width.
- Media queries shrink button sizes and adjust font scaling for mobile devices.
- The calculator remains fully functional on touch screens and with keyboard input.

---

## License
This project is licensed under the **MIT License** – see the `LICENSE` file for details.
