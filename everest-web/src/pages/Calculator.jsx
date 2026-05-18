import { useState } from 'react'
import '../styles/Calculator.css'

const Calculator = () => {
  const [display, setDisplay] = useState('0')
  const [expression, setExpression] = useState('')
  const [previousValue, setPreviousValue] = useState(null)
  const [operation, setOperation] = useState(null)
  const [waitingForOperand, setWaitingForOperand] = useState(false)

  const handleNumber = (num) => {
    if (waitingForOperand) {
      setDisplay(String(num))
      setWaitingForOperand(false)
    } else {
      setDisplay(display === '0' ? String(num) : display + num)
    }
  }

  const handleDecimal = () => {
    if (waitingForOperand) {
      setDisplay('0.')
      setWaitingForOperand(false)
    } else if (!display.includes('.')) {
      setDisplay(display + '.')
    }
  }

  const handleOperation = (op) => {
    const inputValue = parseFloat(display)

    if (previousValue === null) {
      setPreviousValue(inputValue)
    } else if (operation) {
      const result = calculate(previousValue, inputValue, operation)
      setDisplay(String(result))
      setPreviousValue(result)
    }

    setWaitingForOperand(true)
    setOperation(op)
    setExpression(`${previousValue || inputValue} ${op}`)
  }

  const calculate = (a, b, op) => {
    switch (op) {
      case '+': return a + b
      case '-': return a - b
      case '×': return a * b
      case '÷': return b === 0 ? 'Error' : a / b
      default: return b
    }
  }

  const handleEquals = () => {
    const inputValue = parseFloat(display)

    if (previousValue !== null && operation) {
      const result = calculate(previousValue, inputValue, operation)
      setDisplay(String(result))
      setExpression(`${previousValue} ${operation} ${inputValue} =`)
      setPreviousValue(null)
      setOperation(null)
      setWaitingForOperand(true)
    }
  }

  const handleClear = () => {
    setDisplay('0')
    setExpression('')
    setPreviousValue(null)
    setOperation(null)
    setWaitingForOperand(false)
  }

  const handleToggleSign = () => {
    setDisplay(String(parseFloat(display) * -1))
  }

  const handlePercentage = () => {
    setDisplay(String(parseFloat(display) / 100))
  }

  const buttons = [
    { label: 'C', action: handleClear, className: 'operator' },
    { label: '+/−', action: handleToggleSign, className: 'operator' },
    { label: '%', action: handlePercentage, className: 'operator' },
    { label: '÷', action: () => handleOperation('÷'), className: 'operator' },
    { label: '7', action: () => handleNumber(7), className: 'number' },
    { label: '8', action: () => handleNumber(8), className: 'number' },
    { label: '9', action: () => handleNumber(9), className: 'number' },
    { label: '×', action: () => handleOperation('×'), className: 'operator' },
    { label: '4', action: () => handleNumber(4), className: 'number' },
    { label: '5', action: () => handleNumber(5), className: 'number' },
    { label: '6', action: () => handleNumber(6), className: 'number' },
    { label: '-', action: () => handleOperation('-'), className: 'operator' },
    { label: '1', action: () => handleNumber(1), className: 'number' },
    { label: '2', action: () => handleNumber(2), className: 'number' },
    { label: '3', action: () => handleNumber(3), className: 'number' },
    { label: '+', action: () => handleOperation('+'), className: 'operator' },
    { label: '0', action: () => handleNumber(0), className: 'number zero' },
    { label: '.', action: handleDecimal, className: 'number' },
    { label: '=', action: handleEquals, className: 'equals' }
  ]

  return (
    <div className="calculator-container">
      <h1 className="calculator-title">Calculator</h1>
      <div className="calculator">
        <div className="calculator-display">
          <div className="expression">{expression}</div>
          <div className="display-value">{display}</div>
        </div>
        <div className="calculator-buttons">
          {buttons.map((btn, index) => (
            <button
              key={index}
              className={`calculator-button ${btn.className}`}
              onClick={btn.action}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Calculator
