import React, {
  useState,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import Swal from "sweetalert2";

import { MDBIcon } from "mdb-react-ui-kit";

import LocalDataStorage from "../LocalStorageHandler/LocalDataStorage";

import TextToSpeech from "../TexttoSpeech/TexttoSpeech";

import GeneralMCQService from "../../../webservices/GeneralMCQService";

// New

import Compose from "./Compose/Compose";
import Toolbar from "./Toolbar/Toolbar";
import ToolbarButton from "./ToolbarButton/ToolbarButton";
import Message from "./Message/Message";
import moment from "moment";

// import io from "socket.io-client";

import "./InterviewChat.css";

const InterviewChat = forwardRef(
  (
    {
      id,
      q,
      a1,
      a2,
      a3,
      a4,
      r,
      useImage,
      useTimeLimit,
      timeLimit,
      useMCQAnswers,
      useSpeechAnswer,
      useVideoAnswer,
      useRadioSelect,
      useAiResponse,
      //
      qData,
      //
      quectionIndex,
      index,
      setIndex,
      clearData,
      TestName,
      nameOftheTest,
      levelofmcq,
      previousQcaller,
      nextQcaller,
      useTranscripts,
      updateBoxDetails,
      viewSlidesFlags,
      socketRef,
      audioTik,
      audioStream,
      audioPermission,
      sendFrameRef,
      transcriptCaller,
      setIsAudioOn,
      setIsVideoOn,
      setIsGameQuizDone,
      finishTest,
    },
    ref
  ) => {
    useEffect(() => {
      if (qData.length > 0) {
        // console.log({ index }, qData, qData[index].useSpeechAnswer);
        setIsAudioOn(qData[index].useSpeechAnswer);

        scrollToBottom();
      }
    }, [qData, index]);

    const [quizdone, setquizdone] = useState(false);

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

    // const audioStreamRef = useRef(null);
    // const [audioPermission, setAudioPermission] = useState(false);

    // const [isAudioOn, setIsAudioOn] = useState(true);

    // const getStreamsAndPermissions = async () => {
    //   try {
    //     if (isAudioOn) {
    //       // Get audio stream
    //       const audioStream = await navigator.mediaDevices.getUserMedia({
    //         audio: true,
    //       });
    //       audioStreamRef.current = audioStream;
    //       setAudioPermission(true);
    //     }
    //   } catch (error) {
    //     console.error("Error accessing media devices:", error);
    //   }
    // };

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
      console.log(audioPermission);
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
      const media = new MediaRecorder(audioStream, {
        type: mimeType,
      });

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

    useEffect(() => {
      if (qData.length > 0) {
        //   socketRef2.current.on("bot response", (response) => {
        //     setMessages((prevMessages) => [...prevMessages, response]);
        //   });

        var messageObj = {
          _id: messageIdGenerator(),
          text: qData[index].q,
          audio: "",
          messageType: "message",
          createdAt: new Date(),
          user: {
            _id: 2,
            name: "Bot",
            avatar: "https://picsum.photos/id/668/200/300",
          },
        };

        let temparray = [];

        temparray.push(messageObj);

        setMessages((prevMessages) => [...prevMessages, temparray]);
      }

      // if (qData.length > 0 && index === qData.length - 1) {
      //   setquizdone(true);
      // }
    }, [qData, index]);

    // const handleAudioAnswer = async (audioUrl, audioBlob) => {
    //   try {
    //     const user = JSON.parse(localStorage.getItem("user"));

    //     const username = user.userName;
    //     const userid = user.userId;

    //     const userFile = username + "_" + userid.toString() + "_chat_history";

    //     if (!username || !userid) {
    //       return;
    //     }

    //     var messageObj = {
    //       _id: messageIdGenerator(),
    //       text: "",
    //       audio: audioUrl,
    //       messageType: "audio",
    //       createdAt: new Date(),
    //       user: {
    //         _id: userid,
    //         name: username,
    //         avatar: "https://picsum.photos/id/668/200/300",
    //       },
    //     };

    //     let temparray = [];

    //     temparray.push(messageObj);

    //     setMessages([...messages, temparray]);

    //     let base64Data;

    //     if (audioBlob) {
    //       base64Data = await convertAudioToBase64(audioBlob);
    //     } else if (audioUrl) {
    //       const response = await fetch(audioUrl);
    //       const blob = await response.blob();
    //       base64Data = await convertAudioToBase64(blob);
    //     }

    //     // Now you can send the base64Data to the Python side
    //     // sendBase64DataToPython(base64Data);

    //     var userMSG = {
    //       messageObj: messageObj,
    //       username: username,
    //       userid: userid,
    //       userFile: userFile,
    //       audiobase64msg: base64Data,
    //     };

    //     socketRef2.current.emit("user message", userMSG);
    //   } catch (error) {
    //     console.error("Error converting audio to base64:", error);
    //   }
    // };

    const updateStreamPoints = (Qindex, streamNumber, mark) => {
      // Retrieve from local storage
      const savedQuizObject = JSON.parse(localStorage.getItem("Test Info"));

      // Check if there's a saved object
      if (savedQuizObject) {
        // console.log("Quiz Object loaded from local storage:", index);

        if (streamNumber === 1) {
          savedQuizObject.TestDetails[Qindex].QuectionStreamOnePoints =
            savedQuizObject.TestDetails[Qindex].QuectionStreamOnePoints +
            (Number(mark) ? Number(mark) : 0);
        } else if (streamNumber === 2) {
          savedQuizObject.TestDetails[Qindex].QuectionStreamTwoPoints =
            savedQuizObject.TestDetails[Qindex].QuectionStreamTwoPoints +
            (Number(mark) ? Number(mark) : 0);
        } else if (streamNumber === 3) {
          savedQuizObject.TestDetails[Qindex].QuectionStreamThreePoints =
            savedQuizObject.TestDetails[Qindex].QuectionStreamThreePoints +
            (Number(mark) ? Number(mark) : 0);
        }

        LocalDataStorage.setLocalStorageObject(
          "Test Info",
          JSON.stringify(savedQuizObject)
        );
      } else {
        // console.log("No Quiz Object found in local storage");
      }
    };

    //! process recived answer

    function processSpeechAiQuestion(
      nameOftheTest,
      levelofmcq,
      reply,
      aireply,
      streamNumber,
      qindex,
      mark
    ) {
      // Do processing

      // AI interviews
      if (levelofmcq === "") {
        if (nameOftheTest === "AIOneQuection") {
          updateStreamPoints(qindex, streamNumber, mark);

          // airesponseRef.current[quectionIndex] = aireply;

          var messageObj = {
            _id: messageIdGenerator(),
            text: aireply,
            audio: "",
            messageType: "message",
            createdAt: new Date(),
            user: {
              _id: 2,
              name: "Bot",
              avatar: "https://picsum.photos/id/668/200/300",
            },
          };

          let temparray = [];

          temparray.push(messageObj);

          setMessages((prevMessages) => [...prevMessages, temparray]);
          scrollToBottom();
        }
      }
    }

    const updateMarks = (Qindex, mark) => {
      // Retrieve from local storage
      const savedQuizObject = JSON.parse(localStorage.getItem("Test Info"));

      // Check if there's a saved object
      if (savedQuizObject) {
        // console.log("Quiz Object loaded from local storage:", index);

        savedQuizObject.TestDetails[Qindex].QuectionMark = Number(mark);

        let score = 0;

        for (let i = 0; i < savedQuizObject.TestDetails.length; i++) {
          const _Mark = savedQuizObject.TestDetails[i].QuectionMark;
          score = score + _Mark;
        }

        savedQuizObject.pointsGot = score;

        let tempScore =
          savedQuizObject.pointsGot.toString() +
          "/" +
          savedQuizObject.pointsTotal.toString();

        savedQuizObject.Score = tempScore;

        LocalDataStorage.setLocalStorageObject(
          "Test Info",
          JSON.stringify(savedQuizObject)
        );
      } else {
        // console.log("No Quiz Object found in local storage");
      }
    };

    //! api voice
    const handleAudioAnswer = (audioUrl, audioBlob) => {
      console.log(" calling audio reply api ");
      try {
        Swal.fire({
          title: "Please wait!",
          allowEscapeKey: false,
          allowOutsideClick: false,
          width: "350px",
          didOpen: () => {
            Swal.showLoading();
          },
          willClose: () => {
            //console.log("hello");
          },
        });

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

        scrollToBottom();

        let name = user.userName;
        let id = user.userId;

        const qindex_temp = index;

        GeneralMCQService.answer_by_speech_aiinterview(
          name,
          id,
          nameOftheTest,
          levelofmcq,
          qindex_temp,
          qData[index].r,
          audioBlob
        ).then(
          (response) => {
            const data = response.data;

            const {
              answerProceesed,
              mark,
              aireply,
              streamNumber,
              qindex,
              isNextQ,
            } = data;

            // console.log(" t ", qindex_temp, isNextQ);

            if (qindex_temp === Number(qindex) && isNextQ) {
              console.log("  Audio reply api response => ", data);

              processSpeechAiQuestion(
                nameOftheTest,
                levelofmcq,
                answerProceesed,
                aireply,
                streamNumber,
                Number(qindex),
                mark
              );

              updateMarks(Number(qindex), mark);
            }

            if (isNextQ) {
              if (qData.length - 1  === index) { //qData.length - 1 
                //qData.length - 1
                //finish the quiz
                setIsGameQuizDone(true);

                setquizdone(true);
                // finishTest();
              } else {
                nextQcaller(index);
              }
            } else {
              var messageObj = {
                _id: messageIdGenerator(),
                text: aireply + qData[index].q,
                audio: "",
                messageType: "message",
                createdAt: new Date(),
                user: {
                  _id: 2,
                  name: "Bot",
                  avatar: "https://picsum.photos/id/668/200/300",
                },
              };

              let temparray = [];

              temparray.push(messageObj);

              setMessages((prevMessages) => [...prevMessages, temparray]);
            }

            scrollToBottom();

            Swal.close();
          },
          (error) => {
            const resMessage =
              (error.response &&
                error.response.data &&
                error.response.data.message) ||
              error.message ||
              error.toString();

            console.log(resMessage);

            Swal.close();

            Swal.fire({
              icon: "error",
              title: "Audio processing error",
              text: resMessage,
              confirmButtonText: "OK",
              confirmButtonColor: "red",
              allowOutsideClick: false,
              width: "400px",
              willClose: () => { },
            });
          }
        );
      } catch (error) {
        console.error("Error hanlde audio:", error);
      }
    };

    //! Clean Up

    // useEffect(() => {
    //   console.log("  mounted ");
    //   return () => {
    //     console.log(" un mounted ");

    //     if (audioStreamRef.current && audioStreamRef.current?.getTracks()) {
    //       console.log("cleaning  up  Audio stream ");
    //       audioStreamRef.current.getTracks().forEach((track) => track.stop());
    //     }
    //   };
    // }, []);

    const [currentUser, setCurrentUser] = useState(undefined);

    //!=================

    const user = JSON.parse(localStorage.getItem("user"));

    const username = user.userName;
    const userid = user.userId;

    const CHAT_SERVER_URL = `http://localhost:5000`;

    const userFile = username + "_" + userid.toString() + "_chat_history";

    const socketRef2 = useRef();

    const containerRef = useRef(null);

    const [messages, setMessages] = useState([]);
    const [messageType, setmessageType] = useState("message");

    const [minimized, setMinimized] = useState(false);
    const [maximized, setMaximized] = useState(false);

    const [send, setSend] = useState(false);

    const [unreadCount, setUnreadCount] = useState(0);

    // useEffect(() => {
    //   socketRef2.current = io.connect(CHAT_SERVER_URL);

    //   socketRef2.current.on("connect", () => {
    //     console.log("Connected to server");
    //     socketRef2.current.emit("join room chat", {
    //       username,
    //       userid,
    //       userFile,
    //     });
    //   });

    //   socketRef2.current.on("bot response", (response) => {
    //     setMessages((prevMessages) => [...prevMessages, response]);
    //   });

    //   // socketRef2.current.on("mental response", (response) => {
    //   //   setMentalStatus(response.toString());
    //   // });

    //   return () => {
    //     const user = JSON.parse(localStorage.getItem("user"));

    //     const username = user.userName;
    //     const userid = user.userId;
    //     const userFile = username + "_" + userid.toString() + "_chat_history";
    //     socketRef2.current.emit("leave chat room", {
    //       username: username,
    //       userid: userid,
    //       userFile: userFile,
    //     });

    //     socketRef2.current.disconnect();
    //   };
    //   // eslint-disable-next-line react-hooks/exhaustive-deps
    // }, []);

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

        if (containerRef.current) {
          containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
      }
    };
    useEffect(() => {
      if (minimized) {
        setUnreadCount(messages.length);
      }

      scrollToBottom();
      //setMessages([...chatsData[viewIDRef.current]]);
    }, [messages.length, index]);

    //!=====================

    //!  key handlings

    const [isRKeyPressed, setIsRKeyPressed] = useState(false);
    const [isFKeyPressed, setIsFKeyPressed] = useState(false);

    const handleKeyDown = (event) => {
      switch (event.key) {
        case "r":
          if (!isRKeyPressed) {
            handleRKeyPress();
          }
          break;
        case "f":
          if (!isFKeyPressed) {
            handleFKeyPress();
          }
          break;

        default:
          // Handle other keys if needed
          break;
      }
    };

    const handleKeyUp = (event) => {
      switch (event.key) {
        case "r":
          handleRKeyReleased();
          break;
        case "f":
          handleFKeyReleased();
          break;
        default:
          // Handle other keys if needed
          break;
      }
    };

    const handleFKeyPress = () => {
      console.log("F key  pressed");
      setIsFKeyPressed(true);
    };

    const handleFKeyReleased = () => {
      console.log("F key  released");
      setIsFKeyPressed(false);

      if (buttonRef.current) {
        buttonRef.current.click();
      }
    };

    const buttonRef = useRef(null);

    const handleRKeyPress = () => {
      console.log("R key  pressed");
      setIsRKeyPressed(true);
      triggerTouchStart();
    };

    const handleRKeyReleased = () => {
      console.log("R key  released");
      setIsRKeyPressed(false);

      triggerTouchEnd();
    };

    //======

    // Function to programmatically trigger onTouchStart event
    const triggerTouchStart = () => {
      // Check if the ref has been initialized
      if (buttonRef.current) {
        // buttonRef.current.classList.add("active");

        const mouseDownEvent = new MouseEvent("mousedown", {
          bubbles: true,
          cancelable: true,
          view: window,
        });

        // Dispatch the mouse event on the button
        buttonRef.current.dispatchEvent(mouseDownEvent);
      }
    };

    // Function to programmatically trigger onTouchEnd event
    const triggerTouchEnd = () => {
      // Check if the ref has been initialized
      if (buttonRef.current) {
        buttonRef.current.classList.remove("active");

        const mouseUpEvent = new MouseEvent("mouseup", {
          bubbles: true,
          cancelable: true,
          view: window,
        });

        // Dispatch the mouse event on the button
        buttonRef.current.dispatchEvent(mouseUpEvent);
      }
    };

    var content = (
      <>
        <div
          className="InterviewChatScreen"
          tabIndex="0"
          onKeyDown={handleKeyDown}
          onKeyUp={handleKeyUp}
        >
          <div className="msgListMessages2" ref={containerRef}>
            {!minimized && renderMessages()}
          </div>
          <div className="msgListCompose2">
            {!minimized && (
              <Compose
                rightItems={[
                  // <ToolbarButton
                  //   key="photo"
                  //   icon="ion-md-send"
                  //   onclick={sendBtnHandler}
                  //   ontouchStart={() => {}}
                  //   onmouseDown={() => {}}
                  //   ontouchEnd={() => {}}
                  //   onmouseUp={() => {}}
                  // />,

                  <ToolbarButton
                    buttonRef={buttonRef}
                    key="mic"
                    icon={
                      quizdone
                        ? "ion-md-checkmark-circle-outline"
                        : "ion-md-mic"
                    }
                    onclick={
                      quizdone
                        ? finishTest
                        : () => {
                          console.log("test");

                          // Swal.fire({
                          //   icon: "error",
                          //   title: "Cannot Finish Interview",
                          //   text: "please answer all quections",
                          //   confirmButtonText: "OK",
                          //   confirmButtonColor: "red",
                          //   allowOutsideClick: false,
                          //   width: "400px",
                          //   willClose: () => {},
                          // });
                        }
                    }
                    quizdone={quizdone}
                    ontouchStart={
                      quizdone
                        ? () => { }
                        : () => {
                          handleStartRecording();
                          if (buttonRef.current) {
                            buttonRef.current.classList.add("active");
                          }
                        }
                    }
                    onmouseDown={
                      quizdone
                        ? () => { }
                        : () => {
                          handleStartRecording();
                          if (buttonRef.current) {
                            buttonRef.current.classList.add("active");
                          }
                        }
                    }
                    ontouchEnd={
                      quizdone
                        ? () => { }
                        : () => {
                          handleStopRecording();
                          if (buttonRef.current) {
                            buttonRef.current.classList.remove("active");
                          }
                        }
                    }
                    onmouseUp={
                      quizdone
                        ? () => { }
                        : () => {
                          handleStopRecording();
                          if (buttonRef.current) {
                            buttonRef.current.classList.remove("active");
                          }
                        }
                    }
                  />,
                ]}
                socketRef={socketRef2}
                sendBtnRef={send}
                sendBtnRefHandler={setSend}
                messages={messages}
                setMessages={setMessages}
              />
            )}
          </div>
        </div>
      </>
    );

    return content;
  }
);

export default InterviewChat;
