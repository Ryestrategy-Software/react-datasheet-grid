import React, { useMemo } from 'react'
import cx from 'classnames'
import { SelectionContextType } from '../types'

const buildSquare = (
  top: number | string,
  right: number | string,
  bottom: number | string,
  left: number | string
) => {
  return [
    [left, top],
    [right, top],
    [right, bottom],
    [left, bottom],
    [left, top],
  ]
}

const buildClipPath = (
  top: number,
  right: number,
  bottom: number,
  left: number
) => {
  const values = [
    ...buildSquare(0, '100%', '100%', 0),
    ...buildSquare(top, right, bottom, left),
  ]

  return `polygon(evenodd, ${values
    .map((pair) =>
      pair
        .map((value) =>
          typeof value === 'number' && value !== 0 ? value + 'px' : value
        )
        .join(' ')
    )
    .join(',')})`
}

export const SelectionRect = React.memo<SelectionContextType>(
  ({
    columnWidths,
    columnRights,
    headerRowHeight,
    selection,
    rowHeight,
    activeCell,
    hasStickyRightColumn,
    dataLength,
    viewWidth,
    viewHeight,
    contentWidth,
    edges,
    isCellDisabled,
    editing,
    expandSelection,
    stickyFirstColumn = false,
    scrollLeft = 0,
  }) => {
    const activeCellIsDisabled = activeCell ? isCellDisabled(activeCell) : false

    const selectionIsDisabled = useMemo(() => {
      if (!selection) {
        return activeCellIsDisabled
      }

      for (let col = selection.min.col; col <= selection.max.col; ++col) {
        for (let row = selection.min.row; row <= selection.max.row; ++row) {
          if (!isCellDisabled({ col, row })) {
            return false
          }
        }
      }

      return true
    }, [activeCellIsDisabled, isCellDisabled, selection])

    if (!columnWidths || !columnRights) {
      return null
    }

    const extraPixelV = (rowI: number): number => {
      return rowI < dataLength - 1 ? 1 : 0
    }

    const extraPixelH = (colI: number): number => {
      return colI < columnWidths.length - (hasStickyRightColumn ? 3 : 2) ? 1 : 0
    }

    const frozenWidth =
      columnWidths[0] + (stickyFirstColumn ? columnWidths[1] || 0 : 0)
    const horizontalRect = (min: number, max: number) => {
      const pinned = stickyFirstColumn && min === 0
      const left = columnRights[min] + (pinned ? scrollLeft : 0)
      const right =
        columnRights[max] +
        columnWidths[max + 1] +
        (stickyFirstColumn && max === 0 ? scrollLeft : 0)
      return {
        left,
        width:
          Math.max(pinned ? columnWidths[1] : 0, right - left) +
          extraPixelH(max),
        ...(pinned ? { zIndex: 31, transition: 'none' } : {}),
      }
    }
    const pinToFirstColumn = (
      element: React.ReactElement<{ style: React.CSSProperties }>,
      col: number
    ) => {
      if (!stickyFirstColumn || col !== 0) return element
      return (
        <div
          className="dsg-frozen-overlay-container"
          style={{
            width: contentWidth || '100%',
            height:
              rowHeight(dataLength - 1).top +
              rowHeight(dataLength - 1).height +
              headerRowHeight,
          }}
        >
          <div className="dsg-frozen-overlay">
            {React.cloneElement(element, {
              style: {
                ...element.props.style,
                left:
                  (element.props.style.left as number) -
                  columnWidths[0] -
                  scrollLeft,
                transition: 'none',
              },
            })}
          </div>
        </div>
      )
    }

    const activeCellRect = activeCell && {
      ...horizontalRect(activeCell.col, activeCell.col),
      height: rowHeight(activeCell.row).height + extraPixelV(activeCell.row),
      top: rowHeight(activeCell.row).top + headerRowHeight,
    }

    const selectionRect = selection && {
      ...horizontalRect(selection.min.col, selection.max.col),
      height:
        rowHeight(selection.max.row).top +
        rowHeight(selection.max.row).height -
        rowHeight(selection.min.row).top +
        extraPixelV(selection.max.row),
      top: rowHeight(selection.min.row).top + headerRowHeight,
    }

    const minSelection = selection?.min || activeCell
    const maxSelection = selection?.max || activeCell

    const expandRowsIndicator = maxSelection &&
      expandSelection !== null && {
        left:
          columnRights[maxSelection.col] +
          columnWidths[maxSelection.col + 1] +
          (stickyFirstColumn && maxSelection.col === 0 ? scrollLeft : 0),
        ...(stickyFirstColumn && maxSelection.col === 0 ? { zIndex: 32 } : {}),
        top:
          rowHeight(maxSelection.row).top +
          rowHeight(maxSelection.row).height +
          headerRowHeight,
        transform: `translate(-${
          maxSelection.col <
          columnWidths.length - (hasStickyRightColumn ? 3 : 2)
            ? 50
            : 100
        }%, -${maxSelection.row < dataLength - 1 ? 50 : 100}%)`,
      }

    const expandRowsRect = minSelection &&
      maxSelection &&
      expandSelection !== null && {
        ...horizontalRect(minSelection.col, maxSelection.col),
        height:
          rowHeight(maxSelection.row + expandSelection).top +
          rowHeight(maxSelection.row + expandSelection).height -
          rowHeight(maxSelection.row + 1).top +
          extraPixelV(maxSelection.row + expandSelection) -
          1,
        top:
          rowHeight(maxSelection.row).top +
          rowHeight(maxSelection.row).height +
          headerRowHeight +
          1,
      }

    return (
      <>
        <div
          className="dsg-scrollable-view-container"
          style={{
            height:
              rowHeight(dataLength - 1).top +
              rowHeight(dataLength - 1).height +
              headerRowHeight,
            width: contentWidth ? contentWidth : '100%',
          }}
        >
          <div
            className={cx({
              'dsg-scrollable-view': true,
              'dsg-scrollable-view-t': !edges.top,
              'dsg-scrollable-view-r': !edges.right,
              'dsg-scrollable-view-b': !edges.bottom,
              'dsg-scrollable-view-l': !edges.left,
            })}
            style={{
              top: headerRowHeight,
              left: frozenWidth,
              height: viewHeight ? viewHeight - headerRowHeight : 0,
              width:
                contentWidth && viewWidth
                  ? viewWidth -
                    frozenWidth -
                    (hasStickyRightColumn
                      ? columnWidths[columnWidths.length - 1]
                      : 0)
                  : `calc(100% - ${
                      frozenWidth +
                      (hasStickyRightColumn
                        ? columnWidths[columnWidths.length - 1]
                        : 0)
                    }px)`,
            }}
          />
        </div>
        {(selectionRect || activeCellRect) &&
          pinToFirstColumn(
          <div
            className="dsg-selection-col-marker-container"
            style={{
                zIndex:
                  stickyFirstColumn && minSelection?.col === 0 ? 31 : undefined,
              left: selectionRect?.left ?? activeCellRect?.left,
              width: selectionRect?.width ?? activeCellRect?.width,
              height:
                rowHeight(dataLength - 1).top +
                rowHeight(dataLength - 1).height +
                headerRowHeight,
            }}
          >
            <div
              className={cx(
                'dsg-selection-col-marker',
                selectionIsDisabled && 'dsg-selection-col-marker-disabled'
              )}
              style={{ top: headerRowHeight }}
            />
            </div>,
            minSelection!.col
        )}
        {(selectionRect || activeCellRect) && (
          <div
            className="dsg-selection-row-marker-container"
            style={{
              top: selectionRect?.top ?? activeCellRect?.top,
              height: selectionRect?.height ?? activeCellRect?.height,
              width: contentWidth ? contentWidth : '100%',
            }}
          >
            <div
              className={cx(
                'dsg-selection-row-marker',
                selectionIsDisabled && 'dsg-selection-row-marker-disabled'
              )}
              style={{ left: columnWidths[0] }}
            />
          </div>
        )}
        {activeCellRect &&
          activeCell &&
          pinToFirstColumn(
          <div
            className={cx('dsg-active-cell', {
              'dsg-active-cell-focus': editing,
              'dsg-active-cell-disabled': activeCellIsDisabled,
            })}
            style={activeCellRect}
            />,
            activeCell.col
        )}
        {selectionRect &&
          activeCellRect &&
          pinToFirstColumn(
          <div
            className={cx(
              'dsg-selection-rect',
              selectionIsDisabled && 'dsg-selection-rect-disabled'
            )}
            style={{
              ...selectionRect,
              clipPath: buildClipPath(
                activeCellRect.top - selectionRect.top,
                activeCellRect.left - selectionRect.left,
                  activeCellRect.top +
                    activeCellRect.height -
                    selectionRect.top,
                  activeCellRect.left +
                    activeCellRect.width -
                    selectionRect.left
              ),
            }}
            />,
            selection!.min.col
        )}
        {expandRowsRect &&
          pinToFirstColumn(
            <div
              className={cx('dsg-expand-rows-rect')}
              style={expandRowsRect}
            />,
            minSelection!.col
        )}
        {expandRowsIndicator &&
          pinToFirstColumn(
          <div
            className={cx(
              'dsg-expand-rows-indicator',
              selectionIsDisabled && 'dsg-expand-rows-indicator-disabled'
            )}
            style={expandRowsIndicator}
            />,
            maxSelection!.col
        )}
      </>
    )
  }
)

SelectionRect.displayName = 'SelectionRect'
