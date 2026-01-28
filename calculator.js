class Calculator {
    constructor() {
        this.expression = '';
        this.result = '0';
        this.useDegrees = false;
        this.expressionEl = document.getElementById('expression');
        this.resultEl = document.getElementById('result');
        this.angleModeEl = document.getElementById('angleMode');
    }

    updateDisplay() {
        this.expressionEl.textContent = this.expression;
        this.resultEl.textContent = this.result;
    }

    append(value) {
        if (this.result === 'Error') {
            this.clear();
        }
        this.expression += value;
        this.updateDisplay();
    }

    clear() {
        this.expression = '';
        this.result = '0';
        this.updateDisplay();
    }

    clearEntry() {
        this.expression = '';
        this.updateDisplay();
    }

    backspace() {
        this.expression = this.expression.slice(0, -1);
        this.updateDisplay();
    }

    factorial(n) {
        if (n < 0) return NaN;
        if (n === 0 || n === 1) return 1;
        if (n > 170) return Infinity;
        let result = 1;
        for (let i = 2; i <= n; i++) {
            result *= i;
        }
        return result;
    }

    toRadians(deg) {
        return deg * (Math.PI / 180);
    }

    toDegrees(rad) {
        return rad * (180 / Math.PI);
    }

    func(name) {
        if (this.result === 'Error') {
            this.clear();
        }
        
        const funcMap = {
            'sin': this.useDegrees ? 'Math.sin(this.toRadians(' : 'Math.sin(',
            'cos': this.useDegrees ? 'Math.cos(this.toRadians(' : 'Math.cos(',
            'tan': this.useDegrees ? 'Math.tan(this.toRadians(' : 'Math.tan(',
            'asin': this.useDegrees ? 'this.toDegrees(Math.asin(' : 'Math.asin(',
            'acos': this.useDegrees ? 'this.toDegrees(Math.acos(' : 'Math.acos(',
            'atan': this.useDegrees ? 'this.toDegrees(Math.atan(' : 'Math.atan(',
            'log': 'Math.log10(',
            'ln': 'Math.log(',
            'sqrt': 'Math.sqrt(',
            'exp': 'Math.exp(',
            'abs': 'Math.abs(',
            'fact': 'this.factorial('
        };

        const needsExtraClose = this.useDegrees && ['sin', 'cos', 'tan', 'asin', 'acos', 'atan'].includes(name);
        this.expression += funcMap[name];
        this._pendingExtraClose = needsExtraClose;
        this.updateDisplay();
    }

    toggleAngleMode() {
        this.useDegrees = !this.useDegrees;
        this.angleModeEl.textContent = this.useDegrees ? 'DEG' : 'RAD';
    }

    calculate() {
        try {
            let expr = this.expression;
            
            const openParens = (expr.match(/\(/g) || []).length;
            const closeParens = (expr.match(/\)/g) || []).length;
            expr += ')'.repeat(openParens - closeParens);

            const evalFunc = new Function('calc', `
                const toRadians = calc.toRadians.bind(calc);
                const toDegrees = calc.toDegrees.bind(calc);
                return ${expr.replace(/this\./g, 'calc.')};
            `);
            
            let result = evalFunc(this);
            
            if (typeof result === 'number') {
                if (Number.isInteger(result)) {
                    this.result = result.toString();
                } else {
                    this.result = parseFloat(result.toPrecision(12)).toString();
                }
            } else {
                this.result = 'Error';
            }
        } catch (e) {
            this.result = 'Error';
        }
        this.expression = '';
        this.updateDisplay();
    }
}

const calc = new Calculator();

document.addEventListener('keydown', (e) => {
    if (e.key >= '0' && e.key <= '9') calc.append(e.key);
    else if (e.key === '.') calc.append('.');
    else if (e.key === '+') calc.append('+');
    else if (e.key === '-') calc.append('-');
    else if (e.key === '*') calc.append('*');
    else if (e.key === '/') calc.append('/');
    else if (e.key === '(') calc.append('(');
    else if (e.key === ')') calc.append(')');
    else if (e.key === 'Enter' || e.key === '=') calc.calculate();
    else if (e.key === 'Backspace') calc.backspace();
    else if (e.key === 'Escape') calc.clear();
});
