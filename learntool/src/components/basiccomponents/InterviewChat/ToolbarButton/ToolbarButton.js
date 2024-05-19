import React, {
  useState,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import "./ToolbarButton.css";

const ToolbarButton = (props) => {
  const {
    buttonRef,
    icon,
    onclick,
    quizdone,
    ontouchStart,
    onmouseDown,
    ontouchEnd,
    onmouseUp,
  } = props;

  return (
    <i
      ref={buttonRef}
      className={
        quizdone ? `toolbar-button3  ${icon}` : `toolbar-button2  ${icon}`
      }
      onClick={onclick}
      onTouchStart={ontouchStart}
      onMouseDown={onmouseDown}
      onTouchEnd={ontouchEnd}
      onMouseUp={onmouseUp}
    />
  );
};

export default ToolbarButton;
