import React, {
  useState,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";

// import SpeechRecognition, {
//   useSpeechRecognition,
// } from "react-speech-recognition";

import Swal from "sweetalert2";

import { MDBIcon } from "mdb-react-ui-kit";

import LocalDataStorage from "../LocalStorageHandler/LocalDataStorage";

import TextToSpeech from "../TexttoSpeech/TexttoSpeech";

import GeneralMCQService from "../../../webservices/GeneralMCQService";



import "./MCQModelGeneral.css";

const MCQModelGeneral = forwardRef(
  (
    {
      id,
      q,
      a1,
      a2,
      a3,
      a4,
      r,
      quectionIndex,
      index,
      setIndex,
      clearData,
      TestName,
      nameOftheTest,
      levelofmcq,
      previousQcaller,
      nextQcaller,
      useTimeLimit,
      timeLimit,
      useImage,
      useMCQAnswers,
      useSpeechAnswer,
      useTranscripts,
      useVideoAnswer,
      useRadioSelect,
      useAiResponse,
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
    },
    ref
  ) => {
    //! audio part

    const mimeType = "audio/wav";

    const airesponseRef = useRef([]);

    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    //! Transcripts handling

    const currentTranscript = useRef([]);

    //! Transcripts

    // const {
    //   transcript,
    //   interimTranscript,
    //   finalTranscript,
    //   resetTranscript,
    //   listening,
    // } = useSpeechRecognition();

    // useEffect(() => {
    //   if (finalTranscript !== "") {
    //     // console.log("Got final result:", finalTranscript);

    //     if (quectionIndex === index) {
    //       currentTranscript.current[quectionIndex] = finalTranscript;
    //       // console.log({ quectionIndex, index });
    //     }
    //   }
    // }, [interimTranscript, finalTranscript]);

    // if (!SpeechRecognition.browserSupportsSpeechRecognition()) {
    //   console.log(
    //     "Your browser does not support speech recognition software! Try Chrome desktop, maybe?"
    //   );
    // }
    // const listenContinuously = () => {
    //   SpeechRecognition.startListening({
    //     continuous: true,
    //     language: "en-GB",
    //   });
    // };

    useEffect(() => {
      setIsVideoOn(useVideoAnswer);
    }, [useVideoAnswer]);

    useEffect(() => {
      setIsAudioOn(useSpeechAnswer);
    }, [useSpeechAnswer]);

    //! Record Audio blob

    // const [permission, setPermission] = useState(false);
    const mediaRecorder = useRef(null);
    // const [stream, setStream] = useState(null);
    const audioChunksRef = useRef([]);
    const audio = useRef([]);
    const audioBlobs = useRef(null);

    const isRecordingRef = useRef(false);

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

      if (useTranscripts) {
        transcriptCaller.resetTranscript();
      }

      startRecordingAudio();

      if (useTranscripts) {
        transcriptCaller.listenContinuously();
      }
    };

    const handleStopRecording = async () => {
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

      // SpeechRecognition.stopListening();
      if (useTranscripts) {
        transcriptCaller.handleStopListening();
      }
    };

    const startRecordingAudio = () => {
      audio.current[quectionIndex] = "";

      console.log("recording");

      //create new Media recorder instance using the stream
      const media = new MediaRecorder(audioStream, { type: mimeType });

      //set the MediaRecorder instance to the mediaRecorder ref
      mediaRecorder.current = media;

      mediaRecorder.current.onstart = () => {
        console.log("Audio Recording started at Q => ", quectionIndex);
        isRecordingRef.current = true;
      };

      mediaRecorder.current.ondataavailable = (event) => {
        try {
          console.log(
            "Audio Recording data receiving at Q => ",
            quectionIndex,
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
          console.log("Audio Recording stopped at Q => ", quectionIndex);

          isRecordingRef.current = false;

          let qindex_temp = quectionIndex;

          // creates a blob file from the audiochunks data
          const audioBlob = new Blob(audioChunksRef.current, {
            type: mimeType,
          });

          // creates a playable URL from the blob file.
          const audioUrl = URL.createObjectURL(audioBlob);
          audioBlobs.current = audioBlob;

          console.log(
            "Audio Recorded audio URL at Q => ",
            quectionIndex,
            audioUrl
          );

          handleAudioAnswer(audioBlob);

          audio.current[qindex_temp] = audioUrl;

          // Retrieve from local storage
          const savedQuizObject = JSON.parse(localStorage.getItem("Test Info"));

          // Check if there's a saved object
          if (savedQuizObject) {
            if (!savedQuizObject.TestDone) {
              savedQuizObject.TestDetails[quectionIndex].QuectionUserVoice =
                audioUrl;
            }
          }

          LocalDataStorage.setLocalStorageObject(
            "Test Info",
            JSON.stringify(savedQuizObject)
          );

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
        console.log("Audio recording started at Q => ", quectionIndex);
        isRecordingRef.current = true;
      } catch (error) {
        console.error("Error starting audio recording:", error);
        // Handle or log the error as needed
        isRecordingRef.current = false; // Set recording flag to false if there's an error
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
        if (nameOftheTest === "FinalQuection") {
          switch (reply) {
            case "1":
              handleChange1();
              break;
            case "2":
              handleChange2();
              break;
            case "3":
              handleChange3();
              break;
            case "4":
              handleChange4();
              break;
            default:
              break;
          }
          airesponseRef.current[quectionIndex] = aireply;
        } else if (nameOftheTest === "AIOneQuection") {
          updateStreamPoints(qindex, streamNumber, mark);
          airesponseRef.current[quectionIndex] = aireply;
        } else if (nameOftheTest === "AITwoQuection") {
          // Conversation text

          switch (reply) {
            case "1":
              handleChange1();
              break;
            case "2":
              handleChange2();
              break;
            case "3":
              handleChange3();
              break;
            case "4":
              handleChange4();
              break;
            default:
              break;
          }

          airesponseRef.current[quectionIndex] = aireply;
        }
      } else {
        // Stream mcqs
        if (nameOftheTest === "StreamOne") {
          if (
            levelofmcq === "q1" ||
            levelofmcq === "q2" ||
            levelofmcq === "q3" 
          ) {
            switch (reply) {
              case "1":
                handleChange1();
                break;
              case "2":
                handleChange2();
                break;
              case "3":
                handleChange3();
                break;
              case "4":
                handleChange4();
                break;
              default:
                break;
            }

            airesponseRef.current[quectionIndex] = aireply;
          }
        } else if (nameOftheTest === "StreamTwo") {
          if (
            levelofmcq === "q1" ||
            levelofmcq === "q2" ||
            levelofmcq === "q3" 
          ) {
            switch (reply) {
              case "1":
                handleChange1();
                break;
              case "2":
                handleChange2();
                break;
              case "3":
                handleChange3();
                break;
              case "4":
                handleChange4();
                break;
              default:
                break;
            }

            airesponseRef.current[quectionIndex] = aireply;
          }
        } else if (nameOftheTest === "StreamThree") {
          if (
            levelofmcq === "q1" ||
            levelofmcq === "q2" ||
            levelofmcq === "q3"
          ) {
            switch (reply) {
              case "1":
                handleChange1();
                break;
              case "2":
                handleChange2();
                break;
              case "3":
                handleChange3();
                break;
              case "4":
                handleChange4();
                break;
              default:
                break;
            }

            airesponseRef.current[quectionIndex] = aireply;
          }
        }
      }
    }

    const updateStreamPoints = (Qindex, streamNumber, mark) => {
      // Retrieve from local storage
      const savedQuizObject = JSON.parse(localStorage.getItem("Test Info"));

      // Check if there's a saved object
      if (savedQuizObject) {
        // console.log("Quiz Object loaded from local storage:", index);

        // if (streamNumber === 1) {
        //   savedQuizObject.TestDetails[Qindex].QuectionStreamOnePoints =
        //     savedQuizObject.TestDetails[Qindex].QuectionStreamOnePoints +
        //     (Number(mark) ? Number(mark) : 0);
        // } else if (streamNumber === 2) {
        //   savedQuizObject.TestDetails[Qindex].QuectionStreamTwoPoints =
        //     savedQuizObject.TestDetails[Qindex].QuectionStreamTwoPoints +
        //     (Number(mark) ? Number(mark) : 0);
        // } else if (streamNumber === 3) {
        //   savedQuizObject.TestDetails[Qindex].QuectionStreamThreePoints =
        //     savedQuizObject.TestDetails[Qindex].QuectionStreamThreePoints +
        //     (Number(mark) ? Number(mark) : 0);
        // }


        if (streamNumber === 1) {
          savedQuizObject.TestDetails[Qindex].QuectionStreamOnePoints = Number(
            mark
          )
            ? Number(mark)
            : 0;
        } else if (streamNumber === 2) {
          savedQuizObject.TestDetails[Qindex].QuectionStreamTwoPoints = Number(
            mark
          )
            ? Number(mark)
            : 0;
        } else if (streamNumber === 3) {
          savedQuizObject.TestDetails[Qindex].QuectionStreamThreePoints =
            Number(mark) ? Number(mark) : 0;
        }

        //! UPDATE Score Streams

        // if (streamNumber === 1) {
        //   let score = 0;

        //   for (let i = 0; i < savedQuizObject.TestDetails.length; i++) {
        //     const _Mark =
        //       savedQuizObject.TestDetails[i].QuectionStreamOnePoints;
        //     score = score + _Mark;
        //   }

        //   savedQuizObject.StreamOnePoints = score;
        // } else if (streamNumber === 2) {
        //   let score = 0;

        //   for (let i = 0; i < savedQuizObject.TestDetails.length; i++) {
        //     const _Mark =
        //       savedQuizObject.TestDetails[i].QuectionStreamTwoPoints;
        //     score = score + _Mark;
        //   }

        //   savedQuizObject.StreamTwoPoints = score;
        // } else if (streamNumber === 3) {
        //   let score = 0;

        //   for (let i = 0; i < savedQuizObject.TestDetails.length; i++) {
        //     const _Mark =
        //       savedQuizObject.TestDetails[i].QuectionStreamThreePoints;
        //     score = score + _Mark;
        //   }

        //   savedQuizObject.StreamThreePoints = score;
        // }


        LocalDataStorage.setLocalStorageObject(
          "Test Info",
          JSON.stringify(savedQuizObject)
        );
      } else {
        // console.log("No Quiz Object found in local storage");
      }
    };

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
    const handleAudioAnswer = (audioBlob) => {
      console.log(" calling audio reply api ");

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

      let name = user.userName;
      let id = user.userId;

      const qindex_temp = quectionIndex;

      GeneralMCQService.answer_by_speech(
        name,
        id,
        nameOftheTest,
        levelofmcq,
        qindex_temp,
        r,
        currentTranscript.current[qindex_temp],
        audioBlob
      ).then(
        (response) => {
          const data = response.data;

          const { answerProceesed, mark, aireply, streamNumber, qindex } = data;

          // console.log(" t ", qindex_temp, Number(qindex));

          if (qindex_temp === Number(qindex)) {
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
    };

    //! clicks
    const [clicks, setClicks] = useState(0);

    //! time

    const [days, setDays] = useState(0);
    const [hours, setHours] = useState(0);
    const [minutes, setMinutes] = useState(0);
    const [seconds, setSeconds] = useState(0);
    const [timer, setTimer] = useState(useTimeLimit ? timeLimit : 0);

    const timeoverRef = useRef([]);

    //! answers

    const [checked1, setChecked1] = useState(false);
    const [checked2, setChecked2] = useState(false);
    const [checked3, setChecked3] = useState(false);
    const [checked4, setChecked4] = useState(false);

    //! use effects

    // useEffect(() => {
    //   console.log(
    //     " test response ",

    //     timeoverRef.current[quectionIndex]
    //   );
    // }, [timeoverRef.current[quectionIndex], quectionIndex]);

    useEffect(() => {
      if (useTimeLimit) {
        socketRef.on("gesture_game_quiz", (response) => {
          const {
            nameOftheTest,
            levelofmcq,
            answerText,
            mark,
            aireply,
            queindex,
            isAnswerOk,
          } = response;

          if (!timeoverRef.current[quectionIndex]) {
            if (quectionIndex === Number(queindex)) {
              console.log(
                " game quiz finger response ",
                response,
                timeoverRef.current[quectionIndex]
              );

              if (nameOftheTest === "StreamThree") {
                if (levelofmcq === "q4") {
                  switch (answerText) {
                    case "1":
                      if (isAnswerOk) handleChange1();
                      break;
                    case "2":
                      if (isAnswerOk) handleChange2();
                      break;
                    case "3":
                      if (isAnswerOk) handleChange3();
                      break;
                    case "4":
                      if (isAnswerOk) handleChange4();
                      break;
                    default:
                      break;
                  }

                  if (isAnswerOk)
                    airesponseRef.current[quectionIndex] = aireply;

                  if (isAnswerOk) updateMarks(Number(queindex), mark);
                }
              }


              if (nameOftheTest === "StreamTwo") {
                if (levelofmcq === "q4") {
                  switch (answerText) {
                    case "1":
                      if (isAnswerOk) handleChange1();
                      break;
                    case "2":
                      if (isAnswerOk) handleChange2();
                      break;
                    case "3":
                      if (isAnswerOk) handleChange3();
                      break;
                    case "4":
                      if (isAnswerOk) handleChange4();
                      break;
                    default:
                      break;
                  }

                  if (isAnswerOk)
                    airesponseRef.current[quectionIndex] = aireply;

                  if (isAnswerOk) updateMarks(Number(queindex), mark);
                }
              }


              
              if (nameOftheTest === "StreamOne") {
                if (levelofmcq === "q4") {
                  switch (answerText) {
                    case "1":
                      if (isAnswerOk) handleChange1();
                      break;
                    case "2":
                      if (isAnswerOk) handleChange2();
                      break;
                    case "3":
                      if (isAnswerOk) handleChange3();
                      break;
                    case "4":
                      if (isAnswerOk) handleChange4();
                      break;
                    default:
                      break;
                  }

                  if (isAnswerOk)
                    airesponseRef.current[quectionIndex] = aireply;

                  if (isAnswerOk) updateMarks(Number(queindex), mark);
                }
              }

            }
          }

          sendFrameRef.current = true;
        });
      }

      socketRef.on("final_emotion_quiz", (response) => {
        const { nameOftheTest, levelofmcq, emotionScore, queindex } = response;

        if (quectionIndex === Number(queindex)) {
          console.log(" final quiz emotion response ", response);

          if (nameOftheTest === "FinalQuection") {
            if (levelofmcq === "") {
              // Retrieve from local storage
              const savedQuizObject = JSON.parse(
                localStorage.getItem("Test Info")
              );

              // Check if there's a saved object
              if (savedQuizObject) {
                // console.log("Quiz Object loaded from local storage:", index);

                savedQuizObject.TestFinalFacialScore = emotionScore;

                LocalDataStorage.setLocalStorageObject(
                  "Test Info",
                  JSON.stringify(savedQuizObject)
                );
              } else {
                // console.log("No Quiz Object found in local storage");
              }
            }
          }

          sendFrameRef.current = true;
        }
      });
    }, []);

    useEffect(() => { }, []);

    useEffect(() => {
      // // Retrieve from local storage
      // const savedQuizObject = JSON.parse(localStorage.getItem("Test Info"));
      // // Check if there's a saved object
      // if (savedQuizObject) {
      //   // console.log("Quiz Object loaded from local storage:", savedQuizObject);
      //   if (!savedQuizObject.TestDone) {
      //     setClicks(savedQuizObject.TestDetails[quectionIndex].QuectionClicks);
      //     setTimer(
      //       savedQuizObject.TestDetails[quectionIndex].QuectionTimeSeconds
      //     );
      //     // setTimer(savedQuizObject.TestDetails[quectionIndex].timerData);
      //     setChecked1(
      //       savedQuizObject.TestDetails[quectionIndex].QuectionChecked1
      //     );
      //     setChecked2(
      //       savedQuizObject.TestDetails[quectionIndex].QuectionChecked2
      //     );
      //     setChecked3(
      //       savedQuizObject.TestDetails[quectionIndex].QuectionChecked3
      //     );
      //     setChecked4(
      //       savedQuizObject.TestDetails[quectionIndex].QuectionChecked4
      //     );
      //     currentTranscript.current[quectionIndex] =
      //       savedQuizObject.TestDetails[quectionIndex].QuectionUserAnswer;
      //     // airesponseRef.current[quectionIndex] =
      //     //   savedQuizObject.TestDetails[quectionIndex].QuectionAIResponse;
      //     audio.current[quectionIndex] =
      //       savedQuizObject.TestDetails[quectionIndex].QuectionUserVoice;
      //   }
      // } else {
      //   //  console.log("No Quiz Object found in local storage");
      // }
    }, [quectionIndex]);

    useEffect(() => {
      // Retrieve from local storage
      const savedQuizObject = JSON.parse(localStorage.getItem("Test Info"));

      // Check if there's a saved object
      if (savedQuizObject) {
        // console.log(
        //   "Test Quiz Object loaded from local storage:",
        //   savedQuizObject
        // );

        if (!savedQuizObject.TestDone) {
          savedQuizObject.TestDetails[quectionIndex].QuectionAIResponse =
            airesponseRef.current[quectionIndex];
        }
      } else {
        //  console.log("No Quiz Object found in local storage");
      }

      LocalDataStorage.setLocalStorageObject(
        "Test Info",
        JSON.stringify(savedQuizObject)
      );
    }, [airesponseRef.current[quectionIndex]]);

    const getTime = () => {
      const time = timer; // Date.now();

      // var days_ = Math.floor(time / (1 * 60 * 60 * 24));
      var hours_ = Math.floor((time / (1 * 60 * 60)) % 24);
      var minutes_ = Math.floor((time / 1 / 60) % 60);
      var seconds_ = Math.floor((time / 1) % 60);

      // setDays(addLeadingZeros(days_, 2));
      setHours(hours_);
      setMinutes(minutes_);
      setSeconds(seconds_);

      if (hours_ >= 12) {
        //! if 12 hours reaches reset time
        setTimer(0);
      }

      // console.log(" in timer qu data ", quectionIndex);

      if (useTimeLimit) {
        const user = JSON.parse(localStorage.getItem("user"));

        const userCam =
          user.userName + "_" + user.userId.toString() + "_camera";

        // console.log(" tests ", quectionIndex, index);

        const testIndex = quectionIndex;

        // Play ticking sound when time is between 0 and 5 seconds
        if (time <= 5 && time > 0) {
          audioTik.play();
        } else if (time === 0) {
          // Stop the audio when the countdown reaches 0
          audioTik.pause();
          audioTik.currentTime = 0;
        }
      }

      if (time <= 0 && useTimeLimit) {
        timeoverRef.current[quectionIndex] = true;

        if (quectionIndex !== 9) {
          nextQcaller(quectionIndex);
        } else if (quectionIndex === 9 && time <= 0) {
          setIsGameQuizDone(true);
        }
      }
    };

    function useInterval(callback, delay) {
      const savedCallback = useRef();

      // Remember the latest callback.
      useEffect(() => {
        savedCallback.current = callback;
      }, [callback]);

      // Set up the interval.
      useEffect(() => {
        function tick() {
          savedCallback.current();
        }
        if (delay !== null) {
          let id = setInterval(tick, delay);
          return () => {
            clearInterval(id);
            audioTik.pause();
            audioTik.currentTime = 0;
          };
        }
      }, [delay]);
    }

    useInterval(() => {
      if (quectionIndex === index) {
        var timeEdit = timer;

        if (useTimeLimit) {
          timeEdit = timer - 1;
          if (timeEdit <= 0) timeEdit = 0;
        } else {
          timeEdit = timer + 1;
        }

        setTimer(timeEdit);

        // Retrieve from local storage
        const savedQuizObject = JSON.parse(localStorage.getItem("Test Info"));

        // Check if there's a saved object
        if (savedQuizObject) {
          // console.log(
          //   " Check Quiz Object loaded from local storage:",
          //   savedQuizObject,
          //   quectionIndex
          // );

          if (!savedQuizObject.TestDone) {
            savedQuizObject.TestDetails[quectionIndex].QuectionTimeSeconds =
              timeEdit;
          }
        } else {
          //  console.log("No Quiz Object found in local storage");
        }

        LocalDataStorage.setLocalStorageObject(
          "Test Info",
          JSON.stringify(savedQuizObject)
        );

        getTime();
      }
    }, 1000);

    useEffect(() => {
      return () => {
        audioTik.pause();
        audioTik.currentTime = 0;
      };
    }, [audioTik]);

    useEffect(() => {
      const tempIndex = quectionIndex;

      if (
        checked1 ||
        checked2 ||
        checked3 ||
        checked4 ||
        audio.current[quectionIndex]
      ) {
        updateBoxDetails(tempIndex, "#333");
      } else {
        updateBoxDetails(tempIndex, "#fff");
      }
    }, [checked1, checked2, checked3, checked4, audio.current[quectionIndex]]);

    //!handle clicks

    const handleChange1 = () => {
      let tempcheck = !checked1;
      setChecked1(!checked1);

      // Retrieve from local storage
      const savedQuizObject = JSON.parse(localStorage.getItem("Test Info"));

      // Check if there's a saved object
      if (savedQuizObject) {
        //  console.log("Quiz Object loaded from local storage:", savedQuizObject);

        if (!savedQuizObject.TestDone) {
          savedQuizObject.TestDetails[quectionIndex].QuectionChecked1 =
            tempcheck ? 1 : 0;

          savedQuizObject.TestDetails[quectionIndex].QuectionChecked2 = 0;
          savedQuizObject.TestDetails[quectionIndex].QuectionChecked3 = 0;
          savedQuizObject.TestDetails[quectionIndex].QuectionChecked4 = 0;
        }
      } else {
        //  console.log("No Quiz Object found in local storage");
      }

      LocalDataStorage.setLocalStorageObject(
        "Test Info",
        JSON.stringify(savedQuizObject)
      );

      if (!checked1) {
        setChecked2(false);
        setChecked3(false);
        setChecked4(false);

        setClicks(clicks + 1);

        // Retrieve from local storage
        const savedQuizObject = JSON.parse(localStorage.getItem("Test Info"));

        // Check if there's a saved object
        if (savedQuizObject) {
          //  console.log("Quiz Object loaded from local storage:", savedQuizObject);

          if (!savedQuizObject.TestDone) {
            savedQuizObject.TestDetails[quectionIndex].QuectionClicks =
              clicks + 1;
          }
        } else {
          //  console.log("No Quiz Object found in local storage");
        }

        LocalDataStorage.setLocalStorageObject(
          "Test Info",
          JSON.stringify(savedQuizObject)
        );
      }
    };

    const handleChange2 = () => {
      let tempcheck = !checked2;
      setChecked2(!checked2);

      // Retrieve from local storage
      const savedQuizObject = JSON.parse(localStorage.getItem("Test Info"));

      // Check if there's a saved object
      if (savedQuizObject) {
        //  console.log("Quiz Object loaded from local storage:", savedQuizObject);

        if (!savedQuizObject.TestDone) {
          savedQuizObject.TestDetails[quectionIndex].QuectionChecked2 =
            tempcheck ? 1 : 0;
          savedQuizObject.TestDetails[quectionIndex].QuectionChecked1 = 0;
          savedQuizObject.TestDetails[quectionIndex].QuectionChecked3 = 0;
          savedQuizObject.TestDetails[quectionIndex].QuectionChecked4 = 0;
        }
      } else {
        //  console.log("No Quiz Object found in local storage");
      }

      LocalDataStorage.setLocalStorageObject(
        "Test Info",
        JSON.stringify(savedQuizObject)
      );

      if (!checked2) {
        setChecked1(false);
        setChecked3(false);
        setChecked4(false);
        setClicks(clicks + 1);

        // Retrieve from local storage
        const savedQuizObject = JSON.parse(localStorage.getItem("Test Info"));

        // Check if there's a saved object
        if (savedQuizObject) {
          //  console.log("Quiz Object loaded from local storage:", savedQuizObject);

          if (!savedQuizObject.TestDone) {
            savedQuizObject.TestDetails[quectionIndex].QuectionClicks =
              clicks + 1;
          }
        } else {
          //  console.log("No Quiz Object found in local storage");
        }

        LocalDataStorage.setLocalStorageObject(
          "Test Info",
          JSON.stringify(savedQuizObject)
        );
      }
    };
    const handleChange3 = () => {
      let tempcheck = !checked3;
      setChecked3(!checked3);

      // Retrieve from local storage
      const savedQuizObject = JSON.parse(localStorage.getItem("Test Info"));

      // Check if there's a saved object
      if (savedQuizObject) {
        //  console.log("Quiz Object loaded from local storage:", savedQuizObject);

        if (!savedQuizObject.TestDone) {
          savedQuizObject.TestDetails[quectionIndex].QuectionChecked3 =
            tempcheck ? 1 : 0;
          savedQuizObject.TestDetails[quectionIndex].QuectionChecked2 = 0;
          savedQuizObject.TestDetails[quectionIndex].QuectionChecked1 = 0;
          savedQuizObject.TestDetails[quectionIndex].QuectionChecked4 = 0;
        }
      } else {
        //  console.log("No Quiz Object found in local storage");
      }

      LocalDataStorage.setLocalStorageObject(
        "Test Info",
        JSON.stringify(savedQuizObject)
      );

      if (!checked3) {
        setChecked1(false);
        setChecked2(false);
        setChecked4(false);
        setClicks(clicks + 1);
        // Retrieve from local storage
        const savedQuizObject = JSON.parse(localStorage.getItem("Test Info"));

        // Check if there's a saved object
        if (savedQuizObject) {
          //  console.log("Quiz Object loaded from local storage:", savedQuizObject);

          if (!savedQuizObject.TestDone) {
            savedQuizObject.TestDetails[quectionIndex].QuectionClicks =
              clicks + 1;
          }
        } else {
          //  console.log("No Quiz Object found in local storage");
        }

        LocalDataStorage.setLocalStorageObject(
          "Test Info",
          JSON.stringify(savedQuizObject)
        );
      }
    };

    const handleChange4 = () => {
      let tempcheck = !checked4;
      setChecked4(!checked4);

      // Retrieve from local storage
      const savedQuizObject = JSON.parse(localStorage.getItem("Test Info"));

      // Check if there's a saved object
      if (savedQuizObject) {
        //  console.log("Quiz Object loaded from local storage:", savedQuizObject);

        if (!savedQuizObject.TestDone) {
          savedQuizObject.TestDetails[quectionIndex].QuectionChecked4 =
            tempcheck ? 1 : 0;
          savedQuizObject.TestDetails[quectionIndex].QuectionChecked2 = 0;
          savedQuizObject.TestDetails[quectionIndex].QuectionChecked3 = 0;
          savedQuizObject.TestDetails[quectionIndex].QuectionChecked1 = 0;
        }
      } else {
        //  console.log("No Quiz Object found in local storage");
      }

      LocalDataStorage.setLocalStorageObject(
        "Test Info",
        JSON.stringify(savedQuizObject)
      );

      if (!checked4) {
        setChecked1(false);
        setChecked2(false);
        setChecked3(false);
        setClicks(clicks + 1);
        // Retrieve from local storage
        const savedQuizObject = JSON.parse(localStorage.getItem("Test Info"));

        // Check if there's a saved object
        if (savedQuizObject) {
          //  console.log("Quiz Object loaded from local storage:", savedQuizObject);

          if (!savedQuizObject.TestDone) {
            savedQuizObject.TestDetails[quectionIndex].QuectionClicks =
              clicks + 1;
          }
        } else {
          //  console.log("No Quiz Object found in local storage");
        }

        LocalDataStorage.setLocalStorageObject(
          "Test Info",
          JSON.stringify(savedQuizObject)
        );
      }
    };

    //!  key handlings

    const [isRKeyPressed, setIsRKeyPressed] = useState(false);
    const [isNKeyPressed, setIsNKeyPressed] = useState(false);
    const [isPKeyPressed, setIsPKeyPressed] = useState(false);

    const handleKeyDown = (event) => {
      switch (event.key) {
        case "r":
          if (!isRKeyPressed) {
            handleRKeyPress();
          }

          break;
        case "ArrowLeft":
          if (!isPKeyPressed) {
            handlePKeyPress();
          }
          break;
        case "ArrowRight":
          if (!isNKeyPressed) {
            handleNKeyPress();
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
        case "ArrowLeft":
          handlePKeyReleased();
          break;
        case "ArrowRight":
          handleNKeyReleased();
          break;
        default:
          // Handle other keys if needed
          break;
      }
    };

    //! key R

    const handleRKeyPress = () => {
      console.log("R key  pressed");
      setIsRKeyPressed(true);
      handleStartRecording();
    };

    const handleRKeyReleased = () => {
      console.log("R key  released");
      setIsRKeyPressed(false);
      handleStopRecording();
    };

    //! key N

    const handleNKeyPress = () => {
      console.log("N key  pressed");
      setIsNKeyPressed(true);
      nextQcaller(quectionIndex);
    };

    const handleNKeyReleased = () => {
      console.log("N key released");
      setIsNKeyPressed(false);
    };

    //! key P

    const handlePKeyPress = () => {
      console.log("P key  pressed");
      setIsPKeyPressed(true);
      previousQcaller(quectionIndex);
    };

    const handlePKeyReleased = () => {
      console.log("P key released");
      setIsPKeyPressed(false);
    };

    //!=======

    useEffect(() => {
      // Set focus when the component mounts

      if (quectionIndex === index) {
        ref.current.focus();
        // console.log({ quectionIndex, index });
      }
    }, [ref, quectionIndex, index]);

    const handleQDivClick = () => {
      // console.log("Q Div clicked!");
      // Add your custom logic here

      if (quectionIndex > index) {
        setIndex(quectionIndex);
      } else if (quectionIndex < index) {
        setIndex(quectionIndex);
      } else {
      }
    };

    //!=====

    let position = "hideSlide"; // "hideslide";
    // if (quectionIndex === index) {
    //   position = "showSlide"; //activeSlide";
    // }

    const flagsArray = Object.values(viewSlidesFlags);
    const flagAtIndex = flagsArray[quectionIndex];

    //console.log("flagsArray", flagsArray);

    if (flagAtIndex) {
      position = "showSlide";
    }
    if (!q) {
      return <></>;
    }


    const boxStyle = {
      backgroundColor: "#f0f0f0",
      boxShadow: "5px 5px 10px #888888",
      padding: "20px", // Add padding
      margin: "20px", // Add margin
      // boxShadow format: offsetX offsetY blurRadius color
    };

    var content = (
      <div
        key={TestName + "-" + quectionIndex.toString()}
        ref={ref}
        className="MCQModelGeneral"
        tabIndex="0"
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        onClick={handleQDivClick}
        style={quectionIndex === index ? boxStyle : {}}
      >
        <div className="viewSlide">
          <div className={position}>
            <div className="q-cont">
              <div className="q-titile">
                <div className="q-que-box">
                  {" ("}
                  {quectionIndex + 1}
                  {")."}
                  &nbsp;
                  <p>{q}</p>
                  <TextToSpeech text={q} />
                </div>
              </div>

              <div className="q-ans-data">
                <div
                  className="q-ans-image"
                  style={{ display: useImage ? "block" : "none" }}
                >
                  <img
                    src={
                      process.env.PUBLIC_URL +
                      "/McqGeneralQuections/" +
                      nameOftheTest +
                      "/" +
                      "images" +
                      "/" +
                      levelofmcq +
                      "/" +
                      `${quectionIndex + 1}.png`
                    }
                    alt="figure"
                  ></img>
                </div>

                <div
                  className="q-ans-box"
                  style={{ display: useMCQAnswers ? "block" : "none" }}
                >
                  <div className="q-ans-cont1">
                    <div className="q-ans-left">
                      <div
                        className="check-input"
                        key={TestName + "-" + quectionIndex.toString()}
                      >
                        {nameOftheTest === "StreamThree" &&
                          levelofmcq === "q4" ? (
                          <>(1)</>
                        ) : (
                          <>(1)</>
                        )}

                        {/* <input
                        type="radio"
                        name={`question_check_1_${
                          TestName + "-" + quectionIndex.toString()
                        }`}
                        checked={checked1 ? 1 : 0}
                        onChange={handleChange1}
                        // disabled={timer === 0 ? true : false}
                      /> */}
                      </div>
                      <div
                        className="answer-text"
                        style={{
                          backgroundColor: checked1 ? "yellow" : "white",
                        }}
                      >
                        {a1}
                      </div>
                      <TextToSpeech text={a1} />
                    </div>
                    <div className="q-ans-right">
                      <div
                        className="check-input"
                        key={TestName + "-" + quectionIndex.toString()}
                      >
                        {nameOftheTest === "StreamThree" &&
                          levelofmcq === "q4" ? (
                          <>(2)</>
                        ) : (
                          <>(2)</>
                        )}
                        {/* <input
                        type="radio"
                        name={`question_check_2_${
                          TestName + "-" + quectionIndex.toString()
                        }`}
                        checked={checked2 ? 1 : 0}
                        onChange={handleChange2}
                        // disabled={timer === 0 ? true : false}
                      /> */}
                      </div>
                      <div
                        className="answer-text"
                        style={{
                          backgroundColor: checked2 ? "yellow" : "white",
                        }}
                      >
                        {a2}
                      </div>
                      <TextToSpeech text={a2} />
                    </div>
                  </div>
                  <div className="q-ans-cont2">
                    <div className="q-ans-left">
                      <div
                        className="check-input"
                        key={TestName + "-" + quectionIndex.toString()}
                      >
                        {nameOftheTest === "StreamThree" &&
                          levelofmcq === "q4" ? (
                          <>(3)</>
                        ) : (
                          <>(3)</>
                        )}
                        {/* <input
                      type="radio"
                      name={`question_check_3_${
                        TestName + "-" + quectionIndex.toString()
                      }`}
                      checked={checked3 ? 1 : 0}
                      onChange={handleChange3}
                      // disabled={timer === 0 ? true : false}
                    /> */}
                      </div>
                      <div
                        className="answer-text"
                        style={{
                          backgroundColor: checked3 ? "yellow" : "white",
                        }}
                      >
                        {a3}
                      </div>
                      <TextToSpeech text={a3} />
                    </div>
                    <div className="q-ans-right">
                      <div
                        className="check-input"
                        key={TestName + "-" + quectionIndex.toString()}
                      >
                        {nameOftheTest === "StreamThree" &&
                          levelofmcq === "q4" ? (
                          <>(4)</>
                        ) : (
                          <>(4)</>
                        )}
                        {/* <input
                      type="radio"
                      name={`question_check_4_${
                        TestName + "-" + quectionIndex.toString()
                      }`}
                      checked={checked4 ? 1 : 0}
                      onChange={handleChange4}
                      // disabled={timer === 0 ? true : false}
                    /> */}
                      </div>
                      <div
                        className="answer-text"
                        style={{
                          backgroundColor: checked4 ? "yellow" : "white",
                        }}
                      >
                        {a4}
                      </div>
                      <TextToSpeech text={a4} />
                    </div>
                  </div>
                </div>
              </div>

              {useTimeLimit && (
                <div className="q-ans-time">
                  <div className="q-ans-time-left">
                    <div style={{ fontSize: "15px", marginRight: "10px" }}>
                      {"Q"}
                      {quectionIndex + 1}
                      {" time remain : "}
                    </div>
                  </div>
                  <div className="q-ans-time-right">
                    <div
                      style={{
                        fontSize: "15px",
                        fontWeight: "bold",
                        color: seconds < 6 ? "red" : "black",
                      }}
                    >
                      <span>{String(hours).padStart(2, "0")}</span>:
                      <span>{String(minutes).padStart(2, "0")}</span>:
                      <span>{String(seconds).padStart(2, "0")}</span>
                    </div>
                  </div>
                </div>
              )}

              <div
                className="q-ans-speak-text-box"
                style={{ display: "blocked" }}
              >
                <div
                  className="q-ans-speak-text-box-item1"
                  key={`texbox1_${TestName + "-" + quectionIndex.toString()}`}
                >
                  {useSpeechAnswer && <p>Speak Your Answer </p>}
                  {/* {useSpeechAnswer && (
                    <textarea
                      id={`answer_${TestName + "-" + quectionIndex.toString()}`}
                      readOnly
                      value={
                        transcriptCaller.finalTranscript[quectionIndex]
                          ? transcriptCaller.finalTranscript[quectionIndex]
                          : ""
                      }
                    ></textarea>
                  )} */}
                  {audio.current[quectionIndex] && (
                    <audio
                      key={`audio_response_${TestName + "-" + quectionIndex.toString()
                        }`}
                      src={audio.current[quectionIndex]}
                      controls
                    />
                  )}
                  &nbsp;
                  {!timeoverRef.current[quectionIndex] && useSpeechAnswer && (
                    <MDBIcon
                      fas
                      size='3x'
                      icon={
                        isRecordingRef.current
                          ? "microphone"
                          : "microphone-slash"
                      }
                      // size="1x"
                      key={`answer_mic_${TestName + "-" + quectionIndex.toString()
                        }`}
                      onTouchStart={handleStartRecording}
                      onMouseDown={handleStartRecording}
                      onTouchEnd={handleStopRecording}
                      onMouseUp={handleStopRecording}
                      style={{ cursor: "pointer" }}
                    />
                  )}
                </div>

                <div
                  className="q-ans-speak-text-box-item1"
                  key={`texbox2_${TestName + "-" + quectionIndex.toString()}`}
                >
                  <p>AI Response</p>
                  <textarea
                    id={`response_${TestName + "-" + quectionIndex.toString()}`}
                    readOnly
                    value={
                      airesponseRef.current[quectionIndex]
                        ? airesponseRef.current[quectionIndex]
                        : ""
                    }
                  ></textarea>
                  &nbsp;
                  <TextToSpeech
                    text={
                      airesponseRef.current[quectionIndex]
                        ? airesponseRef.current[quectionIndex]
                        : ""
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );

    return content;
  }
);

export default MCQModelGeneral;
