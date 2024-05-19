import React from 'react'

export const ColumnFilter = ({ column }) => {
  const { filterValue, setFilter } = column



  //console.log(filterValue)
  return (
    <span>
      Search:{' '}
      <input
        value={filterValue || ''}
        onChange={e => setFilter(e.target.value)}
      />
    </span>
  )
}
