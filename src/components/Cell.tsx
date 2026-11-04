import React, { FC } from 'react'
import cx from 'classnames'

export const Cell: FC<{
  gutter: boolean
  stickyRight: boolean
  stickyLeft?: boolean
  disabled?: boolean
  className?: string
  active?: boolean
  children?: any
  width: number
  left: number
}> = ({
  children,
  gutter,
  stickyRight,
  stickyLeft = false,
  active,
  disabled,
  className,
  width,
  left,
}) => {
  // Handler for right-click on gutter (row tag)
  const handleContextMenu = gutter
    ? (e: React.MouseEvent<HTMLDivElement>) => {
        if (gutter) {
          // Custom event for row tag context menu
          if (typeof window !== 'undefined') {
            const customEvent = new CustomEvent('dsg-row-contextmenu', {
              detail: { event: e },
            })
            window.dispatchEvent(customEvent)
          }
        }
      }
    : undefined

  return (
    <div
      className={cx(
        'dsg-cell',
        gutter && 'dsg-cell-gutter',
        disabled && 'dsg-cell-disabled',
        gutter && active && 'dsg-cell-gutter-active',
        stickyRight && 'dsg-cell-sticky-right',
        stickyLeft && 'dsg-cell-sticky-left',
        className
      )}
      style={{
        width,
        left: stickyRight ? undefined : left,
      }}
      onContextMenu={handleContextMenu}
    >
      {children}
    </div>
  )
}
