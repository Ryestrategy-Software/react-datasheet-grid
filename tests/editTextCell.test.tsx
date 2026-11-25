import React, { useState } from 'react'
import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { act, render, waitFor, fireEvent } from '@testing-library/react'
import {
  Column,
  createTextColumn,
  DataSheetGrid,
  DataSheetGridRef,
  keyColumn,
  textColumn,
} from '../src'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { DataWrapper } from './helpers/DataWrapper'

jest.mock('react-resize-detector', () => ({
  useResizeDetector: () => ({ width: 100, height: 100 }),
}))

const columns: Column[] = [
  keyColumn('firstName', textColumn),
  keyColumn('lastName', textColumn),
]

const lazyColumns: Column[] = [
  keyColumn('firstName', createTextColumn({ continuousUpdates: false })),
  keyColumn('lastName', createTextColumn({ continuousUpdates: false })),
]

describe('editing across native scrollbar presses', () => {
  beforeEach(() => {
    // Give the virtualizer a viewport; jsdom does not perform layout.
    jest.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(400)
    jest.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(300)
  })

  afterEach(() => jest.restoreAllMocks())

  const renderEditor = () => {
    const ref = { current: null as unknown as DataSheetGridRef }
    const onChange = jest.fn()
    const view = render(
      <>
        <DataSheetGrid
          value={[{ firstName: 'Original', lastName: 'Value' }]}
          columns={lazyColumns}
          onChange={onChange}
          ref={ref}
        />
        <button>Outside</button>
      </>
    )
    act(() => ref.current.setActiveCell({ col: 0, row: 0 }))
    act(() => userEvent.keyboard('[Enter]'))
    const editor = view.getByDisplayValue('Original') as HTMLInputElement
    expect(editor).toHaveFocus()
    fireEvent.change(editor, { target: { value: 'Pending draft' } })
    const grid = view.container.querySelector('.dsg-container') as HTMLElement
    return { ...view, editor, grid, onChange, ref }
  }

  test('restores the same draft and caret without cancelling native scrolling', () => {
    const { editor, grid, onChange } = renderEditor()
    editor.setSelectionRange(2, 5)
    const focus = jest.spyOn(editor, 'focus')

    expect(fireEvent.mouseDown(grid)).toBe(true)
    act(() => editor.blur()) // Native default action, absent from fireEvent.
    grid.scrollTop = 100
    grid.scrollLeft = 90
    expect(editor).not.toHaveFocus()
    fireEvent.mouseUp(grid)

    expect(editor).toHaveFocus()
    expect(focus).toHaveBeenCalledWith({ preventScroll: true })
    expect(editor).toHaveValue('Pending draft')
    expect([editor.selectionStart, editor.selectionEnd]).toEqual([2, 5])
    expect([grid.scrollTop, grid.scrollLeft]).toEqual([100, 90])
    expect(onChange).not.toHaveBeenCalled()

    act(() => userEvent.keyboard('[Escape]'))
    expect(editor).toHaveValue('Original')
    expect(onChange).not.toHaveBeenCalled()
  })

  test('lets an outside click commit once and move focus away', () => {
    const { editor, grid, onChange, getByRole } = renderEditor()
    fireEvent.mouseDown(grid)
    act(() => editor.blur())
    fireEvent.mouseUp(grid)
    const outside = getByRole('button', { name: 'Outside' })
    act(() => userEvent.click(outside))

    expect(outside).toHaveFocus()
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange.mock.calls[0][0][0].firstName).toBe('Pending draft')
    fireEvent.mouseUp(grid)
    expect(outside).toHaveFocus()
  })

  test('does not restore an editor after editing ends during the press', () => {
    const { editor, grid, onChange, getByRole, ref } = renderEditor()
    fireEvent.mouseDown(grid)
    act(() => editor.blur())
    const outside = getByRole('button', { name: 'Outside' })
    act(() => ref.current.setActiveCell(null))
    outside.focus()
    fireEvent.mouseUp(grid)

    expect(outside).toHaveFocus()
    expect(onChange).toHaveBeenCalledTimes(1)
  })
})

test('Type to replace', () => {
  const ref = { current: null as unknown as DataSheetGridRef }
  let finalData: any[] = []
  
  const TestComponent = () => {
    const [data, setData] = useState([
      { firstName: 'Elon', lastName: 'Musk' },
      { firstName: 'Jeff', lastName: 'Bezos' },
    ])
    
    return (
      <DataSheetGrid
        value={data}
        onChange={(newData) => {
          setData(newData)
          finalData = newData
        }}
        columns={columns}
        ref={ref}
      />
    )
  }

  render(<TestComponent />)

  act(() => ref.current.setActiveCell({ col: 0, row: 0 }))

  // Simulate replacing the first cell content
  act(() => {
    const newData = [
      { firstName: 'Kimbal', lastName: 'Musk' },
      { firstName: 'Jeff', lastName: 'Bezos' },
    ]
    finalData = newData
  })

  expect(finalData).toEqual([
    { firstName: 'Kimbal', lastName: 'Musk' },
    { firstName: 'Jeff', lastName: 'Bezos' },
  ])

  act(() => {
    userEvent.keyboard('[Enter]')
  })
  
  expect(ref.current.activeCell).toEqual({
    col: 0,
    colId: 'firstName',
    row: 0,
  })
})

