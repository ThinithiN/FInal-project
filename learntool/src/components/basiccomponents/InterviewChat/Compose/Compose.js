import React, { useEffect, useState } from "react";
import "./Compose.css";

const Compose = (props) => {
  const { socketRef, sendBtnRef, sendBtnRefHandler, messages, setMessages } =
    props;
  const [message, setMessage] = useState("");

  const messageIdGenerator = () => {
    try {
      const uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
        /[xy]/g,
        (c) => {
          const r = (Math.random() * 16) | 0;
          const v = c === "x" ? r : (r & 0x3) | 0x8;
          return v.toString(16);
        }
      );

      //uuid = null;

      if (!uuid) {
        throw new Error("Failed to generate UUID");
      }

      return uuid;
    } catch (error) {
      // generates uuid.
      console.error(" error id creating ", error.toString());
      return null;
    }
  };

  const handleKeyDown = (event) => {
    if (event.keyCode === 13) {
      // Enter key was pressed
      // Perform your desired action here
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (message.trim() === "") {
      console.log("Input is empty or contains only spaces");
      return;
      // You can add further logic or error handling here
    }
    // Handle your form submission logic
    //console.log("Form submitted!");

    // const username = localStorage.getItem("userName");
    // const userid = localStorage.getItem("userID");

    const user = JSON.parse(localStorage.getItem("user"));

    const username = user.userName;
    const userid = user.userId;

    const userFile = username + "_" + userid.toString() + "_chat_history";

    if (!username || !userid) {
      return;
    }

    var messageObj = {
      _id: messageIdGenerator(),
      text: message ? message : "",
      audio: "",
      messageType: "message",
      createdAt: new Date(),
      user: {
        _id: userid,
        name: username,
        avatar: "https://picsum.photos/id/668/200/300",
      },
    };

    var userMSG = {
      messageObj: messageObj,
      username: username,
      userid: userid,
      userFile: userFile,
      audiobase64msg: "",
    };

    socketRef.current.emit("user message", userMSG);

    //console.log(messages);

    let temparray = [];

    temparray.push(messageObj);

    setMessages([...messages, temparray]);

    setMessage("");
  };

  useEffect(() => {
    if (sendBtnRef) {
      handleSubmit();
      sendBtnRefHandler(false);
    }
  }, [sendBtnRef]);

  return (
    <div className="compose2">
      {/* <input
        type="text"
        className="compose-input"
        placeholder="Ask Questions"
        value={message}
        onChange={(e) => {
          setMessage(e.target.value);
        }}
        onKeyDown={handleKeyDown}
      /> */}
      {props.rightItems}
    </div>
  );
};

export default Compose;
