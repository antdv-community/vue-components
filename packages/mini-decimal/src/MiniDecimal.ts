import type { DecimalClass, ValueType } from './interface'
import BigIntDecimal from './BigIntDecimal'
import NumberDecimal from './NumberDecimal'
import { trimNumber } from './numberUtil'
import { supportBigInt } from './supportUtil'

// Still support origin export
export { BigIntDecimal, NumberDecimal }

export type { DecimalClass, ValueType }

export default function getMiniDecimal(value: ValueType): DecimalClass {
  // We use BigInt here.
  // Will fallback to Number if not support.
  if (supportBigInt()) {
    return new BigIntDecimal(value)
  }
  return new NumberDecimal(value)
}

/**
 * Align the logic of toFixed to around like 1.5 => 2.
 * If set `cutOnly`, will just remove the over decimal part.
 */
export function toFixed(
  numStr: string,
  separatorStr: string,
  precision?: number,
  cutOnly = false,
) {
  if (numStr === '') {
    return ''
  }
  const { negativeStr, integerStr, decimalStr } = trimNumber(numStr)
  const precisionDecimalStr = `${separatorStr}${decimalStr}`

  const numberWithoutDecimal = `${negativeStr}${integerStr}`

  if (typeof precision === 'number' && precision >= 0) {
    // We will get last + 1 number to check if need advanced number
    const advancedNum = Number(decimalStr[precision])

    if (advancedNum >= 5 && !cutOnly) {
      const advancedDecimal = getMiniDecimal(numStr).add(
        `${negativeStr}0.${'0'.repeat(precision)}${10 - advancedNum}`,
      )
      return toFixed(
        advancedDecimal.toString(),
        separatorStr,
        precision,
        cutOnly,
      )
    }

    if (precision === 0) {
      return numberWithoutDecimal
    }

    return `${numberWithoutDecimal}${separatorStr}${decimalStr
      .padEnd(precision, '0')
      .slice(0, precision)}`
  }

  if (precisionDecimalStr === '.0') {
    return numberWithoutDecimal
  }

  return `${numberWithoutDecimal}${precisionDecimalStr}`
}
