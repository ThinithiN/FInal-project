import React, { useEffect } from "react";

const TestScreen = () => {

  console.log("called me ")
  useEffect(() => {
    console.log("Component mounted");

    return () => {
      console.log("Component will unmount");
    };
  }, []); // Empty dependency arra
  return <div>Test</div>;
};

export default TestScreen;
