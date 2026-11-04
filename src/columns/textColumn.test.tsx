import React, { StrictMode } from 'react'
import { render } from '@testing-library/react'
import { createTextColumn } from './textColumn'

test('mounting a deferred editor in Strict Mode does not write untouched data', () => {
  const column = createTextColumn({ continuousUpdates: false })
  const Component = column.component!
  const setRowData = jest.fn()
  render(
    <StrictMode>
      <Component
        rowData="Untouched"
        rowIndex={0}
        columnIndex={0}
        columnData={column.columnData!}
        active={false}
        focus={false}
        disabled={false}
        setRowData={setRowData}
        stopEditing={() => undefined}
        insertRowBelow={() => undefined}
        duplicateRow={() => undefined}
        deleteRow={() => undefined}
        getContextMenuItems={() => []}
      />
    </StrictMode>
  )
  expect(setRowData).not.toHaveBeenCalled()
})
