import { DataSheetGridProps } from '../types'
import { useMemo } from 'react'

type RowSize = { height: number; top: number }

export const useRowHeights = <T extends any>({
  value,
  rowHeight,
}: Required<Pick<DataSheetGridProps<T>, 'value' | 'rowHeight'>>) => {
  return useMemo(() => {
    const calculatedHeights: RowSize[] = []
    const getRowIndex = (top: number): number => {
      if (top < 0 || !value.length) return -1
      if (typeof rowHeight === 'number') {
        return Math.min(
          value.length - 1,
          Math.max(-1, Math.floor(top / rowHeight))
        )
      }

      let l = 0
      let r = calculatedHeights.length - 1

      while (l <= r) {
        const m = Math.floor((l + r) / 2)

        if (calculatedHeights[m].top < top) {
          l = m + 1
        } else if (calculatedHeights[m].top > top) {
          r = m - 1
        } else {
          return m
        }
      }

      if (
        r === calculatedHeights.length - 1 &&
        value.length > calculatedHeights.length &&
        (!calculatedHeights.length ||
          top >= calculatedHeights[r].top + calculatedHeights[r].height)
      ) {
        let lastBottom =
          r === -1 ? 0 : calculatedHeights[r].top + calculatedHeights[r].height

        do {
          r++
          const height = rowHeight({ rowIndex: r, rowData: value[r] })
          calculatedHeights.push({
            height,
            top: lastBottom,
          })
          lastBottom += height
        } while (lastBottom <= top && r < value.length - 1)
      }

      return r
    }

    return {
      getRowSize: (index: number): RowSize => {
        if (typeof rowHeight === 'number') {
          return { height: rowHeight, top: rowHeight * index }
        }

        if (index < 0 || index >= value.length) {
          return { height: 0, top: 0 }
        }

        if (index < calculatedHeights.length) {
          return calculatedHeights[index]
        }

        const last = calculatedHeights[calculatedHeights.length - 1]
        let lastBottom = last ? last.top + last.height : 0

        for (let i = calculatedHeights.length; i <= index; i++) {
          const height = rowHeight({ rowIndex: i, rowData: value[i] })

          calculatedHeights.push({ height, top: lastBottom })
          lastBottom += height
        }

        return calculatedHeights[index]
      },
      getRowIndex,
      totalSize: (maxHeight: number) => {
        if (!value.length) return 0
        if (typeof rowHeight === 'number') {
          return value.length * rowHeight
        }

        const index = getRowIndex(maxHeight)

        return calculatedHeights[index].top + calculatedHeights[index].height
      },
    }
  }, [rowHeight, value])
}
