import React, { useState, useEffect, useRef, createRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";

import Swal from "sweetalert2";

import { format } from "date-fns";

import io from "socket.io-client";

import Header from "../Header/Header";
import Footer from "../Footer/Footer";

import LocalDataStorage from "../../basiccomponents/LocalStorageHandler/LocalDataStorage";

import MCQModelGeneral from "../../basiccomponents/MCQModelGeneral/MCQModelGeneral";

import GeneralMCQService from "../../../webservices/GeneralMCQService";

import tiksound from "../../../assets/Audios/tiktik1.mp3";

import InterviewChat from "../../basiccomponents/InterviewChat/InterviewChat";

import "./MCQGeneralScreen.css";

const BoxComponent = ({
  number,
  backgroundColor,
  handleBoxClick,
  isDisabled,
}) => {
  const boxStyle = {
    border: "2px solid #000",
    backgroundColor: backgroundColor || "#ffffff",
    color: backgroundColor === "#333" ? "#ffff" : "#000",
    pointerEvents: isDisabled ? "none" : "auto",
    opacity: isDisabled ? 0.5 : 1,
  };

  return (
    <div className="stat-box" style={boxStyle} onClick={handleBoxClick}>
      {number}
    </div>
  );
};

const MCQGeneralScreen = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const nameOftheTest = location.state.nameOftheTest
    ? location.state.nameOftheTest
    : ""; // name of aiques or streamname

  // console.log(location.state, nameOftheTest);

  const isLevelMcq = location.state.isLevelMcq
    ? location.state.isLevelMcq
    : false;

  const levelofmcq = location.state.levelofmcq ? location.state.levelofmcq : ""; // something like q1 , qq2 .. q4

  let FinalTestName = nameOftheTest;

  if (isLevelMcq) {
    FinalTestName += "-";
    FinalTestName += levelofmcq;
  }

  //console.log("FinalTestName ", FinalTestName);

  //! Transcripts hanlde

  const currentTranscript = useRef([]);

  const {
    transcript,
    interimTranscript,
    finalTranscript,
    resetTranscript,
    listening,
  } = useSpeechRecognition();

  useEffect(() => {
    if (finalTranscript !== "") {
      // console.log("Got final result:", finalTranscript);

      currentTranscript.current[index] = finalTranscript;
    }
  }, [interimTranscript, finalTranscript]);

  if (!SpeechRecognition.browserSupportsSpeechRecognition()) {
    console.log(
      "Your browser does not support speech recognition software! Try Chrome desktop, maybe?"
    );
    // alert(
    //   "Your browser does not support speech recognition software! Try Chrome desktop, maybe?"
    // );
  }

  const listenContinuously = () => {
    SpeechRecognition.startListening({
      continuous: true,
      language: "en-GB",
    });
  };

  const handleStopListening = () => {
    SpeechRecognition.stopListening();
  };

  const transcriptCaller = {
    listenContinuously: listenContinuously,
    handleStopListening: handleStopListening,
    resetTranscript: resetTranscript,
    finalTranscript: currentTranscript.current,
  };

  //! Audio / Video  handles

  const [audioTik, setAudioTik] = useState(new Audio(tiksound));

  const audioStreamRef = useRef(null);
  const videoStreamRef = useRef(null);

  const [audioPermission, setAudioPermission] = useState(false);
  const [videoPermission, setVideoPermission] = useState(false);

  const [isVideoOn, setIsVideoOn] = useState(false);
  const [isAudioOn, setIsAudioOn] = useState(false);

  const videoRef = useRef();

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

      if (isVideoOn) {
        // Get video stream
        const videoStream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        videoStreamRef.current = videoStream;
        setVideoPermission(true);

        // Assign the video stream to the video element
        if (videoRef.current) {
          videoRef.current.srcObject = videoStream;
        }
      }
    } catch (error) {
      console.error("Error accessing media devices:", error);
    }
  };

  const animationRef = useRef();
  const lastFrameTimeRef = useRef(0);
  const prevFrameTimeRef = useRef(0);

  const stopStreaming = () => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
  };

  const indexRef = useRef(0);
  const sendFrameRef = useRef(true);
  const sendImageRef = useRef([]);

  const [isGamequizDone, setIsGameQuizDone] = useState(false);

  useEffect(() => {
    if (isGamequizDone) {
      console.log("test call");
      stopStreaming();
      // finishTest2();
    }
  }, [isGamequizDone]);

  function fpsToMs(fps) {
    if (typeof fps !== "number" || fps <= 0) {
      throw new Error("FPS must be a positive number");
    }

    return 1000 / fps;
  }

  const startStreaming = () => {
    if (videoStreamRef.current) {
      console.log("ready to  streaming video");
      const videoTrack = videoStreamRef.current.getVideoTracks()[0];

      // Import the necessary classes
      const { ImageCapture } = window;

      // Assuming videoTrack is a MediaStreamTrack
      const imageCapture = new ImageCapture(videoTrack);

      const handleFrame = async (timestamp) => {
        if (Number(timestamp - lastFrameTimeRef.current) >= fpsToMs(15)) {
          // console.log(
          //   " testing calling speed ",
          //   timestamp,
          //   lastFrameTimeRef.current,
          //   timestamp - lastFrameTimeRef.current,
          //   fpsToMs(15)
          // );
          // Limit to approximately 15 frames per second
          lastFrameTimeRef.current = timestamp;
          // const imageCapture = new ImageCapture(videoTrack);
          try {
            const bitmap = await imageCapture.grabFrame();
            // Check if the grabbed frame is valid
            if (!bitmap) {
              console.error("Error: Grabbed frame is undefined");
              // You might want to handle this error case specifically
              return;
            }

            // console.log("Image getting ");

            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            canvas.width = bitmap.width;
            canvas.height = bitmap.height;
            ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

            const imageData = canvas.toDataURL("image/jpeg");

            sendImageRef.current = imageData;

            handleSendStreamSockets();

            // Request the next animation frame
            // animationRef.current = requestAnimationFrame(handleFrame);
          } catch (error) {
            console.error("Error grabbing frame:", error);
            // requestAnimationFrame(handleFrame);
          }
        }

        animationRef.current = requestAnimationFrame(handleFrame);
      };

      handleFrame();
    }
  };

  const handleSendStreamSockets = () => {
    const user = JSON.parse(localStorage.getItem("user"));

    let name = user.userName;
    let id = user.userId;

    const userCam = name + "_" + id.toString() + "_camera";

    console.log("sending video frame  ", sendFrameRef.current, index);

    //sendFrameRef.current
    if (socketRef.current && sendFrameRef.current) {
      if (nameOftheTest === "StreamThree" && levelofmcq === "q4") {
        socketRef.current.emit("video stream", {
          name: name,
          id: id,
          userCam: userCam,
          frame: sendImageRef.current,
          nameOftheTest: nameOftheTest,
          levelofmcq: levelofmcq,
          rightAnswer: qData[indexRef.current].r,
          queindex: indexRef.current,
        });
      }

      if (nameOftheTest === "StreamTwo" && levelofmcq === "q4") {
        socketRef.current.emit("video stream", {
          name: name,
          id: id,
          userCam: userCam,
          frame: sendImageRef.current,
          nameOftheTest: nameOftheTest,
          levelofmcq: levelofmcq,
          rightAnswer: qData[indexRef.current].r,
          queindex: indexRef.current,
        });
      }
      if (nameOftheTest === "StreamOne" && levelofmcq === "q4") {
        socketRef.current.emit("video stream", {
          name: name,
          id: id,
          userCam: userCam,
          frame: sendImageRef.current,
          nameOftheTest: nameOftheTest,
          levelofmcq: levelofmcq,
          rightAnswer: qData[indexRef.current].r,
          queindex: indexRef.current,
        });
      } else if (nameOftheTest === "FinalQuection" && levelofmcq === "") {
        socketRef.current.emit("video stream", {
          name: name,
          id: id,
          userCam: userCam,
          frame: sendImageRef.current,
          nameOftheTest: nameOftheTest,
          levelofmcq: levelofmcq,
          rightAnswer: qData[indexRef.current].r,
          queindex: indexRef.current,
        });
      }

      sendFrameRef.current = false;
    }
  };

  useEffect(() => {
    // console.log("TEST CODE ");
  }, [sendImageRef.current]);

  useEffect(() => {
    getStreamsAndPermissions();

    if (!isVideoOn) {
      stopStreaming();
    }

    if (!isAudioOn) {
    }
  }, [isAudioOn, isVideoOn]);

  //! Clean Up

  useEffect(() => {
    // console.log(" mcq mounted ");
    return () => {
      // console.log(" mcq un mounted ");

      if (audioStreamRef.current && audioStreamRef.current?.getTracks()) {
        console.log("cleaning  up  Audio stream ");
        audioStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (videoStreamRef.current && videoStreamRef.current?.getTracks()) {
        console.log("cleaning  up  Video  stream");
        videoStreamRef.current.getTracks().forEach((track) => track.stop());
      }

      stopStreaming();

      handleStopListening();
    };
  }, []);

  // Check if camera needed to open

  useEffect(() => {
    if (videoStreamRef.current) {
      if (nameOftheTest === "StreamThree" && levelofmcq === "q4") {
        startStreaming();
      } else if (nameOftheTest === "StreamTwo" && levelofmcq === "q4") {
        startStreaming();
      } else if (nameOftheTest === "StreamOne" && levelofmcq === "q4") {
        startStreaming();
      } else if (nameOftheTest === "FinalQuection" && levelofmcq === "") {
        startStreaming();
      }
    }
  }, [videoStreamRef.current]);

  //!===

  const [currentUser, setCurrentUser] = useState(undefined);

  const [userNAME, setUserName] = useState(undefined);
  const [userID, setUserID] = useState(undefined);
  const [userCamRooom, setUserCamroom] = useState(undefined);

  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));

      if (user) {
        setCurrentUser(user);
        setUserName(user.userName);
        setUserID(user.userId);

        const userCam =
          user.userName + "_" + user.userId.toString() + "_camera";

        setUserCamroom(userCam);
      }

      // Continue processing with the 'user' object
    } catch (error) {
      console.error("Error parsing user JSON data:", error);
      // Handle the error or provide a default value
    }
  }, []);

  //! avoid refrsh page

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      const message =
        "Are you sure you want to leave? Your unsaved changes will be lost.";
      event.returnValue = message;
      return message;
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  //! SOCKET IO

  const CHAT_SERVER_URL = `http://localhost:5000`;

  const socketRef = useRef();

  useEffect(() => {
    if (currentUser) {
      socketRef.current = io.connect(CHAT_SERVER_URL);

      socketRef.current.on("connect", () => {
        console.log("Connected to server");

        socketRef.current.emit("join camera room", {
          username: userNAME,
          userid: userID,
          userCam: userCamRooom,
        });
      });

      socketRef.current.on("camera room response", (response) => {
        //setMessages((prevMessages) => GiftedChat.append(prevMessages, response));
        // console.log(" camera res ", response);
      });
    }

    return () => {
      if (currentUser) {
        socketRef.current.emit("leave camera room", {
          username: userNAME,
          userid: userID,
          userCam: userCamRooom,
        });
        socketRef.current.disconnect();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  //! =================

  const componentRefs = useRef(
    Array.from({ length: 10 }, () => React.createRef())
  );

  // Function to scroll to a specific component
  const scrollToComponent = (index) => {
    if (componentRefs.current[index] && componentRefs.current[index].current) {
      componentRefs.current[index].current.scrollIntoView({
        behavior: "smooth",
      });
    }
  };

  const isoverflow = location.state.isoverflow
    ? location.state.isoverflow
    : false;

  const initialValue = "#ffff";

  const [boxFlags, setBoxFlags] = useState({
    box1: initialValue,
    box2: initialValue,
    box3: initialValue,
    box4: initialValue,
    box5: initialValue,
    box6: initialValue,
    box7: initialValue,
    box8: initialValue,
    box9: initialValue,
    box10: initialValue,
  });

  const [boxDisalability, setBoxDisalability] = useState({
    box1: false,
    box2: true,
    box3: true,
    box4: true,
    box5: true,
    box6: true,
    box7: true,
    box8: true,
    box9: true,
    box10: true,
  });

  const slideAllView = {
    q1: true,
    q2: true,
    q3: true,
    q4: true,
    q5: true,
    q6: true,
    q7: true,
    q8: true,
    q9: true,
    q10: true,
  };

  const slideOnebyOne = {
    q1: true,
    q2: false,
    q3: false,
    q4: false,
    q5: false,
    q6: false,
    q7: false,
    q8: false,
    q9: false,
    q10: false,
  };

  const initialValueSlide = location.state.qonebyone
    ? slideOnebyOne
    : slideAllView;

  const [viewSlidesFlags, setViewSlidesFlags] = useState(initialValueSlide);

  // You can update the state using the spread operator
  const updateslideDetails = (qid, newValue) => {
    //console.log(qid, newValue);

    //let boxKey = "box1";

    switch (qid) {
      case 0:
        setViewSlidesFlags((prevVariables) => ({
          ...prevVariables,
          q1: newValue,
        }));
        break;
      case 1:
        setViewSlidesFlags((prevVariables) => ({
          ...prevVariables,
          q2: newValue,
        }));
        break;
      case 2:
        setViewSlidesFlags((prevVariables) => ({
          ...prevVariables,
          q3: newValue,
        }));
        break;
      case 3:
        setViewSlidesFlags((prevVariables) => ({
          ...prevVariables,
          q4: newValue,
        }));
        break;
      case 4:
        setViewSlidesFlags((prevVariables) => ({
          ...prevVariables,
          q5: newValue,
        }));
        break;
      case 5:
        setViewSlidesFlags((prevVariables) => ({
          ...prevVariables,
          q6: newValue,
        }));
        break;
      case 6:
        setViewSlidesFlags((prevVariables) => ({
          ...prevVariables,
          q7: newValue,
        }));
        break;
      case 7:
        setViewSlidesFlags((prevVariables) => ({
          ...prevVariables,
          q8: newValue,
        }));
        break;
      case 8:
        setViewSlidesFlags((prevVariables) => ({
          ...prevVariables,
          q9: newValue,
        }));
        break;
      case 9:
        setViewSlidesFlags((prevVariables) => ({
          ...prevVariables,
          q10: newValue,
        }));
        break;
      default:
        break;
    }

    //console.log(boxFlags);
  };

  // You can update the state using the spread operator
  const updateBoxDetails = (boxid, newValue) => {
    //console.log(boxid, newValue);

    //let boxKey = "box1";

    switch (boxid) {
      case 0:
        setBoxFlags((prevVariables) => ({
          ...prevVariables,
          box1: newValue,
        }));
        break;
      case 1:
        setBoxFlags((prevVariables) => ({
          ...prevVariables,
          box2: newValue,
        }));
        break;
      case 2:
        setBoxFlags((prevVariables) => ({
          ...prevVariables,
          box3: newValue,
        }));
        break;
      case 3:
        setBoxFlags((prevVariables) => ({
          ...prevVariables,
          box4: newValue,
        }));
        break;
      case 4:
        setBoxFlags((prevVariables) => ({
          ...prevVariables,
          box5: newValue,
        }));
        break;
      case 5:
        setBoxFlags((prevVariables) => ({
          ...prevVariables,
          box6: newValue,
        }));
        break;
      case 6:
        setBoxFlags((prevVariables) => ({
          ...prevVariables,
          box7: newValue,
        }));
        break;
      case 7:
        setBoxFlags((prevVariables) => ({
          ...prevVariables,
          box8: newValue,
        }));
        break;
      case 8:
        setBoxFlags((prevVariables) => ({
          ...prevVariables,
          box9: newValue,
        }));
        break;
      case 9:
        setBoxFlags((prevVariables) => ({
          ...prevVariables,
          box10: newValue,
        }));
        break;
      default:
        break;
    }

    //console.log(boxFlags);
  };

  const updateBoxDisabilty = (boxid, newValue) => {
    //console.log(boxid, newValue);

    //let boxKey = "box1";

    switch (boxid) {
      case 0:
        setBoxDisalability((prevVariables) => ({
          ...prevVariables,
          box1: newValue,
        }));
        break;
      case 1:
        setBoxDisalability((prevVariables) => ({
          ...prevVariables,
          box2: newValue,
        }));
        break;
      case 2:
        setBoxDisalability((prevVariables) => ({
          ...prevVariables,
          box3: newValue,
        }));
        break;
      case 3:
        setBoxDisalability((prevVariables) => ({
          ...prevVariables,
          box4: newValue,
        }));
        break;
      case 4:
        setBoxDisalability((prevVariables) => ({
          ...prevVariables,
          box5: newValue,
        }));
        break;
      case 5:
        setBoxDisalability((prevVariables) => ({
          ...prevVariables,
          box6: newValue,
        }));
        break;
      case 6:
        setBoxDisalability((prevVariables) => ({
          ...prevVariables,
          box7: newValue,
        }));
        break;
      case 7:
        setBoxDisalability((prevVariables) => ({
          ...prevVariables,
          box8: newValue,
        }));
        break;
      case 8:
        setBoxDisalability((prevVariables) => ({
          ...prevVariables,
          box9: newValue,
        }));
        break;
      case 9:
        setBoxDisalability((prevVariables) => ({
          ...prevVariables,
          box10: newValue,
        }));
        break;
      default:
        break;
    }

    //console.log(boxFlags);
  };

  const boxesData = [
    {
      id: 1,
      number: 1,
      backgroundColor: boxFlags.box1,
      isDisabled: boxDisalability.box1,
    },
    {
      id: 2,
      number: 2,
      backgroundColor: boxFlags.box2,
      isDisabled: boxDisalability.box2,
    },
    {
      id: 3,
      number: 3,
      backgroundColor: boxFlags.box3,
      isDisabled: boxDisalability.box3,
    },
    {
      id: 4,
      number: 4,
      backgroundColor: boxFlags.box4,
      isDisabled: boxDisalability.box4,
    },
    {
      id: 5,
      number: 5,
      backgroundColor: boxFlags.box5,
      isDisabled: boxDisalability.box5,
    },
    {
      id: 6,
      number: 6,
      backgroundColor: boxFlags.box6,
      isDisabled: boxDisalability.box6,
    },
    {
      id: 7,
      number: 7,
      backgroundColor: boxFlags.box7,
      isDisabled: boxDisalability.box7,
    },
    {
      id: 8,
      number: 8,
      backgroundColor: boxFlags.box8,
      isDisabled: boxDisalability.box8,
    },
    {
      id: 9,
      number: 9,
      backgroundColor: boxFlags.box9,
      isDisabled: boxDisalability.box9,
    },
    {
      id: 10,
      number: 10,
      backgroundColor: boxFlags.box10,
      isDisabled: boxDisalability.box10,
    },
    // Add more data as needed
  ];

  //! load quection data
  const [qData, setQData] = useState([]);

  const [loading, setLoading] = useState(true);

  var loaderWheel = (
    <>
      <div className="loaderWarapper">
        <div className="loader">
          <div className="loader-wheel"></div>
          <div className="loader-text"></div>
        </div>
      </div>
    </>
  );

  //* Load Quections

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  //* Load Dynamic Quections

  const loadQuectionsApi = async () => {
    // return;
    setLoading(true);

    Swal.fire({
      title: "Please wait!",
      text: "Please wait loading Quections!!",
      allowEscapeKey: false,
      allowOutsideClick: false,
      width: "350px",
      didOpen: () => {
        Swal.showLoading();
      },
      willClose: () => {
        ////console.log("hello");
      },
    });

    let mcq_que_path = "";

    mcq_que_path =
      process.env.PUBLIC_URL +
      "/McqGeneralQuections/" +
      nameOftheTest +
      "/" +
      nameOftheTest +
      ".json";

    if (isLevelMcq) {
      mcq_que_path =
        process.env.PUBLIC_URL +
        "/McqGeneralQuections/" +
        nameOftheTest +
        "/" +
        levelofmcq +
        ".json";
    }

    if (nameOftheTest === "AITwoQuection") {
      let selectedStream = location.state.streamAItwo;

      if (selectedStream === "StreamOne") {
        mcq_que_path =
          process.env.PUBLIC_URL +
          "/McqGeneralQuections/" +
          nameOftheTest +
          "/1/" +
          nameOftheTest +
          ".json";
      } else if (selectedStream === "StreamTwo") {
        mcq_que_path =
          process.env.PUBLIC_URL +
          "/McqGeneralQuections/" +
          nameOftheTest +
          "/2/" +
          nameOftheTest +
          ".json";
      } else if (selectedStream === "StreamThree") {
        mcq_que_path =
          process.env.PUBLIC_URL +
          "/McqGeneralQuections/" +
          nameOftheTest +
          "/3/" +
          nameOftheTest +
          ".json";
      }
    }

    if (nameOftheTest === "FinalQuection") {
      if (location.state.streamSelected === "StreamOne") {
        mcq_que_path =
          process.env.PUBLIC_URL +
          "/McqGeneralQuections/" +
          nameOftheTest +
          "/FinalQuectionOne.json";
      } else if (location.state.streamSelected === "StreamTwo") {
        mcq_que_path =
          process.env.PUBLIC_URL +
          "/McqGeneralQuections/" +
          nameOftheTest +
          "/FinalQuectionTwo.json";
      } else if (location.state.streamSelected === "StreamThree") {
        mcq_que_path =
          process.env.PUBLIC_URL +
          "/McqGeneralQuections/" +
          nameOftheTest +
          "/FinalQuectionThree.json";
      }
    }

    GeneralMCQService.loadGeneralMCQ(mcq_que_path).then(
      (response) => {
        const data = response.data;

        //console.log(" res data", data);

        if (data && data.length > 0) {
          setQData(data);
          setLoading(false);

          try {
            // Retrieve from local storage
            const savedQuizObject = JSON.parse(
              localStorage.getItem("Test Info")
            );

            // Check if there's a saved object
            if (savedQuizObject) {
              // console.log(
              //   "Quiz Object loaded from local storage:",
              //   savedQuizObject
              // );

              //! remove the object only if he done the quiz

              // if (savedQuizObject.TestDone) {

              // console.log("Removing quiz info ");

              try {
                LocalDataStorage.removeLocalStorageObject("Test Info");

                // Continue processing with the 'user' object
              } catch (error) {
                console.error("Error removing test info data:", error);
                // Handle the error or provide a default value
              }

              //! so deleted old one so created new one

              var quizObject = {};

              quizObject.TestName = nameOftheTest;
              quizObject.TestLevel = isLevelMcq ? levelofmcq : "";
              quizObject.TestTimeSeconds = 0;
              quizObject.TeststartTime = format(
                new Date(),
                "yyyy-MM-dd HH:mm:ss"
              );
              quizObject.TestendTime = format(
                new Date(),
                "yyyy-MM-dd HH:mm:ss"
              );
              quizObject.TestDetails = [];
              quizObject.TestDone = 0;
              quizObject.NumberOfAttempts = 0;
              quizObject.Score = "0/10";
              quizObject.pointsGot = 0;
              quizObject.pointsTotal = data.length;
              quizObject.TestCrrIndex = 0;
              quizObject.TestFinalFacialScore = "0/10";

              //! Stream points
              quizObject.StreamOnePoints = 0;
              quizObject.StreamTwoPoints = 0;
              quizObject.StreamThreePoints = 0;

              for (let i = 0; i < data.length; i++) {
                const crrQuectionObject = {};
                var crr_q_id = "Q_" + (i + 1);

                crrQuectionObject.QuectionId = crr_q_id;
                crrQuectionObject.QuectionClicks = 0;
                crrQuectionObject.QuectionTimeSeconds = 15;
                crrQuectionObject.QuectionTimeRemainSeconds = 15;
                crrQuectionObject.QuectionChecked1 = 0;
                crrQuectionObject.QuectionChecked2 = 0;
                crrQuectionObject.QuectionChecked3 = 0;
                crrQuectionObject.QuectionChecked4 = 0;
                crrQuectionObject.QuectionRealAnswer = data[i].r;
                crrQuectionObject.QuectionUserAnswer = "";
                crrQuectionObject.QuectionAIResponse = ""; //! can be a number or text
                crrQuectionObject.QuectionUserVoice = "";
                crrQuectionObject.QuectionMark = 0;

                //! Stream points
                crrQuectionObject.QuectionStreamOnePoints = 0;
                crrQuectionObject.QuectionStreamTwoPoints = 0;
                crrQuectionObject.QuectionStreamThreePoints = 0;

                quizObject.TestDetails.push(crrQuectionObject);
              }

              // console.log(" test ", JSON.stringify(quizObject));

              try {
                LocalDataStorage.setLocalStorageObject(
                  "Test Info",
                  JSON.stringify(quizObject)
                );

                // Continue processing with the 'user' object
              } catch (error) {
                console.error("Error setting  test info data:", error);
                // Handle the error or provide a default value
              }

              // }
            } else {
              //console.log("No Quiz Object found in local storage");

              //! so no object then create one

              var quizObject = {};

              quizObject.TestName = nameOftheTest;
              quizObject.TestLevel = isLevelMcq ? levelofmcq : "";
              quizObject.TestTimeSeconds = 0;
              quizObject.TeststartTime = format(
                new Date(),
                "yyyy-MM-dd HH:mm:ss"
              );
              quizObject.TestendTime = format(
                new Date(),
                "yyyy-MM-dd HH:mm:ss"
              );
              quizObject.TestDetails = [];
              quizObject.TestDone = 0;
              quizObject.NumberOfAttempts = 0;
              quizObject.Score = "0/10";
              quizObject.pointsGot = 0;
              quizObject.pointsTotal = data.length;
              quizObject.TestCrrIndex = 0;
              quizObject.TestFinalFacialScore = "0/10";

              //! Stream points
              quizObject.StreamOnePoints = 0;
              quizObject.StreamTwoPoints = 0;
              quizObject.StreamThreePoints = 0;

              for (let i = 0; i < data.length; i++) {
                const crrQuectionObject = {};
                var crr_q_id = "Q_" + (i + 1);

                crrQuectionObject.QuectionId = crr_q_id;
                crrQuectionObject.QuectionClicks = 0;
                crrQuectionObject.QuectionTimeSeconds = 15;
                crrQuectionObject.QuectionTimeRemainSeconds = 15;
                crrQuectionObject.QuectionChecked1 = 0;
                crrQuectionObject.QuectionChecked2 = 0;
                crrQuectionObject.QuectionChecked3 = 0;
                crrQuectionObject.QuectionChecked4 = 0;
                crrQuectionObject.QuectionRealAnswer = data[i].r;
                crrQuectionObject.QuectionUserAnswer = "";
                crrQuectionObject.QuectionAIResponse = ""; //! can be a number or text
                crrQuectionObject.QuectionUserVoice = "";
                crrQuectionObject.QuectionMark = 0;

                //! Stream points
                crrQuectionObject.QuectionStreamOnePoints = 0;
                crrQuectionObject.QuectionStreamTwoPoints = 0;
                crrQuectionObject.QuectionStreamThreePoints = 0;

                quizObject.TestDetails.push(crrQuectionObject);
              }

              // console.log(" test ", JSON.stringify(quizObject));

              try {
                LocalDataStorage.setLocalStorageObject(
                  "Test Info",
                  JSON.stringify(quizObject)
                );

                // Continue processing with the 'user' object
              } catch (error) {
                console.error("Error setting  test info data:", error);
                // Handle the error or provide a default value
              }
            }

            // Continue processing with the 'user' object
          } catch (error) {
            console.error("Error parsing test info  JSON data:", error);
            // Handle the error or provide a default value
          }

          Swal.close();
        }
      },
      (error) => {
        const resMessage =
          (error.response &&
            error.response.data &&
            error.response.data.message) ||
          error.message ||
          error.toString();

        setLoading(true);

        Swal.close();

        Swal.fire({
          icon: "error",
          title: "Load Quections",
          text: "No Quections found",
          confirmButtonText: "OK",
          confirmButtonColor: "red",
          allowOutsideClick: false,
          width: "400px",
          willClose: () => {
            setLoading(true);
          },
        });
      }
    );
  };

  //! clear data

  const [clrData, setClrData] = useState(false);

  //! quection index
  const [index, setIndex] = useState(0);

  //!buttons

  const [prevBtn, setPrevBtn] = useState(false);
  const [nextBtn, setNextBtn] = useState(false);
  const [retryBtn, setRetryBtn] = useState(false);
  const [finishBtn, setFinishBtn] = useState(true);

  //! overall timer
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (loading) return;

    try {
      // Retrieve from local storage
      const savedQuizObject = JSON.parse(localStorage.getItem("Test Info"));

      // Check if there's a saved object
      if (savedQuizObject) {
        // console.log("Quiz Object loaded from local storage:", index);

        if (!savedQuizObject.TestDone) {
          setSeconds(savedQuizObject.TestTimeSeconds);
        }
      } else {
        //  console.log("No Quiz Object found in local storage");
      }
      // Continue processing with the 'user' object
    } catch (error) {
      console.error("Error parsing test info  JSON data:", error);
      // Handle the error or provide a default value
    }
  }, [loading]);

  useEffect(() => {
    // console.log(" index ", index);
    updateBoxDisabilty(index, false);

    scrollToComponent(index);
  }, [index]);

  function addLeadingZeros(num, totalLength) {
    return String(num).padStart(totalLength, "0");
  }

  // const getTime = () => {
  //   const time = timer; // Date.now();

  //   // var days_ = Math.floor(time / (1 * 60 * 60 * 24));
  //   var hours_ = Math.floor((time / (1 * 60 * 60)) % 24);
  //   var minutes_ = Math.floor((time / 1 / 60) % 60);
  //   var seconds_ = Math.floor((time / 1) % 60);

  //   if (loading) return;

  //   // setDays(addLeadingZeros(days_, 2));
  //   setHours(addLeadingZeros(hours_, 2));
  //   setMinutes(addLeadingZeros(minutes_, 2));
  //   setSeconds(addLeadingZeros(seconds_, 2));

  //   if (hours_ >= 12) {
  //     //! if 12 hours reaches reset time
  //     setTimer(0);
  //   }

  //   // 👉️
  // };

  // //! global timer
  // function useInterval(callback, delay) {
  //   const savedCallback = useRef();

  //   // Remember the latest callback.
  //   useEffect(() => {
  //     savedCallback.current = callback;
  //   }, [callback]);

  //   // Set up the interval.
  //   useEffect(() => {
  //     function tick() {
  //       savedCallback.current();
  //     }
  //     if (delay !== null) {
  //       let id = setInterval(tick, delay);
  //       return () => clearInterval(id);
  //     }
  //   }, [delay]);
  // }

  // useInterval(() => {
  //   var timeEdit = timer + 1;

  //   if (loading) return;
  //   setTimer(timeEdit);
  //   getTime();
  // }, 1000);

  useEffect(() => {
    const timer = setInterval(() => {
      if (loading) return;
      // Update seconds
      setSeconds((prevSeconds) => {
        const newSeconds = (prevSeconds + 1) % 60;
        // localStorage.setItem("timerSeconds", newSeconds);

        try {
          // Retrieve from local storage
          const savedQuizObject = JSON.parse(localStorage.getItem("Test Info"));

          // Check if there's a saved object
          if (savedQuizObject) {
            // console.log("Quiz Object loaded from local storage:", index);

            if (!savedQuizObject.TestDone) {
              const totalSeconds = hours * 3600 + minutes * 60 + newSeconds;
              savedQuizObject.TestTimeSeconds = totalSeconds;
              savedQuizObject.TestCrrIndex = index;
            }

            try {
              LocalDataStorage.setLocalStorageObject(
                "Test Info",
                JSON.stringify(savedQuizObject)
              );

              // Continue processing with the 'user' object
            } catch (error) {
              console.error("Error setting  test info data:", error);
              // Handle the error or provide a default value
            }
          } else {
            // console.log("No Quiz Object found in local storage");
          }

          // Continue processing with the 'user' object
        } catch (error) {
          console.error("Error parsing test info  JSON data:", error);
          // Handle the error or provide a default value
        }

        return newSeconds;
      });

      // Update minutes and hours accordingly
      if (seconds === 59) {
        setMinutes((prevMinutes) => {
          const newMinutes = (prevMinutes + 1) % 60;
          return newMinutes;
        });

        if (minutes === 59) {
          setHours((prevHours) => prevHours + 1);
        }
      }
    }, 1000);

    // Cleanup function to clear interval when component unmounts
    return () => clearInterval(timer);
  }, [seconds, minutes, hours, loading]);

  //! Quection  page handle

  useEffect(() => {
    const lastIndex = qData.length - 1;

    if (loading) return;

    if (index <= 0) {
      //setIndex(0);

      setPrevBtn(true);
    } else {
      setPrevBtn(false);
    }

    if (index >= lastIndex) {
      // setIndex(lastIndex); // 0

      setNextBtn(true);
      setFinishBtn(false);
    } else {
      setNextBtn(false);
      setFinishBtn(true);
    }

    indexRef.current = index;
  }, [index, qData]);

  useEffect(() => {
    loadQuectionsApi();
  }, []);

  useEffect(() => {
    if (loading) return;

    if (!qData.length) {
      setPrevBtn(true);
      setNextBtn(true);
      setRetryBtn(true);
      setFinishBtn(true);
    }
  }, []);

  const [crrBoxIndex, setCrrBoxIndex] = useState(0);

  const handleBoxClick = async (clickedIndex) => {
    if (clickedIndex > crrBoxIndex) {
      setIndex(clickedIndex);
    } else if (clickedIndex < crrBoxIndex) {
      setIndex(clickedIndex);
    } else {
    }

    setCrrBoxIndex(clickedIndex);
  };

  //!==================

  const handleFinishTest = () => {
    console.log(" Finish the test =>  ", FinalTestName);

    try {
      // Retrieve from local storage
      const savedQuizObject = JSON.parse(localStorage.getItem("Test Info"));

      // Check if there's a saved object
      if (savedQuizObject) {
        savedQuizObject.TestendTime = format(new Date(), "yyyy-MM-dd HH:mm:ss");

        for (let i = 0; i < savedQuizObject.TestDetails.length; i++) {
          savedQuizObject.StreamOnePoints =
            savedQuizObject.StreamOnePoints +
            savedQuizObject.TestDetails[i].QuectionStreamOnePoints;

          savedQuizObject.StreamTwoPoints =
            savedQuizObject.StreamTwoPoints +
            savedQuizObject.TestDetails[i].QuectionStreamTwoPoints;

          savedQuizObject.StreamThreePoints =
            savedQuizObject.StreamThreePoints +
            savedQuizObject.TestDetails[i].QuectionStreamThreePoints;
        }

        console.log(" Test Resuls =>  ", { savedQuizObject });

        console.log("upload results called ");

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

        GeneralMCQService.upload_results(
          user.userName,
          user.userId,
          nameOftheTest,
          levelofmcq,
          savedQuizObject
        ).then(
          (response) => {
            const data = response.data;

            console.log("  res data", data);

            Swal.close();

            let whereTo = {};

            if (nameOftheTest === "AIOneQuection") {
              whereTo = {
                path: "AiInterviewTwo",
                nameOftheTest: "AITwoQuection",
                isLevelMcq: false,
                levelofmcq: "",
                isoverflow: true,
                qonebyone: true,
              };
            } else {
              whereTo = {
                path: "",
              };
            }

            navigate("/score", {
              state: {
                nameOftheTest: location.state.nameOftheTest,
                isLevelMcq: location.state.isLevelMcq,
                levelofmcq: location.state.levelofmcq,
                whereTo: whereTo,
              },
            });
          },
          (error) => {
            const resMessage =
              (error.response &&
                error.response.data &&
                error.response.data.message) ||
              error.message ||
              error.toString();

            Swal.close();

            Swal.fire({
              icon: "error",
              title: "Update Results error",
              text: resMessage,
              confirmButtonText: "OK",
              confirmButtonColor: "red",
              allowOutsideClick: false,
              width: "400px",
              willClose: () => {},
            });
          }
        );

        try {
          LocalDataStorage.setLocalStorageObject(
            "Test Info",
            JSON.stringify(savedQuizObject)
          );

          // Continue processing with the 'user' object
        } catch (error) {
          console.error("Error setting  test info data:", error);
          // Handle the error or provide a default value
        }
      } else {
        // console.log("No Quiz Object found in local storage");
      }
      // Continue processing with the 'user' object
    } catch (error) {
      console.error("Error parsing test info  JSON data:", error);
      // Handle the error or provide a default value
    }
  };

  const validate = () => {
    // console.log(boxFlags.box1);

    if (
      boxFlags.box1 === "#333" &&
      boxFlags.box2 === "#333" &&
      boxFlags.box3 === "#333" &&
      boxFlags.box4 === "#333" &&
      boxFlags.box5 === "#333" &&
      boxFlags.box6 === "#333" &&
      boxFlags.box7 === "#333" &&
      boxFlags.box8 === "#333" &&
      boxFlags.box9 === "#333" &&
      boxFlags.box10 === "#333"
    ) {
      return true;
    }
    return true;
  };

  const finishTest = () => {
    if (!validate()) {
      Swal.fire({
        title: "Not Completed",
        text: "Please Answer all the Quections",
        icon: "warning",
        allowEscapeKey: true,
        allowOutsideClick: true,
        // showCancelButton: true,
        confirmButtonColor: "#3085d6",
        // cancelButtonColor: "#d33",
        confirmButtonText: "ok",
        width: "350px",
      });
      return;
    }
    Swal.fire({
      title: "Are you sure?",
      text: "You are about end test!!",
      icon: "warning",
      allowEscapeKey: true,
      allowOutsideClick: true,
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, end it!",
      width: "350px",
    }).then((result) => {
      if (result.isConfirmed) {
        stopStreaming();
        handleFinishTest();
      }
    });
  };

  const finishTest2 = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You are about end test!!",
      icon: "warning",
      allowEscapeKey: true,
      allowOutsideClick: true,
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, end it!",
      width: "350px",
    }).then((result) => {
      if (result.isConfirmed) {
        stopStreaming();
        handleFinishTest();
      }
    });
  };

  const previousQcaller = async (currentquection) => {
    if (index <= 0 || currentquection <= 0) {
      return;
    }
    // scrollToComponent(currentquection - 1);

    // await delay(500);

    updateslideDetails(currentquection - 1, true);

    setIndex(currentquection - 1);
  };

  const nextQcaller = async (currentquection) => {
    var bottom = qData.length - 1;

    // console.log("bottom ", bottom, index, currentquection);

    if (bottom <= currentquection) {
      return;
    }
    // scrollToComponent(currentquection + 1);

    // await delay(500);

    updateslideDetails(currentquection + 1, true);

    setIndex(currentquection + 1);
  };

  let topic = "";

  if (levelofmcq === "") {
    if (nameOftheTest === "FinalQuection") {
      if (location.state.streamSelected === "StreamOne") {
        topic = "Cyber Security Final Quiz";
      } else if (location.state.streamSelected === "StreamTwo") {
        topic = "Buisness Final Quiz";
      } else if (location.state.streamSelected === "StreamThree") {
        topic = "IT Final Quiz";
      }
    } else if (nameOftheTest === "AIOneQuection") {
      topic = "Interview One Quiz";
    } else if (nameOftheTest === "AITwoQuection") {
      // Conversation text
      topic = "Interview Two Quiz";
    }
  } else {
    // Stream mcqs
    if (nameOftheTest === "StreamOne") {
      topic =
        "Cyber Security Quiz" +
        (levelofmcq === "q1"
          ? " Level 1"
          : levelofmcq === "q2"
          ? " Level 2"
          : levelofmcq === "q3"
          ? " Level 3"
          : levelofmcq === "q4"
          ? " Level 4"
          : "");
    } else if (nameOftheTest === "StreamTwo") {
      topic =
        "Buisness Quiz" +
        (levelofmcq === "q1"
          ? " Level 1"
          : levelofmcq === "q2"
          ? " Level 2"
          : levelofmcq === "q3"
          ? " Level 3"
          : levelofmcq === "q4"
          ? " Level 4"
          : "");
    } else if (nameOftheTest === "StreamThree") {
      topic =
        "IT Quiz" +
        (levelofmcq === "q1"
          ? " Level 1"
          : levelofmcq === "q2"
          ? " Level 2"
          : levelofmcq === "q3"
          ? " Level 3"
          : levelofmcq === "q4"
          ? " Level 4"
          : "");
    }
  }

  var midContent = (
    <>
      <div
        className="q-box-holder"
        style={{ overflowY: isoverflow ? "auto" : "hidden" }}
      >
        {qData.length &&
          qData.map((quection, quectionIndex) => {
            //console.log("inex => ", quectionIndex, " - ",index);
            return (
              <MCQModelGeneral
                key={quection.id}
                {...quection}
                quectionIndex={quectionIndex}
                index={index}
                setIndex={setIndex}
                clearData={clrData}
                TestName={FinalTestName}
                nameOftheTest={nameOftheTest}
                levelofmcq={levelofmcq}
                nextQcaller={nextQcaller}
                previousQcaller={previousQcaller}
                ref={componentRefs.current[quectionIndex]}
                updateBoxDetails={(id, val) => {
                  updateBoxDetails(id, val);
                }}
                updateBoxDisabilty={(id, val) => {
                  updateBoxDisabilty(id, val);
                }}
                viewSlidesFlags={viewSlidesFlags}
                socketRef={socketRef.current}
                audioTik={audioTik}
                audioStream={audioStreamRef.current}
                audioPermission={audioPermission}
                sendFrameRef={sendFrameRef}
                useTranscripts={false}
                transcriptCaller={transcriptCaller}
                setIsAudioOn={setIsAudioOn}
                setIsVideoOn={setIsVideoOn}
                setIsGameQuizDone={setIsGameQuizDone}
                finishTest={finishTest}
              />
            );
          })}
      </div>
      <div className="q-page-controls">
        <div className="q-page-cont-retry">
          {/* <button
            type="button"
            className="button-25"
            disabled={retryBtn}
            onClick={() => {
              setClrData(true);
              LocalDataStorage.removeLocalStorageObject("Test Info");

              try {
                LocalDataStorage.removeLocalStorageObject("Test Info");

                // Continue processing with the 'user' object
              } catch (error) {
                console.error("Error removbing  test info data:", error);
                // Handle the error or provide a default value
              }

              // LocalDataStorage.clearLocalStorage();

              window.location.reload();
            }}
          >
            Try Again
          </button> */}
        </div>
        {!finishBtn ? (
          <div className="q-page-cont-finish">
            <button
              className="button-25"
              onClick={finishTest}
              // disabled={finishBtn}
            >
              Finish
            </button>
          </div>
        ) : (
          <div className="q-page-cont-finish">
            <div className="q-page-cont-finish">
              <button
                className="button-25"
                onClick={finishTest}
                // disabled={finishBtn}
              >
                Finish Test
              </button>
            </div>
          </div>
        )}

        <div className="q-page-cont-prev">
          <button
            type="button"
            className="button-24"
            onClick={() => previousQcaller(index)}
            // disabled={prevBtn}
          >
            Previous
          </button>
        </div>
        <div className="q-page-cont-next">
          <button
            type="button"
            className="button-24"
            onClick={() => nextQcaller(index)}
            // disabled={nextBtn}
          >
            Next
          </button>
        </div>

        <div className="q-page-cont-prev" style={{ marginLeft: "100px" }}>
          <div className="q-page-info-right">
            <p
              style={{
                fontSize: "16px",
                fontWeight: "550",
                marginTop: "10px",
              }}
            >
              Test Time :
            </p>

            <div style={{ fontSize: "30px", fontWeight: "550" }}>
              <span>{String(hours).padStart(2, "0")}</span>:
              <span>{String(minutes).padStart(2, "0")}</span>:
              <span>{String(seconds).padStart(2, "0")}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="q-page-info "></div>
    </>
  );

  var contentNew = (
    <>
      <div className="MCQGeneralScreen">
        <div className="Top">
          <Header />
        </div>
        <div className="Mid">
          <div className="q-mid-top">
            <div className="quiz-Topic">
              <p>{topic}</p>
            </div>
            {/* <div className="quiz-Helper">
              <p>
                use icons to hear the quections and use mic icon to reply for
                each quections
              </p>
            </div> */}
          </div>
          <div className="q-mid-bot">
            <div className="q-view1">{loading ? loaderWheel : midContent}</div>
            <div className="q-view2">
              {loading ? (
                loaderWheel
              ) : (
                <div className="stat-box-container">
                  {boxesData.map((boxData) => (
                    <BoxComponent
                      key={boxData.id}
                      number={boxData.number}
                      backgroundColor={boxData.backgroundColor}
                      isDisabled={boxData.isDisabled}
                      handleBoxClick={() => {
                        handleBoxClick(boxData.number - 1);
                      }}
                    />
                  ))}
                </div>
              )}

              {/* <button onClick={handleToggleCamera}>
                {cameraOpen ? "Close Camera" : "Open Camera"}
              </button> */}
              {/* {camimage && cameraOpen && <img src={camimage} alt="Live Feed" />} */}

              {loading ? (
                loaderWheel
              ) : (
                <video ref={videoRef} autoPlay muted playsInline />
              )}
            </div>
          </div>
        </div>
        <div className="Bot">
          <Footer />
        </div>
      </div>
    </>
  );

  var contentInterviewChat = (
    <>
      <div className="MCQGeneralScreen">
        <div className="Top">
          <Header />
        </div>
        <div className="Mid">
          <div className="q-mid-top">
            <div className="quiz-Topic">
              <p>{topic}</p>
            </div>
            {/* <div className="quiz-Helper">
              <p>
                use icons to hear the quections and use mic icon to reply for
                each quections
              </p>
            </div> */}
          </div>

          {loading ? (
            loaderWheel
          ) : (
            <InterviewChat
              qData={qData}
              index={index}
              setIndex={setIndex}
              clearData={clrData}
              TestName={FinalTestName}
              nameOftheTest={nameOftheTest}
              levelofmcq={levelofmcq}
              nextQcaller={nextQcaller}
              previousQcaller={previousQcaller}
              updateBoxDetails={(id, val) => {
                updateBoxDetails(id, val);
              }}
              updateBoxDisabilty={(id, val) => {
                updateBoxDisabilty(id, val);
              }}
              viewSlidesFlags={viewSlidesFlags}
              socketRef={socketRef.current}
              audioTik={audioTik}
              audioStream={audioStreamRef.current}
              audioPermission={audioPermission}
              sendFrameRef={sendFrameRef}
              useTranscripts={false}
              transcriptCaller={transcriptCaller}
              setIsAudioOn={setIsAudioOn}
              setIsVideoOn={setIsVideoOn}
              setIsGameQuizDone={setIsGameQuizDone}
              finishTest={finishTest2}
            />
          )}
        </div>
        <div className="Bot">
          <Footer />
        </div>
      </div>
    </>
  );

  if (nameOftheTest === "AIOneQuection") {
    return contentInterviewChat;
  } else {
    return contentNew;
  }
};

export default MCQGeneralScreen;
