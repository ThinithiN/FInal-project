import React from "react";
import "./ToolbarButton.css";

const ToolbarButton = (props) => {
  const { icon, onclick, ontouchStart, onmouseDown, ontouchEnd, onmouseUp } =
    props;
  return (
    <i
      className={`toolbar-button ${icon}`}
      onClick={onclick}
      onTouchStart={ontouchStart}
      onMouseDown={onmouseDown}
      onTouchEnd={ontouchEnd}
      onMouseUp={onmouseUp}
    />
  );
};

export default ToolbarButton;
