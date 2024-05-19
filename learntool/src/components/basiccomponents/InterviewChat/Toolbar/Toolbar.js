import React from "react";
import "./Toolbar.css";

const Toolbar = (props) => {
  const { title, leftItems, rightItems, onclick, unreadCount } = props;

  let unreadSize = 16; //16 //20 //26

  let countStr = unreadCount.toString();

  if (unreadCount > 0 && unreadCount < 10) {
    unreadSize = 16;
    countStr = unreadCount.toString();
  } else if (unreadCount > 10 && unreadCount <= 99) {
    unreadSize = 20;
    countStr = unreadCount.toString();
  } else if (unreadCount > 0 && unreadCount > 99) {
    unreadSize = 26;
    countStr = "+99";
  } else {
    unreadSize = 0;
    countStr = "";
  }

  return (
    <div className="toolbar" onClick={onclick}>
      <div className="left-items">{leftItems}</div>
      <div className="toolbar-title">
        <>{title}</>
        <div
          className="indicatorshow"
          style={{ width: `${unreadSize}px`, height: `${unreadSize}px` }}
        >
          {unreadCount > 0 ? countStr : ""}
        </div>
      </div>
      <div className="right-items">{rightItems}</div>
    </div>
  );
};

export default Toolbar;
