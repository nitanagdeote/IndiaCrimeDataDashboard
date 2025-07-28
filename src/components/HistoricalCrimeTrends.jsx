import React, { useRef, useEffect, useState } from "react";
import {
  csv,
  select,
  scaleLinear,
  scaleTime,
  line,
  extent,
  axisBottom,
  axisLeft,
  timeParse,
  timeFormat,
} from "d3";

const HistoricalCrimeTrends = ({ compact = false }) => {
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
      state: d["STATE/UT"],
      district: d.DISTRICT,
      year: +d.YEAR,
      totalCrimes: +d["TOTAL IPC CRIMES"],
      murder: +d.MURDER,
      rape: +d.RAPE,
      kidnapping: +d["KIDNAPPING & ABDUCTION"],
      dowryDeaths: +d["DOWRY DEATHS"],
      assault: +d["ASSAULT ON WOMEN WITH INTENT TO OUTRAGE HER MODESTY"],
    })).then((rawData) => {
      // Aggregate data by year for national trends
      const yearlyData = {};

      rawData.forEach((d) => {
        if (!yearlyData[d.year]) {
          yearlyData[d.year] = {
            year: d.year,
            totalCrimes: 0,
            murder: 0,
            rape: 0,
            kidnapping: 0,
            dowryDeaths: 0,
            assault: 0,
          };
        }

        yearlyData[d.year].totalCrimes += d.totalCrimes || 0;
        yearlyData[d.year].murder += d.murder || 0;
        yearlyData[d.year].rape += d.rape || 0;
        yearlyData[d.year].kidnapping += d.kidnapping || 0;
        yearlyData[d.year].dowryDeaths += d.dowryDeaths || 0;
        yearlyData[d.year].assault += d.assault || 0;
      });

      const processedData = Object.values(yearlyData).sort(
        (a, b) => a.year - b.year
      );
      setData(processedData);
    });
  }, []);

  useEffect(() => {
    if (!data || !dimensions.width || !dimensions.height) return;

    const svg = select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = {
      top: compact ? 40 : 60,
      right: compact ? 80 : 120,
      bottom: compact ? 60 : 80,
      left: 80,
    };
    const width = dimensions.width - margin.left - margin.right;
    const height = dimensions.height - margin.top - margin.bottom;

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Scales
    const xScale = scaleLinear()
      .domain(extent(data, (d) => d.year))
      .range([0, width]);

    const yScale = scaleLinear()
      .domain([0, Math.max(...data.map((d) => d.totalCrimes))])
      .nice()
      .range([height, 0]);

    // Line generator
    const lineGenerator = line()
      .x((d) => xScale(d.year))
      .y((d) => yScale(d.totalCrimes));

    // Add the line
    g.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "#667eea")
      .attr("stroke-width", 3)
      .attr("d", lineGenerator);

    // Add dots
    g.selectAll(".dot")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("cx", (d) => xScale(d.year))
      .attr("cy", (d) => yScale(d.totalCrimes))
      .attr("r", 4)
      .attr("fill", "#667eea")
      .on("mouseover", function (event, d) {
        select(this).attr("r", 6).attr("fill", "#4c63d2");

        // Tooltip
        const tooltip = select("body")
          .append("div")
          .attr("class", "tooltip")
          .style("opacity", 0);

        tooltip.transition().duration(200).style("opacity", 0.9);

        tooltip
          .html(
            `<strong>Year: ${d.year}</strong><br/>
             Total Crimes: ${d.totalCrimes.toLocaleString()}<br/>
             Murder: ${d.murder.toLocaleString()}<br/>
             Rape: ${d.rape.toLocaleString()}<br/>
             Kidnapping: ${d.kidnapping.toLocaleString()}`
          )
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 28 + "px");
      })
      .on("mouseout", function () {
        select(this).attr("r", 4).attr("fill", "#667eea");
        select(".tooltip").remove();
      });

    // X Axis
    g.append("g")
      .attr("class", "axis")
      .attr("transform", `translate(0,${height})`)
      .call(axisBottom(xScale).tickFormat((d) => d.toString()));

    // Y Axis
    g.append("g").attr("class", "axis").call(axisLeft(yScale));

    // X Axis Label
    g.append("text")
      .attr("class", "axis-title")
      .attr("transform", `translate(${width / 2}, ${height + 40})`)
      .style("text-anchor", "middle")
      .text("Year");

    // Y Axis Label
    g.append("text")
      .attr("class", "axis-title")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - height / 2)
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Total Crimes");

    // Title (only for non-compact mode)
    if (!compact) {
      svg
        .append("text")
        .attr("class", "title-text")
        .attr("x", dimensions.width / 2)
        .attr("y", 30)
        .attr("text-anchor", "middle")
        .text("Historical Crime Trends (2001-2012)");
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

export default HistoricalCrimeTrends;
