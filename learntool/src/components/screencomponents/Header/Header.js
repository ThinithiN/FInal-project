import React, { useState, useEffect } from "react";

import { useNavigate } from "react-router-dom";

import { MDBIcon } from "mdb-react-ui-kit";

import AuthService from "../../../webservices/AuthService";

import logo from "../../../assets/logo.png";

// import FaceIdAuthPop from "../../basiccomponents/FaceIdAuthPop/FaceIdAuthPop";

import "./Header.css";

const Header = () => {
  const navigate = useNavigate();
  const [popfaceId, setPopfaceId] = useState(false);
  const [currentUser, setCurrentUser] = useState(undefined);

  useEffect(() => {
    const user = localStorage.getItem("user");

    if (user) {
      // console.log({ user });

      setCurrentUser(user);
    }
  }, []);

  let content = (
    <>
      {/* {popfaceId && <FaceIdAuthPop isOpen={setPopfaceId} />} */}
      <div className="headerTab">
        <div className="logo">
          {/* <img src={logo} widt={59} height={59} alt="Logo" /> */}
        </div>
        <div className="navbars">
          {/* <div
            className="textspan"
            onClick={() => {
              navigate("/");
            }}
          >
            Home
          </div>
          <div
            className="textspan"
            onClick={() => {
              navigate("/aboutus");
            }}
          >
            About
          </div>
          <div
            className="textspan"
            onClick={() => {
              navigate("/contactus");
            }}
          >
            Contact Us
          </div>

          {currentUser ? (
            <div
              className="textspan"
              onClick={() => {
                navigate("/forecast");
              }}
            >
              Forecasting
            </div>
          ) : (
            <div></div>
          )}
          {currentUser ? (
            <div
              className="textspan"
              onClick={() => {
                navigate("/sellstock");
              }}
            >
              Sell Stock
            </div>
          ) : (
            <div></div>
          )}
          {currentUser ? (
            <div
              className="textspan"
              onClick={() => {
                navigate("/consult");
                // setPopfaceId(true);
              }}
            >
              Consultation
            </div>
          ) : (
            <div></div>
          )} */}
        </div>
        <div className="search">
          {/* <MDBIcon fas icon="search" size="1x" style={{ color: "white" }} /> */}
        </div>

        <div
          className="logoutbtn"
          onClick={() => {
            AuthService.logout();
            //console.log("hy");
            navigate("/");
            window.location.reload();
          }}
        >
          {currentUser ? (
            <MDBIcon
              fas
              icon="sign-out-alt"
              size="2x"
              style={{ color: "white" }}
            />
          ) : (
            <MDBIcon
              fas
              icon="user-circle"
              size="2x"
              style={{ color: "white" }}
            />
          )}
        </div>
      </div>
    </>
  );
  return content;
};

export default Header;
