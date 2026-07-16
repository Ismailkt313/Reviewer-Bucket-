import { useEffect, useState } from "react";

export function useViewportHeight() {
  const [height, setHeight] = useState("100dvh");

  useEffect(() => {
    if (typeof window === "undefined" || !window.visualViewport) return;

    const handleResize = () => {
      if (window.visualViewport) {
        setHeight(`${window.visualViewport.height}px`);
      }
    };

    window.visualViewport.addEventListener("resize", handleResize);
    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.visualViewport?.removeEventListener("resize", handleResize);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return height;
}
