import { describe, expect, it } from 'vitest'
import { BigIntDecimal } from '../src/MiniDecimal'

describe('multiple', () => {
  it('both decimal', () => {
    const num = new BigIntDecimal('1.1').multi('1.1')

    expect(num.toString()).toEqual('1.21')
  })

  it('int & decimal', () => {
    const num = new BigIntDecimal('111').multi('0.2')

    expect(num.toString()).toEqual('22.2')
  })

  it('small decimal', () => {
    const num = new BigIntDecimal('0.03').multi('0.04')

    expect(num.toString()).toEqual('0.0012')
  })
})
