import { useState, useEffect } from "react";

export const useDimensions = (containerRef) => {
  const [dimensions, setDimensions] = useState(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    
    // Measure dimensions once on page load
    setDimensions({
      width: container.clientWidth,
      height: container.clientHeight,
    });
  }, [containerRef]);

  return dimensions;
};
