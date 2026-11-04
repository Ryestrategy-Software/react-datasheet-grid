import { renderHook } from '@testing-library/react'
import { Column } from '../types'
import { useColumnWidths } from './useColumnWidths'

const columns = [40, 350, 500].map((width) => ({
  basis: width,
  minWidth: width,
  maxWidth: width,
  grow: 0,
  shrink: 0,
})) as Column<unknown, unknown, string>[]

test('leaves room to edit scrollable columns and restores widths when unfrozen', () => {
  const { result, rerender } = renderHook(
    ({ frozen, width }) => useColumnWidths(columns, width, frozen),
    { initialProps: { frozen: false, width: 400 } }
  )
  expect(result.current.columnWidths).toEqual([40, 350, 500])
  rerender({ frozen: true, width: 400 })
  expect(result.current.columnWidths).toEqual([40, 180, 500])
  rerender({ frozen: true, width: 900 })
  expect(result.current.columnWidths).toEqual([40, 350, 500])
  rerender({ frozen: false, width: 400 })
  expect(result.current.columnWidths).toEqual([40, 350, 500])
})

test('never assigns a negative frozen width when the gutter fills the viewport', () => {
  const { result } = renderHook(() => useColumnWidths(columns, 20, true))
  expect(result.current.columnWidths).toEqual([40, 0, 500])
})
