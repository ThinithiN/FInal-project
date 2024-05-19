import React, { useEffect, useState, useCallback, useRef } from "react";
import Compose from "../Compose/Compose";
import Toolbar from "../Toolbar/Toolbar";
import ToolbarButton from "../ToolbarButton/ToolbarButton";
import Message from "../Message/Message";
import moment from "moment";

import "./MessageList.css";

import io from "socket.io-client";

const MessageList = (props) => {
  //!NEW

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

  const audioStreamRef = useRef(null);
  const [audioPermission, setAudioPermission] = useState(false);

  const [isAudioOn, setIsAudioOn] = useState(true);

  const getStreamsAndPermissions = async () => {
    try {
      if (isAudioOn) {
        // Get audio stream
        const audioStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        audioStreamRef.current = audioStream;
        setAudioPermission(true);
      }
    } catch (error) {
      console.error("Error accessing media devices:", error);
    }
  };

  //! Record Audio blob

  const mimeType = "audio/wav";
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  // const [permission, setPermission] = useState(false);
  const mediaRecorder = useRef(null);
  // const [stream, setStream] = useState(null);
  const audioChunksRef = useRef([]);
  const audio = useRef([]);
  const audioBlobs = useRef(null);

  const isRecordingRef = useRef(false);

  // const use

  const requestMediaPermission = async () => {
    try {
      const constraints = { audio: true, video: true };
      const mediaStream = await navigator.mediaDevices.getUserMedia(
        constraints
      );

      // Handle the media stream as needed
      console.log("Media stream   found :", mediaStream);

      // Store the media stream in state

      return true;
    } catch (error) {
      console.error("Error accessing user media stream :", error);
      return false;
    }
  };

  const handleStartRecording = async () => {
    if (!audioPermission) return;

    let stat = await requestMediaPermission();

    if (!stat) {
      alert("No permission to access media devices try reconnecting them");
      return;
    }

    startRecordingAudio();
  };

  const handleStopRecording = async () => {
    setmessageType("message");
    if (!audioPermission) return;

    let stat = await requestMediaPermission();

    if (!stat) {
      alert("No permission to access media devices try reconnecting them");
      return;
    }

    // && mediaRecorder.current.state === "recording";

    await delay(1000);

    if (mediaRecorder.current) {
      mediaRecorder.current.stop();
    }

    await delay(1000);
  };

  const startRecordingAudio = () => {
    audio.current[0] = "";

    console.log("recording");

    //create new Media recorder instance using the stream
    const media = new MediaRecorder(audioStreamRef.current, { type: mimeType });

    //set the MediaRecorder instance to the mediaRecorder ref
    mediaRecorder.current = media;

    mediaRecorder.current.onstart = () => {
      console.log("Audio Recording started chat");
      isRecordingRef.current = true;
    };

    mediaRecorder.current.ondataavailable = (event) => {
      try {
        console.log(
          "Audio Recording data receiving at chat",
          " and data => ",
          event.data,
          event.data.size
        );

        if (typeof event.data === "undefined") return;
        if (event.data.size === 0) return;

        audioChunksRef.current.push(event.data);
      } catch (error) {
        console.error("Error in ondataavailable:", error);
        // Handle or log the error as needed
      }
    };

    mediaRecorder.current.onstop = () => {
      try {
        console.log("Audio Recording stopped at chat ");

        isRecordingRef.current = false;

        // creates a blob file from the audiochunks data
        const audioBlob = new Blob(audioChunksRef.current, {
          type: mimeType,
        });

        // creates a playable URL from the blob file.
        const audioUrl = URL.createObjectURL(audioBlob);
        audioBlobs.current = audioBlob;

        console.log("Audio Recorded audio URL at chat ", audioUrl);

        audio.current[0] = audioUrl;

        handleAudioAnswer(audio.current[0], audioBlob);

        audioChunksRef.current = [];
      } catch (error) {
        console.error("Error in onstop:", error);
        // Handle or log the error as needed
      }
    };

    mediaRecorder.current.onerror = (event) => {
      console.error("MediaRecorder error:", event.error);
    };

    //invokes the start method to start the recording process

    try {
      mediaRecorder.current.start();
      console.log("Audio recording started at chat");
      isRecordingRef.current = true;
    } catch (error) {
      console.error("Error starting audio recording: chat ", error);
      // Handle or log the error as needed
      isRecordingRef.current = false; // Set recording flag to false if there's an error
    }
  };

  // Function to handle the conversion of audio to base64
  const convertAudioToBase64 = async (audio) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(",")[1]);
      reader.onerror = reject;

      reader.readAsDataURL(audio);
    });
  };

  const handleAudioAnswer = async (audioUrl, audioBlob) => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));

      const username = user.userName;
      const userid = user.userId;

      const userFile = username + "_" + userid.toString() + "_chat_history";

      if (!username || !userid) {
        return;
      }

      var messageObj = {
        _id: messageIdGenerator(),
        text: "",
        audio: audioUrl,
        messageType: "audio",
        createdAt: new Date(),
        user: {
          _id: userid,
          name: username,
          avatar: "https://picsum.photos/id/668/200/300",
        },
      };

      let temparray = [];

      temparray.push(messageObj);

      setMessages([...messages, temparray]);

      let base64Data;

      if (audioBlob) {
        base64Data = await convertAudioToBase64(audioBlob);
      } else if (audioUrl) {
        const response = await fetch(audioUrl);
        const blob = await response.blob();
        base64Data = await convertAudioToBase64(blob);
      }

      // Now you can send the base64Data to the Python side
      // sendBase64DataToPython(base64Data);

      var userMSG = {
        messageObj: messageObj,
        username: username,
        userid: userid,
        userFile: userFile,
        audiobase64msg: base64Data,
      };

      socketRef.current.emit("user message", userMSG);
    } catch (error) {
      console.error("Error converting audio to base64:", error);
    }
  };

  //! Clean Up

  useEffect(() => {
    console.log("  mounted ");
    getStreamsAndPermissions();
    return () => {
      console.log(" un mounted ");

      if (audioStreamRef.current && audioStreamRef.current?.getTracks()) {
        console.log("cleaning  up  Audio stream ");
        audioStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const [currentUser, setCurrentUser] = useState(undefined);

  //!=================

  const { topic } = props;

  const user = JSON.parse(localStorage.getItem("user"));

  const username = user.userName;
  const userid = user.userId;

  const CHAT_SERVER_URL = `http://localhost:5000`;

  const userFile = username + "_" + userid.toString() + "_chat_history";

  const socketRef = useRef();

  const containerRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [messageType, setmessageType] = useState("message");

  const [minimized, setMinimized] = useState(false);
  const [maximized, setMaximized] = useState(false);

  const [send, setSend] = useState(false);

  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    socketRef.current = io.connect(CHAT_SERVER_URL);

    socketRef.current.on("connect", () => {
      console.log("Connected to server");
      socketRef.current.emit("join room chat", {
        username,
        userid,
        userFile,
      });
    });

    socketRef.current.on("bot response", (response) => {
      setMessages((prevMessages) => [...prevMessages, response]);
    });

    // socketRef.current.on("mental response", (response) => {
    //   setMentalStatus(response.toString());
    // });

    return () => {
      const user = JSON.parse(localStorage.getItem("user"));

      const username = user.userName;
      const userid = user.userId;
      const userFile = username + "_" + userid.toString() + "_chat_history";
      socketRef.current.emit("leave chat room", {
        username: username,
        userid: userid,
        userFile: userFile,
      });

      socketRef.current.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const minimizehandler = () => {
    // Handle the click event here
    if (minimized) {
      setUnreadCount(0);
    }

    setMinimized(!minimized);
    //console.log("Heart clicked!");
  };

  const renderMessages = () => {
    let i = 0;
    let messageCount = messages.length;
    let tempMessages = [];

    //console.log(" message count ", messageCount);

    while (i < messageCount) {
      let previous = messages[i - 1];
      let current = messages[i];

      //console.log(" message user ", current[0]);

      let next = messages[i + 1];
      let isMine = current[0].user.name === username;
      let currentMoment = moment(current[0].createdAt);
      let prevBySameAuthor = false;
      let nextBySameAuthor = false;
      let startsSequence = true;
      let endsSequence = true;
      let showTimestamp = true;

      if (previous) {
        let previousMoment = moment(previous[0].createdAt);
        let previousDuration = moment.duration(
          currentMoment.diff(previousMoment)
        );
        prevBySameAuthor = previous[0].user.name === current[0].user.name;

        if (prevBySameAuthor && previousDuration.as("hours") < 1) {
          startsSequence = false;
        }

        if (previousDuration.as("hours") < 1) {
          showTimestamp = false;
        }
      }

      if (next) {
        let nextMoment = moment(next.timestamp);
        let nextDuration = moment.duration(nextMoment.diff(currentMoment));
        nextBySameAuthor = next[0].user.name === current[0].user.name;

        if (nextBySameAuthor && nextDuration.as("hours") < 1) {
          endsSequence = false;
        }
      }

      tempMessages.push(
        <Message
          key={i}
          isMine={isMine}
          startsSequence={startsSequence}
          endsSequence={endsSequence}
          showTimestamp={showTimestamp}
          data={current[0]}
          messageType={messageType}
        />
      );

      // Proceed to the next message.
      i += 1;
    }

    return tempMessages;
  };

  const sendBtnHandler = () => {
    setSend(!send);
    scrollToBottom();
  };

  // const scrollToBottom = () => {
  //   if (containerRef.current) {
  //     containerRef.current.scrollTop = containerRef.current.scrollHeight;
  //   }
  // };

  const scrollToBottom = () => {
    if (containerRef.current) {
      const container = containerRef.current;
      const lastElement = container.lastElementChild;
      if (lastElement) {
        lastElement.scrollIntoView({ behavior: "smooth", block: "end" });
      }
    }
  };
  useEffect(() => {
    if (minimized) {
      setUnreadCount(messages.length);
    }

    scrollToBottom();
    //setMessages([...chatsData[viewIDRef.current]]);
  }, [messages.length]);

  return (
    <div
      className={`msgListWindow ${minimized ? "msgListMinimized" : ""} ${
        maximized ? "msgListMaximized" : ""
      }`}
    >
      <div className={minimized ? "msgListToolbarminimized" : "msgListToolbar"}>
        <Toolbar
          onclick={minimizehandler}
          title={topic}
          unreadCount={unreadCount}
          rightItems={[
            minimized ? (
              <ToolbarButton
                key="maximize"
                icon="ion-md-square-outline"
                onclick={minimizehandler}
              />
            ) : (
              <ToolbarButton
                key="minimize"
                icon="ion-md-remove"
                onclick={minimizehandler}
              />
            ),
          ]}
        />
      </div>

      <div className={minimized ? "msgListContentminiMized" : "msgListContent"}>
        <div className="msgListMessages" ref={containerRef}>
          {!minimized && renderMessages()}
        </div>
        <div
          className={minimized ? "msgListComposeminimized" : "msgListCompose"}
        >
          {!minimized && (
            <Compose
              rightItems={[
                <ToolbarButton
                  key="photo"
                  icon="ion-md-send"
                  onclick={sendBtnHandler}
                  ontouchStart={() => {}}
                  onmouseDown={() => {}}
                  ontouchEnd={() => {}}
                  onmouseUp={() => {}}
                />,
                <ToolbarButton
                  key="mic"
                  icon="ion-md-mic"
                  onclick={() => {}}
                  ontouchStart={handleStartRecording}
                  onmouseDown={handleStartRecording}
                  ontouchEnd={handleStopRecording}
                  onmouseUp={handleStopRecording}
                />,
              ]}
              socketRef={socketRef}
              sendBtnRef={send}
              sendBtnRefHandler={setSend}
              messages={messages}
              setMessages={setMessages}
            />
          )}
        </div>
      </div>
    </div>
  );
};
// ion-md-send
export default MessageList;
