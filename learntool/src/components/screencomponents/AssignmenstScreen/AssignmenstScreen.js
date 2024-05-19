import React, { useState, useEffect } from "react";

import { useNavigate, useLocation } from "react-router-dom";

import Swal from "sweetalert2";

import WelcomeService from "../../../webservices/WelcomeService";

import LocalDataStorage from "../../basiccomponents/LocalStorageHandler/LocalDataStorage";

import Header from "../Header/Header";
import Footer from "../Footer/Footer";

import Star from "../../../assets/Images/star.png";
import StarE from "../../../assets/Images/starE.png";

import "./AssignmenstScreen.css";

const AssignmenstScreen = () => {
  const navigate = useNavigate();

  const [userInfo, setUserInfo] = useState(undefined);

  const [selectedStream, setSelectedStream] = useState("none");

  const [l1Score, setL1Score] = useState("0/10");
  const [l2Score, setL2Score] = useState("0/10");
  const [l3Score, setL3Score] = useState("0/10");
  const [l4Score, setL4Score] = useState("0/10");

  const [islevel1done, setIsLevel1Done] = useState(0);
  const [islevel2done, setIsLevel2Done] = useState(0);
  const [islevel3done, setIsLevel3Done] = useState(0);
  const [islevel4done, setIsLevel4Done] = useState(0);

  const [isblind, setIsblind] = useState(0);

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

        setIsblind(userdata.blind);

        setL1Score(userdata.stream_level_1_score);
        setL2Score(userdata.stream_level_2_score);
        setL3Score(userdata.stream_level_3_score);
        setL4Score(userdata.stream_level_4_score);

        setSelectedStream(userdata.stream_selected);

        setIsLevel1Done(userdata.stream_level_1_done);
        setIsLevel2Done(userdata.stream_level_2_done);
        setIsLevel3Done(userdata.stream_level_3_done);
        setIsLevel4Done(userdata.stream_level_4_done);

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

  const handleLevelQuiz = (level, isMcq) => {
    console.log(" called y? ");
    let alreadyDone = 0;

    if (level === "q1") {
      alreadyDone = islevel1done;
    } else if (level === "q2") {
      alreadyDone = islevel2done;
    } else if (level === "q3") {
      alreadyDone = islevel3done;
    } else if (level === "q4") {
      alreadyDone = islevel4done;
    }

    let topic = "";
    let path = "/";

    if (selectedStream === "StreamOne") {
      topic =
        "Cyber Security Quiz" +
        (level === "q1"
          ? " Level 1"
          : level === "q2"
          ? " Level 2"
          : level === "q3"
          ? " Level 3"
          : level === "q4"
          ? " Level 4"
          : "");

      if (level === "q1") {
        path = "/QuizStreamOne_L1";
      } else if (level === "q2") {
        path = "/QuizStreamOne_L2";
      } else if (level === "q3") {
        path = "/QuizStreamOne_L3";
      } else if (level === "q4") {
        path = "/QuizStreamOne_L4";
      }
    } else if (selectedStream === "StreamTwo") {
      topic =
        "Buisness Quiz" +
        (level === "q1"
          ? " Level 1"
          : level === "q2"
          ? " Level 2"
          : level === "q3"
          ? " Level 3"
          : level === "q4"
          ? " Level 4"
          : "");

      if (level === "q1") {
        path = "/QuizStreamTwo_L1";
      } else if (level === "q2") {
        path = "/QuizStreamTwo_L2";
      } else if (level === "q3") {
        path = "/QuizStreamTwo_L3";
      } else if (level === "q4") {
        path = "/QuizStreamTwo_L4";
      }
    } else if (selectedStream === "StreamThree") {
      topic =
        "IT Quiz" +
        (level === "q1"
          ? " Level 1"
          : level === "q2"
          ? " Level 2"
          : level === "q3"
          ? " Level 3"
          : level === "q4"
          ? " Level 4"
          : "");

      if (level === "q1") {
        path = "/QuizStreamThree_L1";
      } else if (level === "q2") {
        path = "/QuizStreamThree_L2";
      } else if (level === "q3") {
        path = "/QuizStreamThree_L3";
      } else if (level === "q4") {
        path = "/QuizStreamThree_L4";
      }
    }

    let whereTo = {
      path: path,
      nameOftheTest: selectedStream,
      isLevelMcq: isMcq,
      levelofmcq: level,
      isoverflow: true,
      qonebyone: true,
    };

    if (alreadyDone) {
      Swal.fire({
        title: `Do you want to retry ${topic} again?`,

        showCancelButton: true,
        confirmButtonText: "Yes , Proceed ",

        width: "400px",
      }).then((result) => {
        /* Read more about isConfirmed, isDenied below */
        if (result.isConfirmed) {
          Swal.fire({
            title: `${topic}`,
            text: `Your are now redirecting to ${topic}`,
            icon: "success", // You can use 'success', 'error', 'warning', etc.
            showConfirmButton: false, // Hide the OK button
            timer: 3000, // Set the timer for 3 seconds (adjust as needed)
            timerProgressBar: true,
            willClose: () => {
              navigate("/Tutorials", {
                state: {
                  nameOftheTest: selectedStream,
                  isLevelMcq: isMcq,
                  levelofmcq: level,
                  isoverflow: true,
                  qonebyone: true,
                  whereTo,
                },
              });
            },
          });
        }
      });
    } else {
      Swal.fire({
        title: `Do you want to try ${topic} again?`,

        showCancelButton: true,
        confirmButtonText: "Yes , Proceed ",

        width: "400px",
      }).then((result) => {
        /* Read more about isConfirmed, isDenied below */
        if (result.isConfirmed) {
          Swal.fire({
            title: `${topic}`,
            text: `Your are now redirecting to video tutorials of ${topic} there after you can start the quiz`,
            icon: "success", // You can use 'success', 'error', 'warning', etc.
            showConfirmButton: false, // Hide the OK button
            timer: 4000, // Set the timer for 3 seconds (adjust as needed)
            timerProgressBar: true,
            willClose: () => {
              navigate("/Tutorials", {
                state: {
                  nameOftheTest: selectedStream,
                  isLevelMcq: isMcq,
                  levelofmcq: level,
                  isoverflow: true,
                  qonebyone: true,
                  whereTo,
                },
              });
            },
          });
        }
      });
    }
  };

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

  let streamP = "none";

  if (selectedStream === "StreamOne") {
    streamP = " Cyber Security ";
  } else if (selectedStream === "StreamTwo") {
    streamP = " Buisness ";
  } else if (selectedStream === "StreamThree") {
    streamP = " IT ";
  }
  var contentNew = (
    <>
      <div className="AssignmenstScreen">
        <div className="Top">
          <Header />
        </div>
        <div className="Mid">
          <div className="asgn-container">
            <p style={{ fontSize: "30px", fontWeight: "normal" }}>
              Below quizes are based on stream{" "}
              <span style={{ fontSize: "30px", fontWeight: "bold" }}>
                {streamP}
              </span>
            </p>

            <p style={{ fontSize: "20px", fontWeight: "normal", color: "red" }}>
              Score more to unlock rewards for each quiz level{" "}
            </p>

            {!isblind && (
              <div className="custom-info-view">
                <div>
                  <button
                    className="custom-btn btn-blue"
                    onClick={() => {
                      handleLevelQuiz("q1", true);
                    }}
                  >
                    <span>Level One Quiz</span>
                  </button>
                </div>

                <StarRating score={l1Score} />

                <div className="score-data">{l1Score}</div>
              </div>
            )}

            <div className="custom-info-view">
              <div>
                <button
                  className="custom-btn btn-blue"
                  onClick={() => {
                    handleLevelQuiz("q2", true);
                  }}
                >
                  <span>Level Two Quiz</span>
                </button>
              </div>

              <StarRating score={l2Score} />

              <div className="score-data">{l2Score}</div>
            </div>

            <div className="custom-info-view">
              <div>
                <button
                  className="custom-btn btn-blue"
                  onClick={() => {
                    handleLevelQuiz("q3", true);
                  }}
                >
                  <span>Level Three Quiz</span>
                </button>
              </div>

              <StarRating score={l3Score} />

              <div className="score-data">{l3Score}</div>
            </div>

            <div className="custom-info-view">
              <div>
                <button
                  className="custom-btn btn-blue"
                  onClick={() => {
                    handleLevelQuiz("q4", true);
                  }}
                >
                  <span>Level Four Quiz</span>
                </button>
              </div>

              <StarRating score={l4Score} />

              <div className="score-data">{l4Score}</div>
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

export default AssignmenstScreen;
