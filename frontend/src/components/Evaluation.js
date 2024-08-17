import React from 'react';
import { Line } from 'react-chartjs-2';

const EvaluationGraph = ({ evaluations }) => {
  const data = {
    labels: evaluations.map((_, index) => index + 1),
    datasets: [
      {
        label: 'Evaluation',
        data: evaluations,
        borderColor: 'rgba(75,192,192,1)',
        fill: false,
        pointRadius: 1,
        borderWidth: 2,
      },
    ],
  };

  const options = {
    scales: {
      y: {
        beginAtZero: true,
        suggestedMin: -10,
        suggestedMax: 10,
        title: {
          display: true,
          text: 'Centipawn Evaluation',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Move Number',
        },
      },
    },
  };

  return <Line data={data} options={options} />;
};

export default EvaluationGraph;
