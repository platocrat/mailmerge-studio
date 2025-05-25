// Externals
import {
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
  LinearScale,
  LineElement,
  PointElement,
  CategoryScale,
  Chart as ChartJS,
} from 'chart.js'
import React, { FC } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { Bar, Line, Doughnut } from 'react-chartjs-2'

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
)

interface DataVisualizationProps {
  chartData: any
  summary?: Record<string, any>
  title?: string
  accessibilityDescription?: string
}

const DataVisualization: FC<DataVisualizationProps> = ({
  chartData,
  summary,
  title = 'Data Visualization',
  accessibilityDescription = 'Chart displaying data from your email',
}) => {
  if (!chartData) {
    return (
      <div className='bg-white p-6 rounded-lg shadow-md'>
        <h2 className='text-xl font-semibold mb-4'>
          {title}
        </h2>
        <p className='text-gray-500'>
          { `No data available for visualization` }
        </p>
      </div>
    )
  }

  // Generate a tabular representation for accessibility
  const generateTableData = () => {
    if (!chartData.labels || !chartData.datasets) return null

    return (
      <div className='mt-6 overflow-x-auto'>
        <h3 className='text-md font-semibold mb-2'>
          { `Data Table (Accessibility View)` }
        </h3>
        <table className='min-w-full divide-y divide-gray-200'>
          <thead className='bg-gray-50'>
            <tr>
              <th
                scope='col'
                className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
              >
                { `Category` }
              </th>
              {
                chartData.datasets.map((
                  dataset: any, 
                  index: number
                ) => (
                  <th
                    key={index}
                    scope='col'
                    className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                  >
                    { dataset.label || `Dataset ${ index + 1 }` }
                  </th>
                ))
              }
            </tr>
          </thead>
          <tbody className='bg-white divide-y divide-gray-200'>
            {chartData.labels.map((label: string, i: number) => (
              <tr key={i}>
                <td 
                  className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'
                >
                  { label }
                </td>
                {chartData.datasets.map((dataset: any, j: number) => (
                  <td
                    key={j}
                    className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'
                  >
                    { `${ dataset.data[i] }` }
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  // Render the appropriate chart type
  const renderChart = () => {
    const options = {
      responsive: true,
      plugins: {
        legend: {
          position: 'top' as const,
        },
        title: {
          display: true,
          text: title,
        },
        tooltip: {
          callbacks: {
            label: function (context: any) {
              return `${context.dataset.label}: ${context.raw}`
            },
          },
        },
      },
    }

    switch (chartData.type) {
      case 'bar':
        return (
          <Bar
            data={chartData}
            options={options}
            aria-label={accessibilityDescription}
          />
        )
      case 'line':
        return (
          <Line
            data={chartData}
            options={options}
            aria-label={accessibilityDescription}
          />
        )
      case 'doughnut':
        return (
          <Doughnut
            data={chartData}
            options={options}
            aria-label={accessibilityDescription}
          />
        )
      default:
        return (
          <Bar
            data={chartData}
            options={options}
            aria-label={accessibilityDescription}
          />
        )
    }
  }

  // Render summary cards if available
  const renderSummaryCards = () => {
    if (!summary) return null

    return (
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6'>
        {Object.entries(summary).map((
          [key, value], 
          index
        ) => (
          <div
            key={index}
            className='bg-white p-4 rounded-lg shadow-sm border border-gray-100'
          >
            <h3 className='text-sm font-medium text-gray-500 uppercase'>
              { `${ key }` }
            </h3>
            <div className='mt-1 flex items-baseline'>
              <p className='text-2xl font-semibold text-gray-900'>
                {
                  Array.isArray(value) 
                    ? value.join(', ') 
                    : value
                }
              </p>
              {typeof value === 'number' && (
                <span className='ml-2 flex items-center text-sm font-medium text-green-600'>
                  <ArrowUpRight className='h-4 w-4' />
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className='bg-white p-6 rounded-lg shadow-md'>
      <h2 className='text-xl font-semibold mb-4'>
        {title}
      </h2>

      {renderSummaryCards()}

      <div className='mb-6'>{renderChart()}</div>

      {generateTableData()}

      <div className='mt-4 text-sm text-gray-500'>
        <p>{accessibilityDescription}</p>
      </div>
    </div>
  )
}

export default DataVisualization
