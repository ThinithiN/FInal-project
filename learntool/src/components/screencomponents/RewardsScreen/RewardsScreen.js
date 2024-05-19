import React, { useState, useEffect } from "react";

import { useNavigate, useLocation } from "react-router-dom";

import Swal from "sweetalert2";

import WelcomeService from "../../../webservices/WelcomeService";

import LocalDataStorage from "../../basiccomponents/LocalStorageHandler/LocalDataStorage";

import Header from "../Header/Header";
import Footer from "../Footer/Footer";

import Lock from "../../../assets/Images/padlock.png";
import LockU from "../../../assets/Images/padunlock.png";

import "./RewardsScreen.css";

const RewardsScreen = () => {
  const navigate = useNavigate();

  const [userInfo, setUserInfo] = useState(undefined);

  const [islevel1done, setIsLevel1Done] = useState(0);
  const [islevel2done, setIsLevel2Done] = useState(0);
  const [islevel3done, setIsLevel3Done] = useState(0);
  const [islevel4done, setIsLevel4Done] = useState(0);

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

        setIsLevel1Done(userdata.stream_level_1_reward_unlocked);
        setIsLevel2Done(userdata.stream_level_2_reward_unlocked);
        setIsLevel3Done(userdata.stream_level_3_reward_unlocked);
        setIsLevel4Done(userdata.stream_level_4_reward_unlocked);

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

  const handleLevelReward = (level) => {
    if (level === "q1") {

          Swal.fire({
            title: `Open in new tab? `,

            showCancelButton: true,
            confirmButtonText: "Yes , Proceed ",

            width: "400px",
          }).then((result) => {
            /* Read more about isConfirmed, isDenied below */
            if (result.isConfirmed) {

              window.open(
                "https://www.youtube.com/watch?v=IswTBYUvHCk",
                "_blank"
              );
            }
          });
    } else if (level === "q2") {

          Swal.fire({
            title: `Open in new tab? `,

            showCancelButton: true,
            confirmButtonText: "Yes , Proceed ",

            width: "400px",
          }).then((result) => {
            /* Read more about isConfirmed, isDenied below */
            if (result.isConfirmed) {

                  window.open(
                    "https://www.youtube.com/watch?v=IswTBYUvHCk",
                    "_blank"
                  );
            }
          });
    } else if (level === "q3") {
          Swal.fire({
            title: `Open in new tab? `,

            showCancelButton: true,
            confirmButtonText: "Yes , Proceed ",

            width: "400px",
          }).then((result) => {
            /* Read more about isConfirmed, isDenied below */
            if (result.isConfirmed) {

                  window.open(
                    "https://www.youtube.com/watch?v=IswTBYUvHCk",
                    "_blank"
                  );
            }
          });
    } else if (level === "q4") {
          Swal.fire({
            title: `Open in new tab? `,

            showCancelButton: true,
            confirmButtonText: "Yes , Proceed ",

            width: "400px",
          }).then((result) => {
            /* Read more about isConfirmed, isDenied below */
            if (result.isConfirmed) {

                  window.open(
                    "https://www.youtube.com/watch?v=IswTBYUvHCk",
                    "_blank"
                  );
            }
          });
    }


  };

  var contentNew = (
    <>
      <div className="RewardsScreen">
        <div className="Top">
          <Header />
        </div>
        <div className="Mid">
          <div className="asgn-container">
            <div
              className="custom-info-view"
              style={{
                pointerEvents: !islevel1done ? "none" : "auto",
                opacity: !islevel1done ? 0.5 : 1,
              }}
              onClick={() => {
                handleLevelReward("q1");
              }}
            >
              <div>
                <button className="custom-btn btn-blue">
                  <span>Level One Reward</span>
                </button>
              </div>

              <div className="locks">
                <img
                  src={!islevel1done ? Lock : LockU}
                  alt="lock"
                  className="lock"
                />
              </div>
            </div>

            <div
              className="custom-info-view"
              style={{
                pointerEvents: !islevel2done ? "none" : "auto",
                opacity: !islevel2done ? 0.5 : 1,
              }}
              onClick={() => {
                handleLevelReward("q2");
              }}
            >
              <div>
                <button className="custom-btn btn-blue">
                  <span>Level Two Reward</span>
                </button>
              </div>
              <div className="locks">
                <img
                  src={!islevel2done ? Lock : LockU}
                  alt="lock"
                  className="lock"
                />
              </div>
            </div>

            <div
              className="custom-info-view"
              style={{
                pointerEvents: !islevel3done ? "none" : "auto",
                opacity: !islevel3done ? 0.5 : 1,
              }}
              onClick={() => {
                handleLevelReward("q3");
              }}
            >
              <div>
                <button className="custom-btn btn-blue">
                  <span>Level Three Reward</span>
                </button>
              </div>
              <div className="locks">
                <img
                  src={!islevel3done ? Lock : LockU}
                  alt="lock"
                  className="lock"
                />
              </div>
            </div>

            <div
              className="custom-info-view"
              style={{
                pointerEvents: !islevel4done ? "none" : "auto",
                opacity: !islevel4done ? 0.5 : 1,
              }}
              onClick={() => {
                handleLevelReward("q4");
              }}
            >
              <div>
                <button className="custom-btn btn-blue">
                  <span>Level Four Reward</span>
                </button>
              </div>
              <div className="locks">
                <img
                  src={!islevel4done ? Lock : LockU}
                  alt="ulock"
                  className="lock"
                />
              </div>
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

export default RewardsScreen;
