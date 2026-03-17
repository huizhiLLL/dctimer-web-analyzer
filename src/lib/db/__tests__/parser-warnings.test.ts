import { describe, expect, it } from 'vitest'
import { checkDctimerSchema } from '../schema-inspector'
import { decodePuzzleType } from '../puzzle-type'

describe('parser warnings helpers', () => {
  it('marks unrelated schemas as non-dctimer', () => {
    const result = checkDctimerSchema({
      tableNames: ['users', 'posts'],
      tables: [],
    })

    expect(result.hasSessionTable).toBe(false)
    expect(result.isLikelyDctimer).toBe(false)
  })

  it('returns unknown display names for unknown puzzle codes', () => {
    const result = decodePuzzleType(9999)

    expect(result?.categoryName).toBeNull()
    expect(result?.displayName).toContain('未知项目')
  })
})
