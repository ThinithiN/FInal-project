import React from "react";
import moment from "moment";

import TextToSpeech from "../../TexttoSpeech/TexttoSpeech";
import "./Message.css";


import techavatar from "../../../../assets/icons/technical-support.png"
import boyavatar from "../../../../assets/icons/boy.png";


const Message = (props) => {
  const { data, isMine, startsSequence, endsSequence, showTimestamp } = props;

  const friendlyTimestamp = moment(data.createdAt).format("LLLL");
  const friendlyTimeOnly = moment(data.createdAt).format("LT");

  return (
    <div
      className={[
        "message2",
        `${isMine ? "mine" : ""}`,
        `${startsSequence ? "start" : ""}`,
        `${endsSequence ? "end" : ""}`,
      ].join(" ")}
    >
      {showTimestamp && <div className="timestamp">{friendlyTimestamp}</div>}

      <div className="bubble-container">
        {!isMine ? (
          <>
            {" "}
            <div className="avatar">
              <img src={techavatar} alt="tech" width="40px" height="40px" />
            </div>
            <div className="bubble" title={friendlyTimestamp}>
              {data.messageType === "message" ? (
                <div style={{ display: "flex", flexDirection: "row" }}>
                  <div className="messageview">{data.text}</div>
                  <TextToSpeech text={data.text} />
                </div>
              ) : (
                <div className="messageview">
                  {data.audio ? (
                    <audio src={data.audio} controls />
                  ) : (
                    "Audio Error"
                  )}
                </div>
              )}

              <div className="timeview">{friendlyTimeOnly}</div>
            </div>
          </>
        ) : (
          <>
            {" "}
            <div className="bubble" title={friendlyTimestamp}>
              {data.messageType === "message" ? (
                <div style={{ display: "flex", flexDirection: "row" }}>
                  <div className="messageview">{data.text}</div>
                  <TextToSpeech text={data.text} />
                </div>
              ) : (
                <div className="messageview">
                  {data.audio ? (
                    <audio src={data.audio} controls />
                  ) : (
                    "Audio Error"
                  )}
                </div>
              )}

              <div className="timeview">{friendlyTimeOnly}</div>
            </div>
            <div className="avatar">
              <img src={boyavatar} alt="boy" width="40px" height="40px" />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Message;