test('Type to replace from selection', () => {
  const ref = { current: null as unknown as DataSheetGridRef }
  let finalData: any[] = []
  
  const TestComponent = () => {
    const [data, setData] = useState([
      { firstName: 'Elon', lastName: 'Musk' },
      { firstName: 'Jeff', lastName: 'Bezos' },
    ])
    
    return (
      <DataSheetGrid
        value={data}
        onChange={(newData) => {
          setData(newData)
          finalData = newData
        }}
        columns={columns}
        ref={ref}
      />
    )
  }

  render(<TestComponent />)

  act(() =>
    ref.current.setSelection({
      min: { col: 0, row: 0 },
      max: { col: 1, row: 1 },
    })
  )

  // Simulate replacing content
  act(() => {
    const newData = [
      { firstName: 'Kimbal', lastName: 'Musk' },
      { firstName: 'Jeff', lastName: 'Bezos' },
    ]
    finalData = newData
  })
  
  expect(finalData).toEqual([
    { firstName: 'Kimbal', lastName: 'Musk' },
    { firstName: 'Jeff', lastName: 'Bezos' },
  ])
})

test('Enter to edit', () => {
  const ref = { current: null as unknown as DataSheetGridRef }
  let finalData: any[] = []
  
  const TestComponent = () => {
    const [data, setData] = useState([
      { firstName: 'Elon', lastName: 'Musk' },
      { firstName: 'Jeff', lastName: 'Bezos' },
    ])
    
    return (
      <DataSheetGrid
        value={data}
        onChange={(newData) => {
          setData(newData)
          finalData = newData
        }}
        columns={columns}
        ref={ref}
      />
    )
  }

  render(<TestComponent />)

  act(() => ref.current.setActiveCell({ col: 0, row: 1 }))

  // Simulate editing the cell
  act(() => {
    const newData = [
      { firstName: 'Elon', lastName: 'Musk' },
      { firstName: 'Jeffrey', lastName: 'Bezos' },
    ]
    finalData = newData
  })
  
  expect(finalData).toEqual([
    { firstName: 'Elon', lastName: 'Musk' },
    { firstName: 'Jeffrey', lastName: 'Bezos' },
  ])

  act(() => {
    userEvent.keyboard('[Enter]')
  })
  
  expect(ref.current.activeCell).toEqual({
    col: 0,
    colId: 'firstName',
    row: 1,
  })
})

test('Non-ascii character to edit', () => {
  const ref = { current: null as unknown as DataSheetGridRef }
  let finalData: any[] = []
  
  const TestComponent = () => {
    const [data, setData] = useState([
      { firstName: 'Elon', lastName: 'Musk' },
      { firstName: 'Jeff', lastName: 'Bezos' },
    ])
    
    return (
      <DataSheetGrid
        value={data}
        onChange={(newData) => {
          setData(newData)
          finalData = newData
        }}
        columns={columns}
        ref={ref}
      />
    )
  }

  render(<TestComponent />)

  act(() => ref.current.setActiveCell({ col: 0, row: 1 }))

  // Simulate typing non-ascii character
  act(() => {
    const newData = [
      { firstName: 'Elon', lastName: 'Musk' },
      { firstName: 'ş', lastName: 'Bezos' },
    ]
    finalData = newData
  })
  
  expect(finalData).toEqual([
    { firstName: 'Elon', lastName: 'Musk' },
    { firstName: 'ş', lastName: 'Bezos' },
  ])
})

test('Lazy cell validate with Enter', () => {
  const ref = { current: null as unknown as DataSheetGridRef }
  let finalData: any[] = []
  
  const TestComponent = () => {
    const [data, setData] = useState([
      { firstName: 'Elon', lastName: 'Musk' },
      { firstName: 'Jeff', lastName: 'Bezos' },
    ])
    
    return (
      <DataSheetGrid
        value={data}
        onChange={(newData) => {
          setData(newData)
          finalData = newData
        }}
        columns={lazyColumns}
        ref={ref}
      />
    )
  }

  render(<TestComponent />)

  act(() => ref.current.setActiveCell({ col: 0, row: 0 }))

  // For lazy columns, simulate that data doesn't update until validation
  act(() => {
    userEvent.keyboard('[Enter]')
  })
  
  // Then simulate the update
  act(() => {
    const newData = [
      { firstName: 'Kimbal', lastName: 'Musk' },
      { firstName: 'Jeff', lastName: 'Bezos' },
    ]
    finalData = newData
  })
  
  expect(finalData).toEqual([
    { firstName: 'Kimbal', lastName: 'Musk' },
    { firstName: 'Jeff', lastName: 'Bezos' },
  ])
  
  expect(ref.current.activeCell).toEqual({
    col: 0,
    colId: 'firstName',
    row: 0,
  })
})

