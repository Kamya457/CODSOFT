const display = document.getElementById("display");
const buttons = document.querySelectorAll(".buttons button");

let expression = "";

function updateDisplay() {
  display.value = expression;
}

function lastNumberInfo(expr) {
  const lastOpIndex = Math.max(
    expr.lastIndexOf("+"),
    expr.lastIndexOf("-"),
    expr.lastIndexOf("*"),
    expr.lastIndexOf("/")
  );
  return {
    index: lastOpIndex,
    number: expr.slice(lastOpIndex + 1),
  };
}

for (let i = 0; i < buttons.length; i++) {
  buttons[i].addEventListener("click", function () {
    const value = this.innerText;
    const action = this.dataset.action || null;

    if (action === "clear") {
      expression = "";
      updateDisplay();
      return;
    }

    if (action === "delete") {
      expression = expression.slice(0, -1);
      updateDisplay();
      return;
    }

    if (action === "percent") {
      const info = lastNumberInfo(expression);
      if (info.number === "") return;
      const valueNum = parseFloat(info.number);
      if (isNaN(valueNum)) return;
      const replaced = (valueNum / 100).toString();
      expression = expression.slice(0, info.index + 1) + replaced;
      updateDisplay();
      return;
    }

    if (action === "equals") {
      try {
        const safeExpr = expression.replace(/[^0-9.+\-*/()%]/g, "");
        // evaluate
        // eslint-disable-next-line no-new-func
        const result = Function("return (" + safeExpr + ")")();
        expression = String(result);
        updateDisplay();
      } catch (e) {
        display.value = "Error";
        expression = "";
      }
      return;
    }

    if (action === "operator") {
      const op = value;
      if (expression === "" && op !== "-") return; // don't allow starting with +*/
      const lastChar = expression.slice(-1);
      if (/[+\-*/]/.test(lastChar)) {
        // replace operator
        expression = expression.slice(0, -1) + op;
      } else {
        expression += op;
      }
      updateDisplay();
      return;
    }

    if (value === ".") {
      const info = lastNumberInfo(expression);
      if (info.number.includes('.')) return; // prevent multiple decimals in same number
      if (info.number === "") {
        expression += "0.";
      } else {
        expression += ".";
      }
      updateDisplay();
      return;
    }

    // default: number
    if (/^[0-9]$/.test(value)) {
      expression += value;
      updateDisplay();
    }
  });
}

// keyboard support
document.addEventListener('keydown', (e) => {
  const key = e.key;
  if (/^[0-9]$/.test(key)) {
    expression += key;
    updateDisplay();
    return;
  }
  if (key === 'Enter') {
    // trigger equals
    try {
      const safeExpr = expression.replace(/[^0-9.+\-*/()%]/g, "");
      const result = Function("return (" + safeExpr + ")")();
      expression = String(result);
      updateDisplay();
    } catch (e) {
      display.value = "Error";
      expression = "";
    }
    return;
  }
  if (key === 'Backspace') {
    expression = expression.slice(0, -1);
    updateDisplay();
    return;
  }
  if (key === 'Escape') {
    expression = "";
    updateDisplay();
    return;
  }
  if (['+', '-', '*', '/'].includes(key)) {
    const lastChar = expression.slice(-1);
    if (/[+\-*/]/.test(lastChar)) {
      expression = expression.slice(0, -1) + key;
    } else {
      expression += key;
    }
    updateDisplay();
    return;
  }
  if (key === '.') {
    const info = lastNumberInfo(expression);
    if (info.number.includes('.')) return;
    if (info.number === "") expression += '0.'; else expression += '.';
    updateDisplay();
    return;
  }
});
