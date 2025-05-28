
import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Bar } from 'react-chartjs-2';
import { useChartConfig } from '@/hooks/useChartConfig';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

interface ChartData {
  id: number;
  name: string;
  count: number;
}

interface ChartJsBarChartProps {
  data: ChartData[];
  onBarClick?: (stageId: number) => void;
}

export const ChartJsBarChart: React.FC<ChartJsBarChartProps> = ({ data, onBarClick }) => {
  const chartConfig = useChartConfig({ onBarClick, stageCount: data.length });

  // Sort data by stage ID in ascending order
  const sortedData = [...data].sort((a, b) => a.id - b.id);

  const chartData = {
    labels: sortedData.map(item => item.name),
    datasets: [
      {
        data: sortedData.map(item => ({
          x: item.count,
          y: item.name,
          stageId: item.id
        })),
        backgroundColor: '#3b82f6',
        borderColor: '#3b82f6',
        borderWidth: 0,
        categoryPercentage: 0.9,
        barPercentage: 0.8
      }
    ]
  };

  return (
    <div className="h-80">
      <Bar data={chartData} options={chartConfig} />
    </div>
  );
};
