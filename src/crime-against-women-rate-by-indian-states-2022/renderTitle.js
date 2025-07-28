import { select } from 'd3';

export const renderTitle = (
  selection,
  { width, height },
) => {
  const g = selection
    .selectAll('.title-container')
    .data([null])
    .join('g')
    .attr('class', 'title-container');

  g.selectAll('.title-text')
    .data([null])
    .join('text')
    .attr('class', 'title-text')
    .attr('x', width / 2)
    .attr('y', 50)
    .attr('text-anchor', 'middle')
    .attr('dominant-baseline', 'middle')
    .text('Crime Rate by State/UT in India');

  g.selectAll('.subtitle-text')
    .data([null])
    .join('text')
    .attr('class', 'subtitle-text')
    .attr('x', width / 2)
    .attr('y', 75)
    .attr('text-anchor', 'middle')
    .attr('dominant-baseline', 'middle')
    .attr('font-family', 'Inter, sans-serif')
    .attr('font-size', '14px')
    .attr('fill', '#666')
    .text('Rate per 100,000 population - Click bars to highlight');

  return g;
};