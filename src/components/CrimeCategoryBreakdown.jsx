import React, { useRef, useEffect, useState } from "react";
import { csv, select, pie, arc, scaleOrdinal, schemeCategory10 } from "d3";

const CrimeCategoryBreakdown = ({ compact = false }) => {
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
    csv("/data/District_wise_crimes_committed_IPC_2001_2012.csv", (d) => ({
      murder: +d.MURDER || 0,
      rape: +d.RAPE || 0,
      kidnapping: +d["KIDNAPPING & ABDUCTION"] || 0,
      robbery: +d.ROBBERY || 0,
      burglary: +d.BURGLARY || 0,
      theft: +d.THEFT || 0,
      dowryDeaths: +d["DOWRY DEATHS"] || 0,
      assault: +d["ASSAULT ON WOMEN WITH INTENT TO OUTRAGE HER MODESTY"] || 0,
      cruelty: +d["CRUELTY BY HUSBAND OR HIS RELATIVES"] || 0,
    })).then((rawData) => {
      // Aggregate all crime categories
      const categoryTotals = {
        Murder: 0,
        Rape: 0,
        "Kidnapping & Abduction": 0,
        Robbery: 0,
        Burglary: 0,
        Theft: 0,
        "Dowry Deaths": 0,
        "Assault on Women": 0,
        "Cruelty by Husband/Relatives": 0,
      };

      rawData.forEach((d) => {
        categoryTotals["Murder"] += d.murder;
        categoryTotals["Rape"] += d.rape;
        categoryTotals["Kidnapping & Abduction"] += d.kidnapping;
        categoryTotals["Robbery"] += d.robbery;
        categoryTotals["Burglary"] += d.burglary;
        categoryTotals["Theft"] += d.theft;
        categoryTotals["Dowry Deaths"] += d.dowryDeaths;
        categoryTotals["Assault on Women"] += d.assault;
        categoryTotals["Cruelty by Husband/Relatives"] += d.cruelty;
      });

      // Convert to array format for D3 pie chart
      const processedData = Object.entries(categoryTotals)
        .map(([category, value]) => ({ category, value }))
        .filter((d) => d.value > 0)
        .sort((a, b) => b.value - a.value);

      setData(processedData);
    });
  }, []);

  useEffect(() => {
    if (!data || !dimensions.width || !dimensions.height) return;

    const svg = select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: compact ? 20 : 40, right: 20, bottom: 20, left: 20 };
    const width = dimensions.width - margin.left - margin.right;
    const height = dimensions.height - margin.top - margin.bottom;
    const radius = Math.min(width, height) / 2 - 20;

    const g = svg
      .append("g")
      .attr(
        "transform",
        `translate(${dimensions.width / 2},${dimensions.height / 2})`
      );

    // Color scale
    const color = scaleOrdinal(schemeCategory10);

    // Pie generator
    const pieGenerator = pie()
      .value((d) => d.value)
      .sort(null);

    // Arc generator
    const arcGenerator = arc()
      .innerRadius(compact ? radius * 0.4 : radius * 0.3)
      .outerRadius(radius);

    // Label arc generator
    const labelArc = arc()
      .innerRadius(radius * 0.8)
      .outerRadius(radius * 0.8);

    // Generate pie data
    const pieData = pieGenerator(data);

    // Draw pie slices
    const slices = g
      .selectAll(".slice")
      .data(pieData)
      .enter()
      .append("g")
      .attr("class", "slice");

    slices
      .append("path")
      .attr("d", arcGenerator)
      .attr("fill", (d, i) => color(i))
      .attr("stroke", "white")
      .attr("stroke-width", 2)
      .on("mouseover", function (event, d) {
        select(this).attr("opacity", 0.8);

        // Tooltip
        const tooltip = select("body")
          .append("div")
          .attr("class", "tooltip")
          .style("opacity", 0);

        tooltip.transition().duration(200).style("opacity", 0.9);

        const percentage = (
          (d.data.value / data.reduce((sum, item) => sum + item.value, 0)) *
          100
        ).toFixed(1);

        tooltip
          .html(
            `<strong>${d.data.category}</strong><br/>
             Count: ${d.data.value.toLocaleString()}<br/>
             Percentage: ${percentage}%`
          )
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 28 + "px");
      })
      .on("mouseout", function () {
        select(this).attr("opacity", 1);
        select(".tooltip").remove();
      });

    // Add labels (only for larger slices in compact mode)
    if (!compact) {
      slices
        .append("text")
        .attr("transform", (d) => `translate(${labelArc.centroid(d)})`)
        .attr("dy", "0.35em")
        .style("text-anchor", "middle")
        .style("font-size", "11px")
        .style("fill", "#333")
        .text((d) => {
          const percentage =
            (d.data.value / data.reduce((sum, item) => sum + item.value, 0)) *
            100;
          return percentage > 5 ? d.data.category : "";
        });
    }

    // Legend
    const legend = svg
      .append("g")
      .attr("class", "legend")
      .attr(
        "transform",
        `translate(${compact ? 10 : 20}, ${compact ? 20 : 40})`
      );

    const legendItems = legend
      .selectAll(".legend-item")
      .data(data.slice(0, compact ? 5 : 9))
      .enter()
      .append("g")
      .attr("class", "legend-item")
      .attr("transform", (d, i) => `translate(0, ${i * (compact ? 16 : 20)})`);

    legendItems
      .append("rect")
      .attr("width", compact ? 10 : 12)
      .attr("height", compact ? 10 : 12)
      .attr("fill", (d, i) => color(i));

    legendItems
      .append("text")
      .attr("x", compact ? 15 : 18)
      .attr("y", compact ? 5 : 6)
      .attr("dy", "0.35em")
      .style("font-size", compact ? "10px" : "12px")
      .style("fill", "#333")
      .text((d) => d.category);

    // Title (only for non-compact mode)
    if (!compact) {
      svg
        .append("text")
        .attr("class", "title-text")
        .attr("x", dimensions.width / 2)
        .attr("y", 30)
        .attr("text-anchor", "middle")
        .text("Crime Category Breakdown (2001-2012)");
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

export default CrimeCategoryBreakdown;
