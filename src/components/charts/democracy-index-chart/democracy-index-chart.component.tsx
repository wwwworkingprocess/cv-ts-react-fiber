import { useMemo } from "react";

import { Bar } from "react-chartjs-2";
import { Chart, CategoryScale } from "chart.js/auto";

Chart.register(CategoryScale); // chart.js/auto --> (disable tree shaking chart.js)

const options = {
  responsive: true,
  indexAxis: "x" as const,
  elements: { bar: { borderWidth: 2 } },
  plugins: {
    legend: { position: "bottom" as const, visible: false },
    title: { display: true, text: "Democracy Index over time" },
  },
};

const DemocracyIndexChart = (props: {
  data: Array<{ label: string | number; value: number }>;
}) => {
  const { data } = props;
  //
  const memo = useMemo(() => {
    const labels = data.map((c) => c.label);
    const values = data.map((c) => c.value);
    //
    return {
      labels,
      datasets: [
        {
          label: "Democracy Index",
          data: values,
          borderColor: "rgb(255, 99, 132)",
          backgroundColor: "rgba(255, 99, 132, 0.5)",
        },
      ],
    };
  }, [data]);
  //
  return <Bar data={memo} options={options} />;
};

export default DemocracyIndexChart;
