import React, { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";

import Layout from "./components/basiccomponents/Layout/Layout";

import AuthScreen from "./components/screencomponents/AuthScreen/AuthScreen";

import MCQGeneralScreen from "./components/screencomponents/MCQGeneralScreen/MCQGeneralScreen";

import WelcomeScreen from "./components/screencomponents/WelcomeScreen/WelcomeScreen";

import AssignmenstScreen from "./components/screencomponents/AssignmenstScreen/AssignmenstScreen";

import RewardsScreen from "./components/screencomponents/RewardsScreen/RewardsScreen";

import ScoreScreen from "./components/screencomponents/ScoreScreen/ScoreScreen";

import VideoPlayerScreen from "./components/screencomponents/VideoPlayerScreen/VideoPlayerScreen";

import AdminScreen from "./components/screencomponents/AdminScreen/AdminScreen";

import TestScreen from "./components/screencomponents/TestScreen/TestScreen";

import EventBus from "./common/EventBus";

import { GlobalStateProvider } from "./global/global";

function App() {
  const [showAdminBoard, setShowAdminBoard] = useState(false);

  const [currentUser, setCurrentUser] = useState(false);

  const logOut = () => {
    localStorage.removeItem("user");

    setShowAdminBoard(false);
    setCurrentUser(undefined);
  };

  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));

      if (user) {
        console.log({ user });

        setCurrentUser(user);

        if (user.isAdmin) {
          setShowAdminBoard(true);
        } else {
          setShowAdminBoard(false);
        }
      }

      // Continue processing with the 'user' object
    } catch (error) {
      console.error("Error parsing user JSON data:", error);
      // Handle the error or provide a default value
    }

    // if (
    //   window.location.pathname === "/mcq" ||
    //   window.location.pathname === "/sellstock" ||
    //   window.location.pathname === "/inquiry" ||
    //   window.location.pathname === "/consult"
    // ) {
    //   console.log(window.location.pathname);
    // } else {
    //   console.log(window.location.pathname);
    //   navigate("/");
    // }

    // console.log("crr window path -> ", window.location.pathname);

    EventBus.on("logout", () => {
      logOut();
    });

    return () => {
      EventBus.remove("logout");
    };
  }, []);

  let content = null;

  content = (
    <>
      <GlobalStateProvider>
        <Routes>
          {!currentUser ? (
            <Route path="/" element={<Layout />}>
              <Route index element={<AuthScreen />} />
              {/* <Route path="aboutus" element={<About />} />
            <Route path="contactus" element={<ContactUS />} /> */}
            </Route>
          ) : (
            <>
              <Route path="/" element={<Layout />}>
                <Route index element={<WelcomeScreen />} />

                <Route path="FinalExam" element={<MCQGeneralScreen />} />

                <Route path="AiInterviewOne" element={<MCQGeneralScreen />} />
                <Route path="AiInterviewTwo" element={<MCQGeneralScreen />} />

                <Route path="QuizStreamOne_L1" element={<MCQGeneralScreen />} />
                <Route path="QuizStreamOne_L2" element={<MCQGeneralScreen />} />
                <Route path="QuizStreamOne_L3" element={<MCQGeneralScreen />} />
                <Route path="QuizStreamOne_L4" element={<MCQGeneralScreen />} />
                <Route path="QuizStreamTwo_L1" element={<MCQGeneralScreen />} />
                <Route path="QuizStreamTwo_L2" element={<MCQGeneralScreen />} />
                <Route path="QuizStreamTwo_L3" element={<MCQGeneralScreen />} />
                <Route path="QuizStreamTwo_L4" element={<MCQGeneralScreen />} />
                <Route
                  path="QuizStreamThree_L1"
                  element={<MCQGeneralScreen />}
                />
                <Route
                  path="QuizStreamThree_L2"
                  element={<MCQGeneralScreen />}
                />
                <Route
                  path="QuizStreamThree_L3"
                  element={<MCQGeneralScreen />}
                />
                <Route
                  path="QuizStreamThree_L4"
                  element={<MCQGeneralScreen />}
                />

                <Route path="Score" element={<ScoreScreen />} />
                <Route path="Tutorials" element={<VideoPlayerScreen />} />
                <Route path="Assignments" element={<AssignmenstScreen />} />
                <Route path="StreamOneRewards" element={<RewardsScreen />} />
                <Route path="StreamTwoRewards" element={<RewardsScreen />} />
                <Route path="StreamThreeRewards" element={<RewardsScreen />} />

                <Route path="T" element={<TestScreen />} />

                {showAdminBoard && (
                  <Route path="Admin" element={<AdminScreen />} />
                )}
              </Route>
            </>
          )}
        </Routes>
      </GlobalStateProvider>
    </>
  );

  return content;
}

export default App;
