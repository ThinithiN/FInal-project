import React from "react";
import moment from "moment";

import TextToSpeech from "../../TexttoSpeech/TexttoSpeech";
import "./Message.css";

const Message = (props) => {
  const { data, isMine, startsSequence, endsSequence, showTimestamp } = props;

  const friendlyTimestamp = moment(data.createdAt).format("LLLL");
  const friendlyTimeOnly = moment(data.createdAt).format("LT");

  return (
    <div
      className={[
        "message",
        `${isMine ? "mine" : ""}`,
        `${startsSequence ? "start" : ""}`,
        `${endsSequence ? "end" : ""}`,
      ].join(" ")}
    >
      {showTimestamp && <div className="timestamp">{friendlyTimestamp}</div>}

      <div className="bubble-container">
        <div className="bubble" title={friendlyTimestamp}>
          {data.messageType === "message" ? (
            <div style={{display:"flex" , flexDirection:"row"}}>
              <div className="messageview">{data.text}</div>
              <TextToSpeech text={data.text} />
            </div>
          ) : (
            <div className="messageview">
              {data.audio ? <audio src={data.audio} controls /> : "Audio Error"}
            </div>
          )}

          <div className="timeview">{friendlyTimeOnly}</div>
        </div>
      </div>
    </div>
  );
};

export default Message;
