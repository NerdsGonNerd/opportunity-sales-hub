
import { ChartOptions } from 'chart.js';

interface UseChartConfigProps {
  onBarClick?: (stageId: number) => void;
}

export const useChartConfig = ({ onBarClick }: UseChartConfigProps): ChartOptions<'bar'> => {
  return {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y' as const,
    layout: {
      padding: {
        top: 20,
        right: 80,
        left: 20,
        bottom: 20
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          callback: function(value) {
            return Math.round(Number(value)).toString();
          }
        },
        grid: {
          display: true
        }
      },
      y: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 12
          }
        }
      }
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          title: function(context) {
            return context[0].label;
          },
          label: function(context) {
            return `${context.label}: ${context.parsed.x}`;
          }
        },
        backgroundColor: 'white',
        titleColor: 'black',
        bodyColor: 'black',
        borderColor: '#d1d5db',
        borderWidth: 1,
        displayColors: false
      }
    },
    onClick: (event, elements, chart) => {
      if (elements.length > 0 && onBarClick) {
        const elementIndex = elements[0].index;
        const stageId = (chart.data.datasets[0].data[elementIndex] as any)?.stageId;
        if (stageId) {
          onBarClick(stageId);
        }
      }
    }
  };
};
