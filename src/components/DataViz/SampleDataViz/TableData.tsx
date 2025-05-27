import React, { FC } from 'react'

interface TableDataProps {
  chartData: {
    labels?: string[]
    datasets?: Array<{
      label?: string
      data: number[]
    }>
  }
}

const TableData: FC<TableDataProps> = ({ chartData }) => {
  if (!chartData.labels || !chartData.datasets) return null

  const datasets = chartData.datasets

  return (
    <div className='mt-6 overflow-x-auto'>
      <h3 className='text-md font-semibold mb-2'>
        {`Data Table (Accessibility View)`}
      </h3>
      <table className='min-w-full divide-y divide-gray-200'>
        <thead className='bg-gray-50'>
          <tr>
            <th
              scope='col'
              className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
            >
              {`Category`}
            </th>
            {datasets.map((dataset, index) => (
              <th
                key={index}
                scope='col'
                className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
              >
                {dataset.label || `Dataset ${index + 1}`}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className='bg-white divide-y divide-gray-200'>
          {chartData.labels.map((label, i) => (
            <tr key={i}>
              <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                {label}
              </td>
              {datasets.map((dataset, j) => (
                <td
                  key={j}
                  className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'
                >
                  {`${dataset.data[i]}`}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default TableData 