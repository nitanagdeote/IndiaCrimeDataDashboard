import { scaleSequential } from 'd3';
import { interpolateRdYlBu } from 'd3';

export const renderBarElements = (
  selection, 
  { data, xScale, yScale, innerHeight, state, setState }
) => {
  // Create a color scale based on rate values
  const colorScale = scaleSequential(interpolateRdYlBu)
    .domain([Math.max(...data.map(d => d.rate)), 0]);

  selection.selectAll('.bar')
    .data(data)
    .join('rect')
    .attr('class', 'bar')
    .attr('x', (d) => xScale(d.state))
    .attr('y', (d) => yScale(d.rate))
    .attr('rx', 2)
    .attr('width', xScale.bandwidth())
    .attr('height', (d) => innerHeight - yScale(d.rate))
    .attr('fill', (d) => 
      state.selectedState === d.state
        ? '#2c5234'
        : colorScale(d.rate)
    )
    .style('cursor', 'pointer')
    .attr('opacity', (d) =>
      state.selectedState === d.state || !state.selectedState ? 1 : 0.6,
    )
    .on('click', (event, d) => {
      setState((prevState) => ({
        ...prevState,
        selectedState:
          prevState.selectedState === d.state
            ? null
            : d.state,
      }));
    })
    .on('mouseover', (event, d) => {
      // Create tooltip
      const tooltip = selection.selectAll('.tooltip')
        .data([d])
        .join('g')
        .attr('class', 'tooltip');
      
      const rect = tooltip.selectAll('rect')
        .data([d])
        .join('rect')
        .attr('fill', 'rgba(0, 0, 0, 0.8)')
        .attr('rx', 4)
        .attr('stroke', '#ccc')
        .attr('stroke-width', 1);
      
      const text = tooltip.selectAll('text')
        .data([d])
        .join('text')
        .attr('fill', 'white')
        .attr('font-family', 'Inter, sans-serif')
        .attr('font-size', '12px')
        .attr('text-anchor', 'middle')
        .text(`${d.state}: ${d.rate}`);
      
      // Position tooltip
      const bbox = text.node().getBBox();
      rect
        .attr('x', bbox.x - 8)
        .attr('y', bbox.y - 4)
        .attr('width', bbox.width + 16)
        .attr('height', bbox.height + 8);
      
      tooltip.attr('transform', `translate(${xScale(d.state) + xScale.bandwidth() / 2}, ${yScale(d.rate) - 20})`);
    })
    .on('mouseout', () => {
      selection.selectAll('.tooltip').remove();
    });
};