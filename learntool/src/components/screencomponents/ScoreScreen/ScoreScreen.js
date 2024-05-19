import React, { useState, useEffect } from "react";

import { useNavigate, useLocation } from "react-router-dom";

import Header from "../Header/Header";
import Footer from "../Footer/Footer";

import Star from "../../../assets/Images/star.png";
import StarE from "../../../assets/Images/starE.png";

import Scoregood_BG from "../../../assets/Images/kidsgood.jpg";
import Scorebad_BG from "../../../assets/Images/kidsbad.jpg";

import Swal from "sweetalert2";

import WelcomeService from "../../../webservices/WelcomeService";

import LocalDataStorage from "../../basiccomponents/LocalStorageHandler/LocalDataStorage";

import "./ScoreScreen.css";

const ScoreScreen = () => {
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

  const [userInfo, setUserInfo] = useState(undefined);

  const [statusMsg, setStatusMsg] = useState("");

  const [scoreNow, setScoreNow] = useState("0/10");

  const [isGoodScore, setIsGoodScore] = useState(false);

  const [facialScore, setFacialScore] = useState(undefined);

  const StarRating = ({ score }) => {
    // Parse the score
    const [numerator, denominator] = score.split("/").map(Number);

    // Calculate the percentage
    const percentage = (numerator / denominator) * 100;

    // Determine the number of stars to display
    const numStars = Math.round((percentage / 100) * 3); // Assuming you have 3 stars

    // Generate an array of star elements
    const stars = Array.from({ length: 3 }, (_, index) => (
      <img
        key={index}
        src={index < numStars ? Star : StarE}
        alt={index < numStars ? "filled star" : "empty star"}
        className={index === 1 ? "star" : "star small"}
      />
    ));

    return <div className="stars">{stars}</div>;
  };

  const StatusRating = (score) => {
    // Parse the score
    const [numerator, denominator] = score.split("/").map(Number);

    var numeratorx = parseInt(numerator);

    if (numeratorx >= 0 && numeratorx <= 2) {
      return 0;
    } else if (numeratorx > 2 && numeratorx <= 4) {
      return 1;
    } else if (numeratorx > 4 && numeratorx <= 7) {
      return 2;
    } else {
      return 3;
    }

    // // Calculate the percentage
    // const percentage = (numerator / denominator) * 100;

    // // Determine the number of stars to display
    // const numStars = Math.round((percentage / 100) * 3); // Assuming you have 3 stars

    // return numStars;
  };

  const [tempStream, setTempStream] = useState("");

  const getCrrUserData = () => {
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

    WelcomeService.getUserStats(user.userName, user.userId).then(
      (response) => {
        const data = response.data;

        const { userdata } = data;

        console.log({ userdata });

        setUserInfo(userdata);

        //Congratulations! you have unlocked level one rewards &#127881

        // userdata.nameOftheTest === "AITwoQuection"

        if (
          userdata.hasOwnProperty("FinalQuection") &&
          nameOftheTest === "FinalQuection"
        ) {
          let score = userdata.FinalQuection.Score;

          console.log(
            " facial Score ",
            userdata.FinalQuection.TestFinalFacialScore
          );

          setFacialScore(userdata.FinalQuection.TestFinalFacialScore);

          let selectedStream = userdata.stream_selected;

          let stream = "";

          if (selectedStream === "StreamOne") {
            stream = " Cyber Security ";
          } else if (selectedStream === "StreamTwo") {
            stream = " Buisness ";
          } else if (selectedStream === "StreamThree") {
            stream = " IT ";
          }

          console.log({ score });

          setScoreNow(score);

          let statusNumber = StatusRating(score);

          let status = "";

          let topic = "Final Exam ";

          if (statusNumber === 0) {
            status = `Sorry ! You should try again the ${stream} stream ${topic} quiz`;
            setIsGoodScore(false);
          } else if (statusNumber === 1) {
            status = `Sorry ! You should try again the ${stream} stream ${topic} quiz`;
            setIsGoodScore(false);
          } else if (statusNumber === 2) {
            status = `Good ! You did some good work on the ${stream} stream ${topic} quiz`;
            setIsGoodScore(true);
          } else if (statusNumber === 3) {
            status = `Very Good ! You did some very good work on the ${stream} stream ${topic} quiz`;
            setIsGoodScore(true);
          }

          setStatusMsg(status);
        } else if (
          userdata.hasOwnProperty("AIOneQuection") &&
          nameOftheTest === "AIOneQuection"
        ) {
          let score = userdata.AIOneQuection.Score;

          let selectedStream = userdata.stream_selected;

          let stream = "";

          if (selectedStream === "StreamOne") {
            stream = " Cyber Security ";
          } else if (selectedStream === "StreamTwo") {
            stream = " Buisness ";
          } else if (selectedStream === "StreamThree") {
            stream = " IT ";
          }

          setTempStream(stream);

          console.log({ score });

          setScoreNow(score);

          let statusNumber = StatusRating(score);

          let status = "";

          let topic = "Interview One ";

          if (statusNumber === 0) {
            status = `Sorry ! You should try again the ${topic} quiz, anyway you selected to ${stream} Stream`;
            setIsGoodScore(false);
          } else if (statusNumber === 1) {
            status = `Sorry ! You should try again the ${topic} quiz, anyway you selected to ${stream} Stream`;
            setIsGoodScore(false);
          } else if (statusNumber === 2) {
            status = `Good ! You did some good work on the ${topic} quiz, you selected to ${stream} Stream`;
            setIsGoodScore(true);
          } else if (statusNumber === 3) {
            status = `Very Good ! You did some very good work on the ${topic} quiz,  you selected to ${stream} Stream`;
            setIsGoodScore(true);
          }

          setStatusMsg(status);
        } else if (
          userdata.hasOwnProperty("AITwoQuection") &&
          nameOftheTest === "AITwoQuection"
        ) {
          let score = userdata.AITwoQuection.Score;

          let performance = userdata.aione_aitwo_final_state;

          let selectedStream = userdata.stream_selected;

          let stream = "";

          if (selectedStream === "StreamOne") {
            stream = " Cyber Security ";
          } else if (selectedStream === "StreamTwo") {
            stream = " Buisness ";
          } else if (selectedStream === "StreamThree") {
            stream = " IT ";
          }

          setScoreNow(score);

          let statusNumber = StatusRating(score);

          let status = "";

          let topic = "Interview Two ";

          if (statusNumber === 0) {
            status = `Sorry ! You should try again the ${stream} Stream ${topic} quiz, your performnace ${performance}`;
            setIsGoodScore(false);
          } else if (statusNumber === 1) {
            status = `Sorry ! You should try again the ${stream} Stream ${topic} quiz, your performnace ${performance}`;
            setIsGoodScore(false);
          } else if (statusNumber === 2) {
            status = `Good ! You did some good work on the ${stream} Stream ${topic} quiz, your performnace ${performance} `;
            setIsGoodScore(true);
          } else if (statusNumber === 3) {
            status = `Very Good ! You did some very good work on the ${stream} Stream ${topic} quiz, your performnace ${performance}, Congartulations! you have unlocked rewards for level 1 and level 2`;
            setIsGoodScore(true);
          }

          setStatusMsg(status);
        } else {
          if (
            userdata.hasOwnProperty("StreamOne") &&
            nameOftheTest === "StreamOne"
          ) {
            let level = "";

            let score = "0/10";

            if (levelofmcq === "q1") {
              level = " Level One ";
              score = userdata.StreamOne.q1.Score;
            } else if (levelofmcq === "q2") {
              level = " Level Two ";
              score = userdata.StreamOne.q2.Score;
            } else if (levelofmcq === "q3") {
              level = " Level Three ";
              score = userdata.StreamOne.q3.Score;
            } else if (levelofmcq === "q4") {
              level = " Level Four ";
              score = userdata.StreamOne.q4.Score;
            }

            setScoreNow(score);

            let statusNumber = StatusRating(score);

            let status = "";

            if (statusNumber === 0) {
              status = `Sorry ! You should try again the Cyber Security ${level}  quiz`;
              setIsGoodScore(false);
            } else if (statusNumber === 1) {
              status = `Sorry ! You should try again the Cyber Security ${level} quiz`;
              setIsGoodScore(false);
            } else if (statusNumber === 2) {
              status = `Good ! You unlock game rewards for Cyber Security ${level} quiz`;
              setIsGoodScore(true);
            } else if (statusNumber === 3) {
              status = `Very Good ! You unlock game rewards for Cyber Security ${level}  quiz `;
              setIsGoodScore(true);
            }

            setStatusMsg(status);
          } else if (
            userdata.hasOwnProperty("StreamTwo") &&
            nameOftheTest === "StreamTwo"
          ) {
            let level = "";

            let score = "0/10";

            if (levelofmcq === "q1") {
              level = " Level One ";
              score = userdata.StreamTwo.q1.Score;
            } else if (levelofmcq === "q2") {
              level = " Level Two ";
              score = userdata.StreamTwo.q2.Score;
            } else if (levelofmcq === "q3") {
              level = " Level Three ";
              score = userdata.StreamTwo.q3.Score;
            } else if (levelofmcq === "q4") {
              level = " Level Four ";
              score = userdata.StreamTwo.q4.Score;
            }

            setScoreNow(score);

            let statusNumber = StatusRating(score);

            let status = "";

            if (statusNumber === 0) {
              status = `Sorry ! You should try again the Buisness ${level}  quiz`;
              setIsGoodScore(false);
            } else if (statusNumber === 1) {
              status = `Sorry ! You should try again the Buisness ${level} quiz`;
              setIsGoodScore(false);
            } else if (statusNumber === 2) {
              status = `Good ! You unlock game rewards for Buisness ${level} quiz`;
              setIsGoodScore(true);
            } else if (statusNumber === 3) {
              status = `Very Good ! You unlock game rewards for Buisness ${level}  quiz `;
              setIsGoodScore(true);
            }

            setStatusMsg(status);
          } else if (
            userdata.hasOwnProperty("StreamThree") &&
            nameOftheTest === "StreamThree"
          ) {
            let level = "";

            let score = "0/10";

            if (levelofmcq === "q1") {
              level = " Level One ";
              score = userdata.StreamThree.q1.Score;
            } else if (levelofmcq === "q2") {
              level = " Level Two ";
              score = userdata.StreamThree.q2.Score;
            } else if (levelofmcq === "q3") {
              level = " Level Three ";
              score = userdata.StreamThree.q3.Score;
            } else if (levelofmcq === "q4") {
              level = " Level Four ";
              score = userdata.StreamThree.q4.Score;
            }

            setScoreNow(score);

            let statusNumber = StatusRating(score);

            let status = "";
            if (statusNumber === 0) {
              status = `Sorry ! You should try again the IT ${level}  quiz`;
              setIsGoodScore(false);
            } else if (statusNumber === 1) {
              status = `Sorry ! You should try again the IT ${level} quiz`;
              setIsGoodScore(false);
            } else if (statusNumber === 2) {
              status = `Good ! You unlock game rewards for IT ${level} quiz`;
              setIsGoodScore(true);
            } else if (statusNumber === 3) {
              status = `Very Good ! You unlock game rewards for IT ${level}  quiz `;
              setIsGoodScore(true);
            }

            setStatusMsg(status);
          }
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

        Swal.close();

        Swal.fire({
          icon: "error",
          title: "No user Data found something wrong",
          text: resMessage,
          confirmButtonText: "OK",
          confirmButtonColor: "red",
          allowOutsideClick: false,
          width: "400px",
          willClose: () => {
            LocalDataStorage.clearLocalStorage();

            window.location.reload();
          },
        });
      }
    );
  };

  useEffect(() => {
    getCrrUserData();
  }, []);

  const handleFinish = () => {
    Swal.fire({
      title: "Please wait !!",
      allowEscapeKey: false,
      allowOutsideClick: false,
      width: "350px",
      timer: 1000, // Set the timer for 3 seconds (adjust as needed)
      timerProgressBar: true,
      didOpen: () => {
        Swal.showLoading();
      },
      willClose: () => {
        if (location.state.whereTo.path === "") {
          navigate("/");
        } else {
          navigate("/AiInterviewTwo", {
            state: {
              nameOftheTest: "AITwoQuection",
              isLevelMcq: false,
              levelofmcq: "",
              isoverflow: true,
              qonebyone: true,
              streamAItwo: userInfo?.stream_selected
              ? userInfo?.stream_selected
              : "StreamOne",
            },
          });
        }
      },
    });
  };

  var contentNew = (
    <>
      <div className="ScoreScreen">
        <div className="Top">
          <Header />
        </div>
        <div
          className="Mid"
          style={{
            backgroundImage: isGoodScore
              ? `url(${Scoregood_BG})`
              : `url(${Scorebad_BG})`,
          }}
        >
          <div className="Score-view">
            <div className="title">
              {nameOftheTest === "AIOneQuection"
                ? "Your Stream is"
                : "You Scored"}
            </div>
            <div className="score">
              {nameOftheTest === "AIOneQuection" ? tempStream : scoreNow}
            </div>
            <StarRating score={scoreNow} />
            <p>{facialScore ? `Facial Score is ${facialScore}` : ""}</p>
            <div className="status">{statusMsg}</div>

            <div>
              <button className="custom-btn btn-blue" onClick={handleFinish}>
                <span>Finish</span>
              </button>
            </div>
          </div>
        </div>
        <div className="Bot">
          <Footer />
        </div>
      </div>
    </>
  );

  return contentNew;
};

export default ScoreScreen;
