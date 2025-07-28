import { csv } from "d3";

// Function to load the CSV data
export const loadData = ({ state, setState }) => {
  if (!state.data) {
    csv("/data/crimes-against-women-2022.csv", (d) => {
      return {
        state: d.States,
        rate: +d.Rate,
      };
    }).then((data) => {
      // Filter out the total row and sort by rate descending
      const filteredData = data
        .filter((d) => d.state !== "TOTAL STATE(S)")
        .sort((a, b) => b.rate - a.rate);

      setState((prevState) => ({
        ...prevState,
        data: filteredData,
      }));
    });
    return null;
  }
  return state.data;
};
