import { useState, useEffect } from "react";

export const useDimensions = (containerRef) => {
  const [dimensions, setDimensions] = useState(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    
    const updateDimensions = () => {
      const newDimensions = {
        width: container.clientWidth,
        height: container.clientHeight,
      };
      
      setDimensions(prevDimensions => {
        // Only update if dimensions actually changed
        if (!prevDimensions || 
            prevDimensions.width !== newDimensions.width || 
            prevDimensions.height !== newDimensions.height) {
          return newDimensions;
        }
        return prevDimensions;
      });
    };

    // Initial measurement
    updateDimensions();

    const resizeObserver = new ResizeObserver(updateDimensions);
    resizeObserver.observe(container);

    // Cleanup function
    return () => {
      resizeObserver.disconnect();
    };
  }, [containerRef]);

  return dimensions;
};
