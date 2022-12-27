import { useMemo } from "react";

import { Chart, CategoryScale } from "chart.js/auto";
import { Bar } from "react-chartjs-2";

Chart.register(CategoryScale); // chart.js/auto also needed (disable tree shaking for the module)

type PopulationCountriesChartProps = {
  title: string;
  label: string;
  data: Array<{ label: string; value: number }>;
};

const chartOptions = {
  indexAxis: "y" as const,
  elements: { bar: { borderWidth: 2 } },
  responsive: true,
  plugins: {
    legend: { position: "bottom" as const, visible: false },
    title: { display: true, text: "Top 25 Most Populated Countries" },
  },
};

const style = {
  borderColor: "rgb(255, 99, 132)",
  backgroundColor: "rgba(255, 99, 132, 0.5)",
};

const PopulationCountriesChart = (props: PopulationCountriesChartProps) => {
  const { data, title, label } = props;
  //
  const options = useMemo(
    () => ({
      ...chartOptions,
      plugins: {
        ...chartOptions.plugins,
        title: { display: true, text: title },
      },
    }),
    [title]
  );
  //
  const memo = useMemo(() => {
    const labels = data.map((c) => c.label);
    const values = data.map((c) => c.value);
    //
    return {
      labels,
      datasets: [{ label, data: values, ...style }],
    };
  }, [data, label]);
  //
  return <Bar data={memo} options={options} />;
};

export default PopulationCountriesChart;
