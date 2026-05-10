interface DiceOperation {
  dicePattern: string // e.g., "1d20"
  sign: number // 1 for positive, -1 for negative
}

interface ParsedExpression {
  diceOperations: DiceOperation[]
  staticModifier: number
}

// Parse the full expression with signs and static modifiers
function parseDiceExpression(expression: string): ParsedExpression {
  // Remove all whitespace
  const cleaned = expression.replaceAll(/\s+/g, '')

  // Find all dice patterns with their signs
  const dicePattern = /([+-]?)(\d{1,4}d\d{1,4})/g
  const diceOperations: DiceOperation[] = []

  let match
  while ((match = dicePattern.exec(cleaned)) !== null) {
    const [, sign, dicePattern] = match
    diceOperations.push({
      dicePattern,
      sign: sign === '-' ? -1 : 1,
    })
  }

  // Remove dice patterns and find static modifiers
  const withoutDice = cleaned.replaceAll(/([+-]?)(\d{1,4}d\d{1,4})/g, '')

  // Find all remaining numbers with their signs
  const modifierPattern = /([+-]?)(\d+)/g
  let staticModifier = 0

  while ((match = modifierPattern.exec(withoutDice)) !== null) {
    const [, sign, number] = match
    const value = Number.parseInt(number, 10)
    staticModifier += sign === '-' ? -value : value
  }

  return { diceOperations, staticModifier }
}

// Calculate final result and build expression with results
function calculateWithExpression(
  originalExpression: string,
  diceResults: number[], // Results from your dice rolling function, in same order as patterns
  diceOperations: DiceOperation[],
  staticModifier: number,
): [number, string] {
  let total = staticModifier

  for (const [index, result] of diceResults.entries()) {
    const operation = diceOperations[index]
    total += result * operation.sign
  }

  // Build the expression with results
  let resultExpression = originalExpression

  // Replace each dice pattern with pattern(result)
  for (const [index, operation] of diceOperations.entries()) {
    const result = diceResults[index]
    const pattern = operation.dicePattern
    const replacement = `${pattern}(${result})`

    // Find and replace the first occurrence of this exact pattern
    resultExpression = resultExpression.replace(
      new RegExp(String.raw`\b${pattern}\b`),
      replacement,
    )
  }

  return [total, resultExpression]
}

// Complete workflow function
export function processDiceExpression(expression: string) {
  const parsed = parseDiceExpression(expression)
  const dicePatterns = parsed.diceOperations.map(op => op.dicePattern)

  return {
    dicePatterns, // Pass this to your existing dice rolling function
    calculate: (diceResults: number[]): [number, string] =>
      calculateWithExpression(
        expression,
        diceResults,
        parsed.diceOperations,
        parsed.staticModifier,
      ),
  }
}
