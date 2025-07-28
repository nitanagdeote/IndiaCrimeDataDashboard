import { axisBottom, axisLeft } from 'd3';

export const renderAxes = (selection, { xScale, yScale, innerWidth, innerHeight }) => {
  // Create and render x-axis
  const xAxis = axisBottom(xScale)
    .tickSize(0)
    .tickPadding(12);

  selection.selectAll('.x-axis')
    .data([null])
    .join('g')
    .attr('class', 'x-axis axis')
    .attr('transform', `translate(0, ${innerHeight})`)
    .call(xAxis)
    .selectAll('text')
    .style('text-anchor', 'end')
    .attr('transform', 'rotate(-45)')
    .attr('dx', '-0.5em')
    .attr('dy', '0.15em');

  // Create and render y-axis
  const yAxis = axisLeft(yScale)
    .ticks(8)
    .tickSize(-innerWidth)
    .tickFormat(d => d);

  selection.selectAll('.y-axis')
    .data([null])
    .join('g')
    .attr('class', 'y-axis axis')
    .call(yAxis)
    .call(g => g.select('.domain').remove())
    .call(g => g.selectAll('.tick line').attr('stroke-opacity', 0.1));

  // Add axis titles
  selection.selectAll('.x-axis-title')
    .data([null])
    .join('text')
    .attr('class', 'axis-title')
    .attr('text-anchor', 'middle')
    .attr('x', innerWidth / 2)
    .attr('y', innerHeight + 80)
    .text('States and Union Territories');

  selection.selectAll('.y-axis-title')
    .data([null])
    .join('text')
    .attr('class', 'axis-title')
    .attr('text-anchor', 'middle')
    .attr('transform', `translate(${-60}, ${innerHeight / 2}) rotate(-90)`)
    .text('Rate');
};