import type { DecimalClass, ValueType } from './interface'
import { getNumberPrecision, isEmpty, num2str } from './numberUtil'

/**
 * We can remove this when IE not support anymore
 */
export default class NumberDecimal implements DecimalClass {
  origin: string = ''
  number: number = 0
  empty: boolean = false

  constructor(value: ValueType) {
    if (isEmpty(value)) {
      this.empty = true
      return
    }

    this.origin = String(value)
    this.number = Number(value)
  }

  negate() {
    return new NumberDecimal(-this.toNumber())
  }

  add(value: ValueType) {
    if (this.isInvalidate()) {
      return new NumberDecimal(value)
    }

    const target = Number(value)

    if (Number.isNaN(target)) {
      return this
    }

    const number = this.number + target

    // [Legacy] Back to safe integer
    if (number > Number.MAX_SAFE_INTEGER) {
      return new NumberDecimal(Number.MAX_SAFE_INTEGER)
    }

    if (number < Number.MIN_SAFE_INTEGER) {
      return new NumberDecimal(Number.MIN_SAFE_INTEGER)
    }

    const maxPrecision = Math.max(
      getNumberPrecision(this.number),
      getNumberPrecision(target),
    )
    return new NumberDecimal(number.toFixed(maxPrecision))
  }

  multi(value: ValueType) {
    const target = Number(value)

    if (this.isInvalidate() || Number.isNaN(target)) {
      return new NumberDecimal(NaN)
    }

    const number = this.number * target

    // [Legacy] Back to safe integer
    if (number > Number.MAX_SAFE_INTEGER) {
      return new NumberDecimal(Number.MAX_SAFE_INTEGER)
    }

    if (number < Number.MIN_SAFE_INTEGER) {
      return new NumberDecimal(Number.MIN_SAFE_INTEGER)
    }

    const maxPrecision = Math.max(
      getNumberPrecision(this.number),
      getNumberPrecision(target),
    )
    return new NumberDecimal(number.toFixed(maxPrecision))
  }

  isEmpty() {
    return this.empty
  }

  isNaN() {
    return Number.isNaN(this.number)
  }

  isInvalidate() {
    return this.isEmpty() || this.isNaN()
  }

  equals(target: DecimalClass) {
    return this.toNumber() === target?.toNumber()
  }

  lessEquals(target: DecimalClass) {
    return this.add(target.negate().toString()).toNumber() <= 0
  }

  toNumber() {
    return this.number
  }

  toString(safe: boolean = true) {
    if (!safe) {
      return this.origin
    }

    if (this.isInvalidate()) {
      return ''
    }

    return num2str(this.number)
  }
}
