import React, { useRef, useEffect, useState } from "react";
import {
  csv,
  select,
  scaleBand,
  scaleLinear,
  max,
  axisBottom,
  axisLeft,
} from "d3";

const MissingChildrenChart = ({ compact = false }) => {
  const svgRef = useRef();
  const [data, setData] = useState(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      if (svgRef.current) {
        const container = svgRef.current.parentElement;
        setDimensions({
          width: container.clientWidth,
          height: compact ? 300 : 400,
        });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, [compact]);

  useEffect(() => {
    csv("/data/missing-children-2022.csv", (d) => ({
      state: d.State,
      rate: +d.MissingChildrenPer100k,
    })).then((rawData) => {
      const filteredData = rawData
        .filter((d) => d.rate > 0)
        .sort((a, b) => b.rate - a.rate);
      setData(filteredData);
    });
  }, []);

  useEffect(() => {
    if (!data || !dimensions.width || !dimensions.height) return;

    const svg = select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = {
      top: compact ? 40 : 60,
      right: 50,
      bottom: compact ? 80 : 120,
      left: 100,
    };
    const width = dimensions.width - margin.left - margin.right;
    const height = dimensions.height - margin.top - margin.bottom;

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Scales
    const xScale = scaleBand()
      .domain(data.map((d) => d.state))
      .range([0, width])
      .padding(0.1);

    const yScale = scaleLinear()
      .domain([0, max(data, (d) => d.rate)])
      .nice()
      .range([height, 0]);

    // Color scale - using orange/red theme for missing children
    const colorScale = scaleLinear()
      .domain([0, max(data, (d) => d.rate)])
      .range(["#fff3e0", "#e65100"]);

    // Bars
    g.selectAll(".bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (d) => xScale(d.state))
      .attr("width", xScale.bandwidth())
      .attr("y", (d) => yScale(d.rate))
      .attr("height", (d) => height - yScale(d.rate))
      .attr("fill", (d) => colorScale(d.rate))
      .on("mouseover", function (event, d) {
        select(this).attr("opacity", 0.8);

        // Tooltip
        const tooltip = select("body")
          .append("div")
          .attr("class", "tooltip")
          .style("opacity", 0);

        tooltip.transition().duration(200).style("opacity", 0.9);

        tooltip
          .html(
            `<strong>${d.state}</strong><br/>Missing Children: ${d.rate} per 100k`
          )
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 28 + "px");
      })
      .on("mouseout", function () {
        select(this).attr("opacity", 1);
        select(".tooltip").remove();
      });

    // X Axis
    g.append("g")
      .attr("class", "axis")
      .attr("transform", `translate(0,${height})`)
      .call(axisBottom(xScale))
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-45)");

    // Y Axis
    g.append("g").attr("class", "axis").call(axisLeft(yScale));

    // Y Axis Label
    g.append("text")
      .attr("class", "axis-title")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - height / 2)
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Missing Children per 100,000");

    // Title (only for non-compact mode)
    if (!compact) {
      svg
        .append("text")
        .attr("class", "title-text")
        .attr("x", dimensions.width / 2)
        .attr("y", 30)
        .attr("text-anchor", "middle")
        .text("Missing Children by State (2022)");
    }
  }, [data, dimensions, compact]);

  if (!data) {
    return <div className="loading-spinner">Loading...</div>;
  }

  return (
    <div className={`chart-container ${compact ? "compact" : ""}`}>
      <svg ref={svgRef} width={dimensions.width} height={dimensions.height} />
    </div>
  );
};

export default MissingChildrenChart;
