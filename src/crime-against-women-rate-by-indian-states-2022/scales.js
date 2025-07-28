import { scaleBand, scaleLinear, max } from 'd3';

export const createScales = ({
  data,
  innerWidth,
  innerHeight,
  xValue = (d) => d.state,
  yValue = (d) => d.rate,
}) => {
  const xScale = scaleBand()
    .domain(data.map(xValue))
    .range([0, innerWidth])
    .padding(0.1);

  const yScale = scaleLinear()
    .domain([0, max(data, yValue)])
    .range([innerHeight, 0])
    .nice();

  return { xScale, yScale };
};