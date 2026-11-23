import { renderHook } from '@testing-library/react'
import { useRowHeights } from './useRowHeights'

const fromSizes = (heights: number[], calculated = heights.length) => {
  const { result } = renderHook(() =>
    useRowHeights({
      value: heights,
      rowHeight: ({ rowData }) => rowData,
    })
  )
  if (calculated) result.current.getRowSize(calculated - 1)
  return result.current
}

describe('getRowIndex', () => {
  test('Right on top', () => {
    const { getRowIndex } = fromSizes([2, 3, 4])

    expect(getRowIndex(0)).toBe(0)
    expect(getRowIndex(2)).toBe(1)
    expect(getRowIndex(5)).toBe(2)
  })

  test('Between tops', () => {
    const { getRowIndex } = fromSizes([2, 3, 4])

    expect(getRowIndex(1)).toBe(0)
    expect(getRowIndex(4)).toBe(1)
  })

  test('Negative', () => {
    const { getRowIndex } = fromSizes([2, 3, 4])

    expect(getRowIndex(-1)).toBe(-1)
    expect(getRowIndex(-100)).toBe(-1)
  })

  test('Beyond', () => {
    const { getRowIndex } = fromSizes([2, 3, 4])

    expect(getRowIndex(6)).toBe(2)
    expect(getRowIndex(100)).toBe(2)
  })

  test('No row calculated right on top', () => {
    const { getRowIndex } = fromSizes([2, 3, 4], 0)

    expect(getRowIndex(0)).toBe(0)
    expect(getRowIndex(2)).toBe(1)
    expect(getRowIndex(5)).toBe(2)
  })
})

test('measures a cold cache and jumps directly beyond the first row', () => {
  const heights = fromSizes([20, 60, 30, 40], 0)
  expect(heights.getRowSize(0)).toEqual({ height: 20, top: 0 })
  expect(heights.getRowIndex(105)).toBe(2)
  expect(heights.getRowSize(3)).toEqual({ height: 40, top: 110 })
  expect(heights.totalSize(1000)).toBe(150)
})

test('handles empty data with a height callback', () => {
  const heights = fromSizes([], 0)
  expect(heights.totalSize(400)).toBe(0)
  expect(heights.getRowIndex(50)).toBe(-1)
  expect(heights.getRowSize(0)).toEqual({ height: 0, top: 0 })
})

test('recalculates offsets when row data or the height callback changes', () => {
  const initial = [20, 30, 40]
  const height = ({ rowData }: { rowData: number }) => rowData
  const { result, rerender } = renderHook(
    ({ value, rowHeight }) => useRowHeights({ value, rowHeight }),
    { initialProps: { value: initial, rowHeight: height } }
  )
  expect(result.current.totalSize(400)).toBe(90)
  rerender({ value: [80, 30, 40], rowHeight: height })
  expect(result.current.getRowSize(1)).toEqual({ height: 30, top: 80 })
  expect(result.current.getRowIndex(79)).toBe(0)
  rerender({ value: initial, rowHeight: () => 50 })
  expect(result.current.getRowSize(2)).toEqual({ height: 50, top: 100 })
  rerender({ value: [10], rowHeight: height })
  expect(result.current.totalSize(400)).toBe(10)
})
