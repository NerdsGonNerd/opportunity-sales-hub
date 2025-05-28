import { ChartOptions } from 'chart.js';

interface UseChartConfigProps {
  onBarClick?: (stageId: number) => void;
  stageCount: number;
}

export const useChartConfig = ({ onBarClick, stageCount }: UseChartConfigProps) => {
  // Calculate dynamic bar thickness based on available space and number of stages
  const chartHeight = 320; // Height of the chart container
  const padding = 80; // Total padding (top + bottom)
  const maxBarThickness = 40;
  const minBarThickness = 15;
  const dynamicBarThickness = Math.max(
    minBarThickness, 
    Math.min(maxBarThickness, (chartHeight - padding) / stageCount * 0.7)
  );

  const chartConfig: ChartOptions<'bar'> = {
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
        display: false
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
            return `Opportunities: ${context.parsed.x}`;
          }
        },
        backgroundColor: 'white',
        titleColor: 'black',
        bodyColor: 'black',
        borderColor: '#d1d5db',
        borderWidth: 1,
        displayColors: false
      },
      datalabels: {
        anchor: 'end',
        align: 'start',
        clamp: true,
        offset: -10,
        color: 'white',
        font: {
          weight: 'bold',
          size: Math.max(10, Math.min(14, dynamicBarThickness * 0.4))
        },
        formatter: (value: any) => {
          const count = value.x || value;
          return count > 0 ? count.toString() : '';
        },
        display: function(context) {
          // Only show labels for bars with values > 0
          const value = context.dataset.data[context.dataIndex];
          const numericValue = typeof value === 'object' && value !== null && 'x' in value 
            ? (value as any).x 
            : typeof value === 'number' 
            ? value 
            : 0;
          return numericValue > 0;
        }
      }
    },
    onHover: (event, elements, chart) => {
      if (chart.canvas) {
        chart.canvas.style.cursor = elements.length > 0 ? 'pointer' : 'default';
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

  return { chartConfig, dynamicBarThickness };
};
