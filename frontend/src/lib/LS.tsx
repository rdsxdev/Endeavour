// "use client";
import { useEffect } from "react";
export default function LS() {
  useEffect(() => {
    (async function () {
      try {
        const L = (await import("locomotive-scroll")).default;
        new L();
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  return <></>;
}
