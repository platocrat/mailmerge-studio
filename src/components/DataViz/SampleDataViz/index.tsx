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
import { Bar, Line, Doughnut } from 'react-chartjs-2'
// Locals
import TableData from './TableData'
import SummaryCards from './SummaryCards'


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

// ------------------------------ Component ------------------------------------
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
          {`No data available for visualization`}
        </p>
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

  return (
    <div className='bg-white p-6 rounded-lg shadow-md'>
      <h2 className='text-xl font-semibold mb-4 text-gray-900'>
        {title}
      </h2>

      <SummaryCards summary={summary} />
      <div className='mb-6'>{renderChart()}</div>
      <TableData chartData={chartData} />

      <div className='mt-4 text-sm text-gray-500'>
        <p>{accessibilityDescription}</p>
      </div>
    </div>
  )
}

export default DataVisualization