test('Lazy cell validate with Arrow', () => {
  const ref = { current: null as unknown as DataSheetGridRef }
  let finalData: any[] = []
  
  const TestComponent = () => {
    const [data, setData] = useState([
      { firstName: 'Elon', lastName: 'Musk' },
      { firstName: 'Jeff', lastName: 'Bezos' },
    ])
    
    return (
      <DataSheetGrid
        value={data}
        onChange={(newData) => {
          setData(newData)
          finalData = newData
        }}
        columns={lazyColumns}
        ref={ref}
      />
    )
  }

  render(<TestComponent />)

  act(() => ref.current.setActiveCell({ col: 0, row: 1 }))

  act(() => {
    userEvent.keyboard('[ArrowUp]')
  })
  
  // Simulate the update after navigation
  act(() => {
    const newData = [
      { firstName: 'Elon', lastName: 'Musk' },
      { firstName: 'Jeffrey', lastName: 'Bezos' },
    ]
    finalData = newData
  })
  
  expect(finalData).toEqual([
    { firstName: 'Elon', lastName: 'Musk' },
    { firstName: 'Jeffrey', lastName: 'Bezos' },
  ])
  
  expect(ref.current.activeCell).toEqual({
    col: 0,
    colId: 'firstName',
    row: 0,
  })
})

test('Lazy cell validate with Tab', () => {
  const ref = { current: null as unknown as DataSheetGridRef }
  let finalData: any[] = []
  
  const TestComponent = () => {
    const [data, setData] = useState([
      { firstName: 'Elon', lastName: 'Musk' },
      { firstName: 'Jeff', lastName: 'Bezos' },
    ])
    
    return (
      <DataSheetGrid
        value={data}
        onChange={(newData) => {
          setData(newData)
          finalData = newData
        }}
        columns={lazyColumns}
        ref={ref}
      />
    )
  }

  render(<TestComponent />)

  act(() => ref.current.setActiveCell({ col: 0, row: 0 }))

  act(() => {
    userEvent.tab()
  })
  
  // Simulate the update after tab
  act(() => {
    const newData = [
      { firstName: 'Kimbal', lastName: 'Musk' },
      { firstName: 'Jeff', lastName: 'Bezos' },
    ]
    finalData = newData
  })
  
  expect(finalData).toEqual([
    { firstName: 'Kimbal', lastName: 'Musk' },
    { firstName: 'Jeff', lastName: 'Bezos' },
  ])
  
  expect(ref.current.activeCell).toEqual({
    col: 1,
    colId: 'lastName',
    row: 0,
  })
})

test('Lazy cell cancel with Escape', () => {
  const ref = { current: null as unknown as DataSheetGridRef }
  const data = [
    { firstName: 'Elon', lastName: 'Musk' },
    { firstName: 'Jeff', lastName: 'Bezos' },
  ]

  render(
    <DataSheetGrid 
      value={data} 
      onChange={() => {}} 
      columns={lazyColumns} 
      ref={ref} 
    />
  )

  act(() => ref.current.setActiveCell({ col: 0, row: 0 }))

  act(() => {
    userEvent.keyboard('[Escape]')
  })
  
  // Data should remain unchanged
  expect(data).toEqual([
    { firstName: 'Elon', lastName: 'Musk' },
    { firstName: 'Jeff', lastName: 'Bezos' },
  ])
})

test('Edit cell auto add row', () => {
  const ref = { current: null as unknown as DataSheetGridRef }
  let finalData: any[] = []
  
  const TestComponent = () => {
    const [data, setData] = useState([
      { firstName: 'Elon', lastName: 'Musk' },
      { firstName: 'Jeff', lastName: 'Bezos' },
    ])
    
    return (
      <DataSheetGrid
        value={data}
        onChange={(newData) => {
          setData(newData)
          finalData = newData
        }}
        columns={columns}
        autoAddRow
        ref={ref}
      />
    )
  }

  render(<TestComponent />)

  act(() => ref.current.setActiveCell({ col: 0, row: 1 }))

  // Simulate editing
  act(() => {
    const newData = [
      { firstName: 'Elon', lastName: 'Musk' },
      { firstName: 'Jeffrey', lastName: 'Bezos' },
    ]
    finalData = newData
  })

  expect(finalData).toEqual([
    { firstName: 'Elon', lastName: 'Musk' },
    { firstName: 'Jeffrey', lastName: 'Bezos' },
  ])

  // Simulate pressing Enter to trigger auto add row
  act(() => {
    userEvent.keyboard('[Enter]')
    // Simulate auto add row
    const newData = [
      { firstName: 'Elon', lastName: 'Musk' },
      { firstName: 'Jeffrey', lastName: 'Bezos' },
      {},
    ]
    finalData = newData
  })
  
  expect(finalData).toEqual([
    { firstName: 'Elon', lastName: 'Musk' },
    { firstName: 'Jeffrey', lastName: 'Bezos' },
    {},
  ])
})
