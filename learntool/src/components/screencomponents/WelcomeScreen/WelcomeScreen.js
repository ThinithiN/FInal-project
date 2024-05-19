import React, { useState, useEffect } from "react";

import { useNavigate, useLocation } from "react-router-dom";

import Header from "../Header/Header";
import Footer from "../Footer/Footer";

import Swal from "sweetalert2";

import WelcomeService from "../../../webservices/WelcomeService";

import LocalDataStorage from "../../basiccomponents/LocalStorageHandler/LocalDataStorage";

import "./WelcomeScreen.css";

const WelcomeScreen = () => {
  const navigate = useNavigate();
  const [showAdminBoard, setShowAdminBoard] = useState(false);

  const [userInfo, setUserInfo] = useState(undefined);

  const [selectedStream, setSelectedStream] = useState("none");

  const [isInterviewsDone, seInterviewsDone] = useState(false);

  const [hasMic, setHasMic] = useState(false);
  const [hasCamera, setHasCamera] = useState(false);
  const [mediaStream, setMediaStream] = useState(null);

  useEffect(() => {
    const checkDeviceSupport = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();

        const hasMicrophone = devices.some(
          (device) => device.kind === "audioinput"
        );
        const hasWebcam = devices.some(
          (device) => device.kind === "videoinput"
        );

        setHasMic(hasMicrophone);
        setHasCamera(hasWebcam);
      } catch (error) {
        console.error("Error checking device support:", error);
      }
    };

    checkDeviceSupport();
  }, []);

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

    // const user = JSON.parse(localStorage.getItem("user"));

    try {
      const user = JSON.parse(localStorage.getItem("user"));

      if (user) {
        if (user.isAdmin) {
          setShowAdminBoard(true);

          Swal.close();
          return;
        } else {
          setShowAdminBoard(false);
        }

        WelcomeService.getUserStats(user.userName, user.userId).then(
          (response) => {
            const data = response.data;

            const { userdata } = data;

            console.log({ userdata });

            setUserInfo(userdata);

            setSelectedStream(userdata.stream_selected);

            seInterviewsDone(
              userdata.aiinterviewone_done && userdata.aiinterviewtwo_done
            );

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
      } else {
        alert("Sorry No user data found");
        LocalDataStorage.clearLocalStorage();

        window.location.reload();
      }

      // Continue processing with the 'user' object
    } catch (error) {
      console.error("Error parsing user JSON data:", error);
      Swal.close();
      // Handle the error or provide a default value
      LocalDataStorage.clearLocalStorage();

      window.location.reload();
    }
  };

  useEffect(() => {
    getCrrUserData();
  }, []);

  const requestMediaPermission = async () => {
    try {
      const constraints = { audio: true, video: true };
      const mediaStream = await navigator.mediaDevices.getUserMedia(
        constraints
      );

      // Handle the media stream as needed
      console.log("Media stream:", mediaStream);

      // Store the media stream in state
      setMediaStream(mediaStream);

      return true;
    } catch (error) {
      console.error("Error accessing user media:", error);
      return false;
    }
  };

  const handleInterviews = async () => {
    if (hasMic && hasCamera) {
      let stat = await requestMediaPermission();

      if (stat) {
        if (userInfo.aiinterviewone_done && userInfo.aiinterviewtwo_done) {
          Swal.fire({
            title: "Do you want to retry Interviews again?",

            showCancelButton: true,
            confirmButtonText: "Yes , Proceed ",

            width: "400px",
          }).then((result) => {
            /* Read more about isConfirmed, isDenied below */
            if (result.isConfirmed) {
              Swal.fire({
                title: "Interviews",
                text: "Your are now redirecting to Interviews",
                icon: "success", // You can use 'success', 'error', 'warning', etc.
                showConfirmButton: false, // Hide the OK button
                timer: 2000, // Set the timer for 3 seconds (adjust as needed)
                timerProgressBar: true,
                willClose: () => {
                  // Code to execute when the alert is closed
                  console.log("Alert closed 1");

                  navigate("/AiInterviewOne", {
                    state: {
                      nameOftheTest: "AIOneQuection",
                      isLevelMcq: false,
                      levelofmcq: "",
                      isoverflow: true,
                      qonebyone: true,
                    },
                  });
                },
              });
            }
          });
        } else {
          Swal.fire({
            title: "You will now proceed to Interview Quections",

            showCancelButton: true,
            confirmButtonText: "Yes , Proceed ",

            width: "400px",
          }).then((result) => {
            /* Read more about isConfirmed, isDenied below */
            if (result.isConfirmed) {
              Swal.fire({
                title: "Interviews",
                text: "Your are now redirecting to Interviews",
                icon: "success", // You can use 'success', 'error', 'warning', etc.
                showConfirmButton: false, // Hide the OK button
                timer: 2000, // Set the timer for 3 seconds (adjust as needed)
                timerProgressBar: true,
                willClose: () => {
                  // Code to execute when the alert is closed
                  console.log("Alert closed 2");
                  navigate("/AiInterviewOne", {
                    state: {
                      nameOftheTest: "AIOneQuection",
                      isLevelMcq: false,
                      levelofmcq: "",
                      isoverflow: true,
                      qonebyone: true,
                    },
                  });
                },
              });
            }
          });
        }
      } else {
        alert("No permission to access media devices try reconnecting them");
        return;
      }
    } else {
      alert("No mic or Webcam found");
      return;
    }
  };

  const handleAssignments = async () => {
    if (hasMic && hasCamera) {
      let stat = await requestMediaPermission();

      if (stat) {
        let topic = "";

        if (selectedStream === "StreamOne") {
          topic = "Cyber Security Quiz";
        } else if (selectedStream === "StreamTwo") {
          topic = "Buisness Quiz";
        } else if (selectedStream === "StreamThree") {
          topic = "IT Quiz";
        }

        Swal.fire({
          title: `Assignments`,
          text: `Your are now redirecting to ${topic} assignments`,
          icon: "success", // You can use 'success', 'error', 'warning', etc.
          showConfirmButton: false, // Hide the OK button
          timer: 2000, // Set the timer for 3 seconds (adjust as needed)
          timerProgressBar: true,
          willClose: () => {
            navigate("/Assignments", {
              state: {},
            });
          },
        });
      } else {
        alert("No permission to access media devices try reconnecting them");
        return;
      }
    } else {
      alert("No mic or Webcam found");
      return;
    }
  };

  const handleFinalExam = async () => {
    if (hasMic && hasCamera) {
      requestMediaPermission();

      let stat = await requestMediaPermission();

      if (stat) {
        let topic = "";

        if (selectedStream === "StreamOne") {
          topic = "Cyber Security Quiz";
        } else if (selectedStream === "StreamTwo") {
          topic = "Buisness Quiz";
        } else if (selectedStream === "StreamThree") {
          topic = "IT Quiz";
        }

        Swal.fire({
          title: `Final Exam`,
          text: `Your are now redirecting to ${topic} final exam`,
          icon: "success", // You can use 'success', 'error', 'warning', etc.
          showConfirmButton: false, // Hide the OK button
          timer: 2000, // Set the timer for 3 seconds (adjust as needed)
          timerProgressBar: true,
          willClose: () => {
            navigate("/FinalExam", {
              state: {
                nameOftheTest: "FinalQuection",
                isLevelMcq: false,
                levelofmcq: "",
                isoverflow: true,
                qonebyone: true,
                streamSelected: userInfo?.stream_selected
                  ? userInfo?.stream_selected
                  : "",
              },
            });
          },
        });
      } else {
        alert("No permission to access media devices try reconnecting them");
        return;
      }
    } else {
      alert("No mic or Webcam found");
      return;
    }
  };

  const handleRewards = () => {
    let topic = "";
    let path = "/";

    if (selectedStream === "StreamOne") {
      topic = "Cyber Security Quiz";

      path = "/StreamOneRewards";
    } else if (selectedStream === "StreamTwo") {
      topic = "Buisness Quiz";

      path = "/StreamTwoRewards";
    } else if (selectedStream === "StreamThree") {
      topic = "IT Quiz";

      path = "/StreamThreeRewards";
    }

    let whereTo = {
      path: path,
      nameOftheTest: selectedStream,
    };

    Swal.fire({
      title: `${topic}`,
      text: `Your are now redirecting to ${topic} rewards`,
      icon: "success", // You can use 'success', 'error', 'warning', etc.
      showConfirmButton: false, // Hide the OK button
      timer: 2000, // Set the timer for 3 seconds (adjust as needed)
      timerProgressBar: true,
      willClose: () => {
        navigate(path, {
          state: {
            nameOftheTest: selectedStream,
            whereTo,
          },
        });
      },
    });
  };

  const gotoAdmin = () => {
    navigate("/Admin", {
      state: {},
    });
  };

  useEffect(() => {
    return () => {
      // Stop and release the media stream when the component unmounts
      if (mediaStream) {
        console.log("cleaning  up   initial stream");
        mediaStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [mediaStream]);

  const disabledStyle = {
    pointerEvents: !isInterviewsDone ? "none" : "auto",
    opacity: !isInterviewsDone ? 0.5 : 1,
  };

  var contentNew = (
    <>
      <div className="WelcomeScreen">
        <div className="Top">
          <Header />
        </div>
        <div className="Mid">
          {!isInterviewsDone && !showAdminBoard ? (
            <p
              style={{
                fontSize: "20px",
                fontWeight: "bold",
                width: "88%",
                boxShadow: "rgb(0 0 0 / 90%) 1px 1px 10px",
                borderRadius: "8px",
                backgroundColor: "white",
                padding: "10px",
                opacity: "0.8",
                alignItems: "center",
                justifyContent: "center",
                display: "flex",
              }}
            >
              First , Try Interview One & Interview Two to find out what stream
              from Cyber Secuirty , Buisness , IT suitable for you !!
            </p>
          ) : (
            <></>
          )}

          <div className="btn-container">
            {showAdminBoard ? (
              <div>
                <button className="custom-btn btn-blue" onClick={gotoAdmin}>
                  <span>Admin Page</span>
                </button>
              </div>
            ) : (
              <>
                <div>
                  <button
                    className="custom-btn btn-blue"
                    onClick={handleInterviews}
                  >
                    <span>Interviews</span>
                  </button>
                </div>

                <div style={disabledStyle}>
                  <button
                    className="custom-btn btn-blue"
                    onClick={handleAssignments}
                  >
                    <span>Assignments</span>
                  </button>
                </div>
                <div style={disabledStyle}>
                  <button
                    className="custom-btn btn-blue"
                    onClick={() => {
                      if (
                        userInfo.stream_level_1_done &&
                        userInfo.stream_level_2_done &&
                        userInfo.stream_level_3_done &&
                        userInfo.stream_level_4_done
                        // true
                      ) {
                        handleFinalExam();
                      } else {
                        Swal.fire({
                          title: `Final Exam`,
                          text: `Your Must go thorugh all the assignments first to attempt this final quiz`,
                          icon: "warning", // You can use 'success', 'error', 'warning', etc.
                          showConfirmButton: true, // Hide the OK button
                          timer: 3000, // Set the timer for 3 seconds (adjust as needed)
                          timerProgressBar: true,
                          willClose: () => {},
                        });
                      }
                    }}
                  >
                    <span>Final Exam</span>
                  </button>
                </div>
                <div style={disabledStyle}>
                  <button
                    className="custom-btn btn-blue"
                    onClick={handleRewards}
                  >
                    <span>Rewards</span>
                  </button>
                </div>
              </>
            )}
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

export default WelcomeScreen;
