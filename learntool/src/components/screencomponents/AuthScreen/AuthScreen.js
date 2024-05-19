import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import "bootstrap/dist/css/bootstrap.min.css";

import Header from "../Header/Header";
import Footer from "../Footer/Footer";

import "./AuthScreen.css";

import Swal from "sweetalert2";

// import FaceIdAuthPop from "../../basiccomponents/FaceIdAuthPop/FaceIdAuthPop";

import AuthService from "../../../webservices/AuthService";

import { Button } from "react-bootstrap";
import { BiUserPlus, BiCamera, BiArrowBack } from "react-icons/bi";

import Webcam from "react-webcam";

const AuthScreen = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authMode, setAuthMode] = useState("signin");

  const [facereg, setfaceReg] = useState(false);

  // const [popfaceId, setPopfaceId] = useState(false);

  const webcamRef = React.useRef(null);
  const [snapshot, setSnapshot] = useState(null);

  const [dimensions, setDimensions] = useState({ width: 385, height: 250 }); // Default dimensions

  const captureSnapshot = () => {
    const base64String = webcamRef.current.getScreenshot();
    setSnapshot(base64String);
  };

  const retakeSnapshot = () => {
    setSnapshot(null);
  };

  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: "user",
  };

  const changeAuthMode = () => {
    if (authMode === "signin") {
      setfaceReg(false);
      setSnapshot(null);
    }

    setAuthMode(authMode === "signin" ? "signup" : "signin");
  };

  // const user = localStorage.getItem("user");

  // console.log("user x ", user);

  // if (user) {
  //   console.log("user y ", user);

  //   navigate("mcq", {
  //     state: {
  //       nameOftheTest: "AIOneQuection",
  //       isLevelMcq: false,
  //       levelofmcq: "",
  //       isoverflow: true,
  //       qonebyone: true,
  //     },
  //   });
  // }

  

  useEffect(() => {
    // Function to update dimensions based on window size
    const updateDimensions = () => {
      const newWidth = window.innerWidth * 0.8; // Adjust the scaling factor as needed
      const newHeight = (newWidth / 385) * 250; // Maintain aspect ratio
      setDimensions({ width: newWidth, height: newHeight });
    };

    // Initial call to set dimensions based on window size
    updateDimensions();

    // Event listener to update dimensions when window size changes
    window.addEventListener("resize", updateDimensions);

    // Cleanup the event listener when component unmounts
    return () => {
      window.removeEventListener("resize", updateDimensions);
    };
  }, []);

  function handleSignInSubmit(event) {
    event.preventDefault();

    console.log("sign in call ");

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

    AuthService.loginUser(email, password).then(
      (response) => {
        const data = response.data;

        //console.log(" admin res data", data);

        const { userId, userName, isAdmin } = data;

        // localStorage.setItem("userID", userId);

        // localStorage.setItem("userName", userName);

        // localStorage.setItem("user", "Customer");

        const userInfoObject = {};

        userInfoObject.userId = userId;
        userInfoObject.userName = userName;
        userInfoObject.isAdmin = isAdmin;

        localStorage.setItem("user", JSON.stringify(userInfoObject));

        Swal.close();

        Swal.fire({
          icon: "success",
          title: isAdmin ? "Admin Login Successfull" : "User Login Successfull",
          showConfirmButton: false,
          timer: 1000,
          width: "350px",
          willClose: () => {
            window.location.reload();
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
          title: "Login User",
          text: resMessage,
          confirmButtonText: "OK",
          confirmButtonColor: "red",
          allowOutsideClick: false,
          width: "400px",
          willClose: () => {},
        });
      }
    );
  }

  const isBase64 = (str) => {
    return str.startsWith("data:image");
  };

  function handleSignUpSubmit(event) {
    event.preventDefault();

    registerUser();

    //console.log("sign up validate call ");

    //setfaceReg(true);
  }

  /*

    if (isBase64(snapshot)) {
      console.log("yes ", snapshot);
    }
  */

  const registerUser = () => {
    console.log("registering user");
    //setPopfaceId(true);

    // if (isBase64(snapshot)) {
    //   console.log("yes ", snapshot);
    // }

    Swal.fire({
      title: "Please wait!",
      text: "Registering User Now!!",
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

    AuthService.register(name, email, password).then(
      (response) => {
        console.log("response data for send  ->", response);

        Swal.close();

        Swal.fire({
          icon: "success",
          title: "Registration Successfull",
          showConfirmButton: false,
          timer: 1000,
          width: "350px",
          willClose: () => {
            window.location.reload();
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
          title: "Register user error",
          text: resMessage,
          confirmButtonText: "OK",
          confirmButtonColor: "red",
          allowOutsideClick: false,
          width: "400px",
          willClose: () => {},
        });
      }
    );
  };

  if (authMode === "signin") {
    return (
      <div className="AuthScreen">
        <div className="Head">
          {/* <div className="logo">
            <img src={logo} widt={80} height={80} alt="Logo" />
          </div>
          <div className="backbtn"></div>
          <div className="topic">
            <p>Forecast Model</p>
          </div>
          <div className="forwardbtn">
            <Button variant="outline-primary" onClick={changeAuthMode}>
              <BiUserPlus className="mr-2" /> Sign Up
            </Button>
          </div> */}
          <Header />
        </div>

        <div className="Auth-form-container">
          <form className="Auth-form" onSubmit={handleSignInSubmit}>
            <div className="Auth-form-content">
              <h3 className="Auth-form-title">Sign In</h3>

              <div className="form-group mt-3">
                <label>Email address</label>
                <input
                  type="email"
                  className="form-control mt-4"
                  placeholder="Enter email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  pattern="/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/" // Email format validation
                />
              </div>
              <div className="form-group mt-3">
                <label>Password</label>
                <input
                  type="password"
                  className="form-control mt-4"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={3} // Minimum length of 8 characters (optional)
                  maxLength={12} // Maximum length of 20 characters (optional)
                />
              </div>

              <div className="d-grid gap-2 mt-4">
                <button type="submit" className="btn btn-primary">
                  Submit
                </button>
                {/* <button
                  type="button"
                  onClick={() => {
                    // setPopfaceId(true);
                  }}
                  className="btn btn-success"
                >
                  Try Face ID
                </button> */}
              </div>

              <div className="text-center">
                Not registered yet?{" "}
                <span
                  className="link-primary"
                  onClick={changeAuthMode}
                  style={{ cursor: "pointer" }}
                >
                  Sign Up
                </span>
              </div>

              {/* <p className="text-center mt-2">
              Forgot <a href="#">password?</a>
            </p> */}
            </div>
          </form>
        </div>
        <div className="Bot">
          <Footer />
        </div>
      </div>
    );
  } else if (authMode === "signin") {
    return (
      <div className="AuthScreen">
        {/* {popfaceId && <FaceIdAuthPop isOpen={setPopfaceId} />} */}
        <div className="Head">
          <Header />
        </div>

        <div className="Auth-form-container"></div>

        <div className="Bot">
          <Footer />
        </div>
      </div>
    );
  } else {
    return (
      <>
        <div className="AuthScreen">
          <div className="Head">
            {/* <div className="logo">
            <img src={logo} widt={80} height={80} alt="Logo" />
          </div>
          <div className="backbtn"></div>
          <div className="topic">
            <p>Forecast Model</p>
          </div>
          <div className="forwardbtn">
            <Button variant="outline-primary" onClick={changeAuthMode}>
              <BiUser className="mr-2" /> Sign In
            </Button>
          </div> */}
            <Header />
          </div>
          <div className="Auth-form-container">
            <form className="Auth-form" onSubmit={handleSignUpSubmit}>
              <div className="Auth-form-content">
                <h3 className="Auth-form-title">Sign Up</h3>

                {facereg ? (
                  <>
                    {snapshot ? (
                      <div>
                        <h6>Face id taken</h6>
                        <div
                          className={`frame-green`}
                          style={{
                            position: "relative",
                            display: "inline-block",
                          }}
                        >
                          <img
                            src={snapshot}
                            alt="User Snapshot"
                            width={385}
                            height={215}
                            // style={{ marginTop: "20px", marginBottom: "20px" }}
                          />
                        </div>

                        <div style={{ display: "flex" }}>
                          <Button
                            variant="outline-primary"
                            onClick={() => {
                              setfaceReg(false);
                              setSnapshot(null);
                            }}
                            style={{ marginTop: "5px" }}
                          >
                            <BiArrowBack className="mr-2" />
                          </Button>

                          <Button
                            variant="outline-secondary"
                            onClick={retakeSnapshot}
                            style={{ marginLeft: "10px", marginTop: "5px" }}
                          >
                            <BiCamera className="mr-2" /> Retake FaceId
                          </Button>

                          <Button
                            variant="outline-primary"
                            onClick={registerUser}
                            style={{ marginLeft: "50px", marginTop: "5px" }}
                          >
                            <BiUserPlus className="mr-2" /> Register Now
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <h6>Face Id On</h6>
                        <div className={`frame-red`}>
                          <Webcam
                            audio={false}
                            ref={webcamRef}
                            screenshotFormat="image/jpeg"
                            width={385}
                            height={250}
                            videoConstraints={videoConstraints}
                            style={{
                              marginTop: "-18px",
                              marginBottom: "-25px",
                            }}
                          />
                        </div>

                        <div style={{ display: "flex" }}>
                          <Button
                            variant="outline-primary"
                            onClick={() => {
                              setfaceReg(false);
                              setSnapshot(null);
                            }}
                            style={{ marginTop: "2px" }}
                          >
                            <BiArrowBack className="mr-2" />
                          </Button>
                          <Button
                            variant="outline-primary"
                            onClick={captureSnapshot}
                            style={{ marginLeft: "175px", marginTop: "2px" }}
                          >
                            <BiCamera className="mr-2" /> Capture FaceId
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="form-group mt-3">
                      <label>Full Name</label>
                      <input
                        type="text"
                        className="form-control mt-4"
                        placeholder="e.g Jane Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        minLength={2} // Minimum length of 2 characters (optional)
                        maxLength={50} // Maximum length of 50 characters (optional)
                      />
                    </div>
                    <div className="form-group mt-3">
                      <label>Email address</label>
                      <input
                        type="email"
                        className="form-control mt-4"
                        placeholder="Email Address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        pattern="/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/" // Email format validation
                      />
                    </div>
                    <div className="form-group mt-3">
                      <label>Password</label>
                      <input
                        type="password"
                        className="form-control mt-4"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={3} // Minimum length of 8 characters (optional)
                        maxLength={12} // Maximum length of 20 characters (optional)
                      />
                    </div>
                    <div className="d-grid gap-2 mt-3">
                      {/* <button type="submit" className="btn btn-primary">
                        Validate & Face Sign Up 
                      </button> */}
                      <button type="submit" className="btn btn-primary">
                        Sign Up
                      </button>
                    </div>

                    <div className="text-center">
                      Already registered?{" "}
                      <span
                        className="link-primary"
                        onClick={changeAuthMode}
                        style={{ cursor: "pointer" }}
                      >
                        Sign In
                      </span>
                    </div>
                    {/* <p className="text-center mt-2">
            Forgot <a href="#">password?</a>
          </p> */}
                  </>
                )}
              </div>
            </form>
          </div>
          <div className="Bot">
            <Footer />
          </div>
        </div>
      </>
    );
  }
};

export default AuthScreen;
