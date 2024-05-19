import React, { useState, useEffect } from "react";

import { useNavigate, useLocation } from "react-router-dom";

import Swal from "sweetalert2";

import Header from "../Header/Header";
import Footer from "../Footer/Footer";

import "./VideoPlayerScreen.css";
import TutorialsServices from "../../../webservices/TutorialsServices";

const VideoPlayerScreen = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [videos, setVideos] = useState([]);

  const [activeVideo, setActiveVideo] = useState(null);

  const [loading, setLoading] = useState(true);

  const [videoSrcPath, setVideoSrcPath] = useState("");

  const handleVideoClick = (event) => {
    // console.log("1", event.target);
    // console.log("2", event.target.querySelector(".list-video"));

    // console.log("3", event.target.querySelector(".list-video").src);

    // Get the src and title of the clicked video
    const src = event.target.querySelector(".list-video").src;
    const title = event.target.querySelector(".list-title").innerHTML;

    // Update the active video state and play the video
    setActiveVideo(event.target);
    document.querySelector(".main-video-container .main-video").src = src;
    document.querySelector(".main-video-container .main-video").play();
    document.querySelector(".main-video-container .main-vid-title").innerHTML =
      title;
  };

  const loadTutorials = () => {
    setLoading(true);

    Swal.fire({
      title: "Please wait!",
      text: "Please wait loading Tutorials!!",
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
    let video_path =
      process.env.PUBLIC_URL +
      "/McqGeneralQuections/" +
      location.state.nameOftheTest +
      "/videos/videoinfo.json";

    //setVideoSrcPath
    let video_src_path =
      "/McqGeneralQuections/" +
      location.state.nameOftheTest +
      "/videos/" +
      location.state.levelofmcq +
      "/";

    setVideoSrcPath(video_src_path);

    TutorialsServices.loadVideos(video_path).then(
      (response) => {
        const data = response.data;

        // console.log(" res data ", data);

        if (location.state.levelofmcq === "q1") {
          setVideos(data.A);
        } else if (location.state.levelofmcq === "q2") {
          setVideos(data.B);
        } else if (location.state.levelofmcq === "q3") {
          setVideos(data.C);
        } else if (location.state.levelofmcq === "q4") {
          setVideos(data.D);
        }

        Swal.close();

        setLoading(false);
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
          title: "Load Videos",
          text: "No Videos found",
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

  useEffect(() => {
    loadTutorials();
  }, []);

  let topic = "";

  if (location.state.nameOftheTest === "StreamOne") {
    topic =
      "Cyber Security Quiz" +
      (location.state.levelofmcq === "q1"
        ? " Level 1"
        : location.state.levelofmcq === "q2"
        ? " Level 2"
        : location.state.levelofmcq === "q3"
        ? " Level 3"
        : location.state.levelofmcq === "q4"
        ? " Level 4"
        : "");
  } else if (location.state.nameOftheTest === "StreamTwo") {
    topic =
      "Buisness Quiz" +
      (location.state.levelofmcq === "q1"
        ? " Level 1"
        : location.state.levelofmcq === "q2"
        ? " Level 2"
        : location.state.levelofmcq === "q3"
        ? " Level 3"
        : location.state.levelofmcq === "q4"
        ? " Level 4"
        : "");
  } else if (location.state.nameOftheTest === "StreamThree") {
    topic =
      "IT Quiz" +
      (location.state.levelofmcq === "q1"
        ? " Level 1"
        : location.state.levelofmcq === "q2"
        ? " Level 2"
        : location.state.levelofmcq === "q3"
        ? " Level 3"
        : location.state.levelofmcq === "q4"
        ? " Level 4"
        : "");
  }

  const handleStartQuiz = () => {
    Swal.fire({
      title: `Do you want to start ${topic} quiz?`,

      showCancelButton: true,
      confirmButtonText: "Yes , Proceed ",

      width: "400px",
    }).then((result) => {
      /* Read more about isConfirmed, isDenied below */
      if (result.isConfirmed) {
        Swal.fire({
          title: `${topic}`,
          text: `Your are now redirecting to ${topic} quiz in 4 seconds`,
          icon: "success", // You can use 'success', 'error', 'warning', etc.
          showConfirmButton: false, // Hide the OK button
          timer: 4000, // Set the timer for 3 seconds (adjust as needed)
          timerProgressBar: true,
          willClose: () => {
            console.log(" where to => ", location.state.whereTo);
            navigate(location.state.whereTo.path, {
              state: {
                nameOftheTest: location.state.whereTo.nameOftheTest,
                isLevelMcq: location.state.whereTo.isLevelMcq,
                levelofmcq: location.state.whereTo.levelofmcq,
                isoverflow: location.state.whereTo.isoverflow,
                qonebyone: location.state.whereTo.qonebyone,
              },
            });
          },
        });
      }
    });
  };

  var midcontent = (
    <div className="playercontainer">
      {!loading && (
        <>
          {" "}
          <div className="main-video-container">
            <video className="main-video" controls></video>
            <div className="main-vid-title"></div>
          </div>
          <div className="listed_data">
            <div className="video-list-container">
              {videos.map((video, index) => (
                <div
                  key={video.title}
                  className={`list ${
                    activeVideo === video.title ? "active" : ""
                  }`}
                  onClick={handleVideoClick}
                >
                  <video
                    className="list-video"
                    src={videoSrcPath + video.src}
                    onClick={(e) => e.stopPropagation()}
                    style={{ cursor: "not-allowed" }}
                  ></video>
                  <div
                    className="list-title"
                    style={{ cursor: "not-allowed" }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {video.title}
                  </div>
                </div>
              ))}
            </div>
            <div className="player-btm-submit">
              <button onClick={handleStartQuiz}>Start Quiz</button>
            </div>
          </div>
        </>
      )}
    </div>
  );

  var content = (
    <>
      <div className="player-self">
        <div className="player-top">
          <Header />
        </div>

        <div className="palyer-mid">
          <div className="topic">
            <p style={{ fontSize: "30px", fontWeight: "normal" }}>
              {" "}
              You can watch and learn before attempt {topic}{" "}
            </p>
          </div>

          <div className="player"> {midcontent}</div>
          <div className="info"></div>
        </div>
        <div className="player-btm">
          <Footer />
        </div>
      </div>
    </>
  );

  return content;
};

export default VideoPlayerScreen;
