import { useMemo } from "react";

import { Bar } from "react-chartjs-2";
import { Chart, CategoryScale } from "chart.js/auto";

Chart.register(CategoryScale); // chart.js/auto also needed (disable tree shaking for the module)

const options = {
  indexAxis: "x" as const,
  elements: {
    bar: {
      borderWidth: 2,
    },
  },
  responsive: true,
  plugins: {
    legend: { position: "bottom" as const, visible: false },
    title: {
      display: true,
      text: "Population Development over time",
    },
  },
};

const PopulationLineChart = (props: {
  chartData: Array<{ label: string; value: number }>;
}) => {
  const { chartData } = props;
  //
  const data = useMemo(() => {
    const labels = chartData.map((c) => c.label);
    const values = chartData.map((c) => c.value);
    //
    return {
      labels,
      datasets: [
        {
          label: "Population",
          data: values,
          borderColor: "rgb(255, 99, 132)",
          backgroundColor: "rgba(255, 99, 132, 0.5)",
        },
      ],
    };
  }, [chartData]);

  //
  return (
    <span style={{ width: "100%" }}>
      <Bar data={data} options={options} />
    </span>
  );
};

export default PopulationLineChart;
