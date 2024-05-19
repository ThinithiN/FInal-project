import React, { useEffect, useState, createRef } from "react";

import { CSSTransition, TransitionGroup } from "react-transition-group";

import { useNavigate, useLocation } from "react-router-dom";
import { format } from "date-fns";

import Swal from "sweetalert2";

import { BlogPosts } from "../../../Store/Posts.js";

import SimpleLogo from "../../../Images/simple_logo.png";

import NoImgs from "../../../Images/no_image.jpg";

import PostsServices from "../../../webservices/PostsServices";

import LocalDataStorage from "../../hooks/LocalStorageHandler/LocalDataStorage";

import LoadingSpinner from "../../LoadingSpinner/LoadingSpinner.js";

import "./AdsBlog.css";

const AdsBlogCardModel = ({
  id,
  img_data,
  text_data,
  author_name,
  date_posted,
  time_ago_posted,
  postIndex,
  userId,
  userName,
  on_Post_Clikc,
  selectedPost,
}) => {
  //   console.log(
  //     "in data ",
  //     id,
  //     img_data,
  //     text_data,
  //     author_name,
  //     date_posted,
  //     time_ago_posted,
  //     postIndex
  //   );

  // Create formatter (English).

  const d = new Date(date_posted);

  let ms = d.getTime();

  const d1 = new Date();

  let ms1 = d1.getTime();

  //console.log({ d, ms, d1, ms1 });

  function timeSince(date) {
    var seconds = date / 1000;

    var interval = seconds / 31536000;

    if (interval > 1) {
      return Math.floor(interval) + " yrs ago";
    }
    interval = seconds / 2592000;
    if (interval > 1) {
      return Math.floor(interval) + " mon ago";
    }
    interval = seconds / 86400;
    if (interval > 1) {
      return Math.floor(interval) + " days ago";
    }
    interval = seconds / 3600;
    if (interval > 1) {
      return Math.floor(interval) + " hours ago";
    }
    interval = seconds / 60;
    if (interval > 1) {
      return Math.floor(interval) + " min ago";
    }
    return Math.floor(seconds) + " sec ago";
  }

  // console.log(timeSince(ms1 - ms));

  const handleOnclickBlog = () => {
    console.log(" clicked on admin add post id - > ", id);
    on_Post_Clikc(id);
  };

  // useEffect(() => {
  //   if (selAdd != null) {
  //     if (selAdd === id) {
  //       setStyleBG({ backgroundColor: "red" });
  //     } else {
  //       setStyleBG({ backgroundColor: "white" });
  //     }
  //   } else {
  //     setStyleBG({ backgroundColor: "white" });
  //   }
  // }, [selAdd]);

  var content = (
    <>
      <div
        className="blog-card"
        onClick={handleOnclickBlog}
        style={{
          backgroundColor: id === selectedPost ? "#e6f2ff" : "white",
        }}
      >
        <div className="blog-card-banner">
          {img_data !== "" ? (
            <>
              {" "}
              <img
                src={img_data}
                alt="post data"
                width="350"
                height="200"
                className="blog-banner-img"
              />
            </>
          ) : (
            <>
              <img
                src={NoImgs}
                alt="post data"
                width="350"
                height="200"
                className="blog-banner-img"
              />
            </>
          )}
        </div>

        <div className="blog-content-wrapper">
          <p className="blog-text">{text_data}</p>

          <div className="wrapper-flex">
            <div className="wrapper">
              <h4 className="h4">{author_name}</h4>

              <p className="text-sm">
                <time dateTime="2022-01-17">{date_posted}</time>
                <span className="separator"></span>
                <ion-icon name="time-outline"></ion-icon>
                <time dateTime="PT3M">{timeSince(ms1 - ms)}</time>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  return content;
};

const UserAdsBlogCardModel = ({
  ads_id,
  ads_img,
  ads_text,
  ads_author,
  ads_date,
  ads_like_field,
  adsAll,
  changeAds,
  nodeRef,
  time_ago_posted,
  postIndex,
  user,
  userId,
}) => {
  // console.log(
  //   "in data ",
  //   ads_id,
  //   // ads_img,
  //   ads_text,
  //   ads_date,
  //   ads_date,
  //   time_ago_posted,
  //   postIndex
  // );

  const [zipFile, setZipFile] = useState(null);

  function handleRemove(id, element) {
    const btn = document.getElementById(element);
    //console.log(btn);

    btn.style.backgroundColor = "#ffcccc";

    setTimeout(() => {
      const newList = adsAll.filter((item) => item.ads_id !== id);

      console.log({ newList });

      changeAds(newList);
    }, 1000);
  }

  const handleMarkAsRead = (id, element) => {
    //! update user as read from add

    Swal.fire({
      title: "Please wait!",
      text: "Mark as read Add!!",
      allowEscapeKey: false,
      allowOutsideClick: false,
      width: "350px",
      didOpen: () => {
        Swal.showLoading();
      },
      willClose: () => {},
    });

    PostsServices.markAdsAsread(ads_id, user, userId).then(
      (response) => {
        console.log(" rest mask as read -> ", response.data);

        const btn = document.getElementById(element);
        console.log(btn);

        btn.style.backgroundColor = "#ffcccc";

        setTimeout(() => {
          const newList = adsAll.filter((item) => item.ads_id !== id);

          console.log({ newList });

          changeAds(newList);
        }, 1000);

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
          title: "Mark as read Add!!",
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

  const handleuploadfiles = (zip_file, user_name, user_id, ads_id) => {
    Swal.fire({
      title: "Please wait!",
      text: "Uploading Your Documents to Advertisment!!",
      allowEscapeKey: false,
      allowOutsideClick: false,
      width: "350px",
      didOpen: () => {
        Swal.showLoading();
      },
      willClose: () => {},
    });

    PostsServices.sendUserDocuments(zip_file, user_name, user_id, ads_id).then(
      (response) => {
        console.log(" rupload documents to  ads -> ", response.data);

        Swal.close();
        setZipFile(null);
      },
      (error) => {
        const resMessage =
          (error.response &&
            error.response.data &&
            error.response.data.message) ||
          error.message ||
          error.toString();

        Swal.close();
        setZipFile(null);

        Swal.fire({
          icon: "error",
          title: "Uploading Your Documents to Advertisment!!",
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

  const checkFileExists = async (path) => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("HEAD", process.env.PUBLIC_URL + path);
      xhr.onload = () => {
        if (xhr.status === 200) {
          const contentLength = xhr.getResponseHeader("Content-Length");
          if (contentLength !== null && contentLength !== "0") {
            resolve(true);
          } else {
            resolve(false);
          }
        } else {
          resolve(false);
        }
      };
      xhr.onerror = () => {
        reject(new Error("Error checking file existence"));
      };
      xhr.send();
    });
  };

  function handleFileUplaodDirectly(event, user_name, user_id, ads_id) {
    const path_req = "UserDocs/" + user_id + ".zip";

    checkFileExists(path_req).then((exists) => {
      if (exists) {
        fetch(process.env.PUBLIC_URL + path_req)
          .then((response) => {
            if (!response.ok) {
              throw new Error("Failed to fetch zip file");
            }

            console.log({ response });
            return response.blob();
          })
          .then((blob) => {
            const file = new File([blob], "my-zip-file.zip", {
              type: "application/zip",
            });
            // Use the file as needed

            setZipFile(file);

            handleuploadfiles(file, user_name, user_id, ads_id);
          })
          .catch((error) => {
            console.error("Error fetching zip file:", error);
            // Handle the error as needed
            Swal.fire({
              icon: "error",
              title: "Uploading Your Documents to Advertisment!!",
              text: error,
              confirmButtonText: "OK",
              confirmButtonColor: "red",
              allowOutsideClick: false,
              width: "400px",
              willClose: () => {},
            });
          });
      } else {
        console.error("File does not exist:", path_req);
        // Handle the error as needed
        Swal.fire({
          icon: "error",
          title: "Uploading Your Documents to Advertisment!!",
          text: "File does not exist",
          confirmButtonText: "OK",
          confirmButtonColor: "red",
          allowOutsideClick: false,
          width: "400px",
          willClose: () => {},
        });
      }
    });
  }

  function handleFileUpload(event, user_name, user_id, ads_id) {
    // const file = event.target.files[0];

    const path_req = "UserDocs/" + 6 + ".zip";

    fetch(process.env.PUBLIC_URL + path_req)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch zip file");
        }

        console.log({ response });
        return response.blob();
      })
      .then((blob) => {
        const file = new File([blob], "my-zip-file.zip", {
          type: "application/zip",
        });
        // Use the file as needed

        setZipFile(file);

        handleuploadfiles(file, user_name, user_id, ads_id);
      })
      .catch((error) => {
        console.error("Error fetching zip file:", error);
        // Handle the error as needed
        Swal.fire({
          icon: "error",
          title: "Uploading Your Documents to Advertisment!!",
          text: error,
          confirmButtonText: "OK",
          confirmButtonColor: "red",
          allowOutsideClick: false,
          width: "400px",
          willClose: () => {},
        });
      });
  }
  // Create formatter (English).

  const d = new Date(ads_date);

  let ms = d.getTime();

  const d1 = new Date();

  let ms1 = d1.getTime();

  //console.log({ d, ms, d1, ms1 });

  function timeSince(date) {
    var seconds = date / 1000;

    var interval = seconds / 31536000;

    if (interval > 1) {
      return Math.floor(interval) + " yrs ago";
    }
    interval = seconds / 2592000;
    if (interval > 1) {
      return Math.floor(interval) + " mon ago";
    }
    interval = seconds / 86400;
    if (interval > 1) {
      return Math.floor(interval) + " days ago";
    }
    interval = seconds / 3600;
    if (interval > 1) {
      return Math.floor(interval) + " hours ago";
    }
    interval = seconds / 60;
    if (interval > 1) {
      return Math.floor(interval) + " min ago";
    }
    return Math.floor(seconds) + " sec ago";
  }

  // console.log(timeSince(ms1 - ms));

  var content = (
    <>
      <div id={ads_id.toString()} className="blog-card">
        <div className="blog-card-banner">
          {ads_img !== "" ? (
            <>
              {" "}
              <img
                src={ads_img}
                alt="post data"
                width="350"
                height="200"
                className="blog-banner-img"
              />
            </>
          ) : (
            <>
              {" "}
              <img
                src={NoImgs}
                alt="post data"
                width="200"
                height="200"
                className="blog-banner-img"
              />
            </>
          )}
        </div>

        <div className="blog-content-wrapper">
          <h3 className="h3">{ads_like_field}</h3>
          <p className="blog-text-ads">{ads_text}</p>

          <div className="wrapper-flex">
            <div className="wrapper">
              <h6>{ads_author}</h6>

              <p className="text-tiny">
                <time dateTime="2022-01-17">{ads_date}</time>
                <span className="separator"></span>
                <ion-icon name="time-outline"></ion-icon>
                <time dateTime="PT3M">{timeSince(ms1 - ms)}</time>
              </p>
              <br />
              <>
                {/* <input
                  type="file"
                  accept=".zip"
                  name={"files_" + ads_id.toString()}
                  id={"files_" + ads_id.toString()}
                  onChange={(e) => handleFileUpload(e, user, userId, ads_id)}
                />
                <label
                  htmlFor={"files_" + ads_id.toString()}
                  style={{
                    padding: "0.1rem ",
                    fontSize: "13px",
                    textAlign: "center",
                  }}
                >
                  Upload Documents
                </label> */}

                <button
                  onClick={(e) =>
                    handleFileUplaodDirectly(e, user, userId, ads_id)
                  }
                  id="upDocBtn"
                  title="upload documents"
                  style={{ backgroundColor: "red" , color:'white' , cursor:"pointer"}}
                >
                  upload documents
                </button>
              </>

              <br></br>

              <div ref={nodeRef}>
                <button
                  onClick={() => handleMarkAsRead(ads_id, ads_id.toString())}
                  id="markAsreadBtn"
                  title="mark as read"
                >
                  mark as read
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  return content;
};

//handleFileUplaodDirectly
const ClientsResponseBlogCardModel = ({
  user_name,
  user_id,
  like_field,
  user_email,
  user_zip_path,
  adsId,
}) => {
  // console.log({
  //   user_name,
  //   user_id,
  //   like_field,
  //   // user_email,
  //   user_zip_path,
  //   adsId,
  // });

  // console.log(
  //   "in data ",
  //   ads_id,
  //   // ads_img,
  //   ads_text,
  //   ads_date,
  //   ads_date,
  //   time_ago_posted,
  //   postIndex
  // );

  const handleDownloadFiles = (user_namex, user_idx, adsIdx) => {
    //! update user as read from add

    Swal.fire({
      title: "Please wait!",
      text: "Download Documents!!",
      allowEscapeKey: false,
      allowOutsideClick: false,
      width: "350px",
      didOpen: () => {
        Swal.showLoading();
      },
      willClose: () => {},
    });

    PostsServices.getUserDocuments(user_namex, user_idx, adsIdx).then(
      (response) => {
        console.log(" download results files -> ", response.data);

        const url = URL.createObjectURL(response.data);
        const link = document.createElement("a");
        link.href = url;
        link.download = user_namex + "_data.zip";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

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
          title: "Download Documents!!",
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

  // Create formatter (English).

  // console.log(timeSince(ms1 - ms));

  var content = (
    <>
      <div
        id={adsId.toString()}
        className="blog-card"
        style={{
          gridTemplateColumns: "7fr",
          border: "3px solid #66c2ff",
          backgroundColor: "#e6f5ff",
        }}
      >
        <div className="blog-card-banner"></div>

        <div className="blog-content-wrapper">
          <div className="wrapper-flex">
            <div className="wrapper">
              <h6>{"My name is " + user_name + " and i like " + like_field}</h6>
              <p className="text-tiny">{user_email}</p>
              <button
                onClick={() => handleDownloadFiles(user_name, user_id, adsId)}
                id="markAsreadBtn"
                title="mark as read"
              >
                Download Documents
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  return content;
};

const AdsBlog = () => {
  const location = useLocation();

  const navigate = useNavigate();

  const [isAdmin, setAdmin] = useState(false);

  const [loading1, setLoading1] = useState(true);

  const [loading2, setLoading2] = useState(true);

  const [user, setUser] = useState(null);

  const [userId, setUserId] = useState(null);

  const [uAds, setUAds] = useState([]);

  const [pData, setPData] = useState([]);

  const [resData, setresData] = useState([]);

  const [selAdver, setselAdver] = useState(null);

  const [pHowMany, setPHowMany] = useState(1);

  const [pAll, setPAllMany] = useState(1);

  const [isLightTheme, setLightTheme] = useState(true);

  const [isLight, setLight] = useState(true);

  const [utext, setUtex] = useState("");
  const [uemail, setUemail] = useState("");

  const [uImg, setUImg] = useState(null);

  const [upImgStat, setUpImgStat] = useState(false);

  useEffect(() => {
    if (location.state.admin) {
      //! logged as admin
      setAdmin(true);
      setUser(location.state.kidsName);
      setUserId(location.state.kidsId);
    } else {
      setAdmin(false);
      setUser(location.state.kidsName);
      setUserId(location.state.kidsId);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) {
      getAdsPosted();
    } else {
      if (user === "sliit@sliit.com" || !user) return;
      console.log(" test 1");
      getIdeasPosted();

      if (user && userId) {
        getAdsForUser();
      }
    }
  }, [isAdmin, user, userId]);

  useEffect(() => {
    if (selAdver === null) {
      setresData([]);
      return;
    }

    if (pData.length <= 0) {
      setresData([]);
      return;
    }

    var posted_all_ads_indexes = pData.length - 1;

    //console.log(" data in selected add  -> ", pData,posted_all_ads_indexes , selAdver);

    //return;

    var crr_ref_post = pData[posted_all_ads_indexes - selAdver];

    //console.log(" ref posts look in -> ", crr_ref_post);

    //return;

    if (!crr_ref_post?.users_info) {
      setresData([]);
      return;
    }

    //console.log(" tests posts related adds ", pData, selAdver);

    if (crr_ref_post.users_info.length <= 0) {
      setresData([]);
      return;
    }

    //return;

    var users_arr = crr_ref_post.users_info;

    var final_users = [];

    //console.log(" found users in relevanty add - >  ", users_arr);

    const new_users_array = users_arr.map((v) => ({
      ...v,
      adsId: crr_ref_post.id,
    }));

    for (let i = 0; i < new_users_array.length; i++) {
      var crr_user = new_users_array[i];

      console.log("users -> ", crr_user);

      if (crr_user.user_zip_path !== "") {
        final_users.push(crr_user);
      }
    }

    setresData(final_users);

    console.log(" users data final with docs ", { final_users });
  }, [selAdver]);

  //!============================================

  const getIdeasPosted = () => {
    Swal.fire({
      title: "Please wait!",
      text: "Getting Idea Posts!!",
      allowEscapeKey: false,
      allowOutsideClick: false,
      width: "350px",
      didOpen: () => {
        Swal.showLoading();
      },
      willClose: () => {},
    });

    PostsServices.getPosts().then(
      (response) => {
        const { postsList } = response.data;

        var revpostlist = postsList.reverse();

        if (revpostlist.length) {
          setPData(revpostlist);

          if (revpostlist.length > 5) {
            setPHowMany(5);
          } else {
            setPHowMany(revpostlist.length);
          }

          setPAllMany(revpostlist.length);
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
          title: "Getting Idea Posts",
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

  const getAdsPosted = () => {
    Swal.fire({
      title: "Please wait!",
      text: "Getting Ads Posts!!",
      allowEscapeKey: false,
      allowOutsideClick: false,
      width: "350px",
      didOpen: () => {
        Swal.showLoading();
      },
      willClose: () => {},
    });

    PostsServices.getAds().then(
      (response) => {
        const { adsList } = response.data;

        var revpostlist = adsList.reverse();

        console.log({ revpostlist });

        if (revpostlist.length) {
          setPData(revpostlist);

          if (revpostlist.length > 5) {
            setPHowMany(5);
          } else {
            setPHowMany(revpostlist.length);
          }

          setPAllMany(revpostlist.length);
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
          title: "Getting Ads Posts",
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

  const getAdsForUser = () => {
    Swal.fire({
      title: "Please wait!",
      text: "Getting Like Ads Posts!!",
      allowEscapeKey: false,
      allowOutsideClick: false,
      width: "350px",
      didOpen: () => {
        Swal.showLoading();
      },
      willClose: () => {},
    });

    PostsServices.getAdsForUser(userId, user).then(
      (response) => {
        const { adsUserList } = response.data;

        var revpostlist = adsUserList.reverse();

        if (revpostlist.length) {
          const newArr = revpostlist.map((v) => ({
            ...v,
            nodeRef: createRef(null),
          }));

          console.log({ newArr });
          setUAds(newArr);
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

        // Swal.fire({
        //   icon: "error",
        //   title: "Getting Like Ads Posts",
        //   text: resMessage,
        //   confirmButtonText: "OK",
        //   confirmButtonColor: "red",
        //   allowOutsideClick: false,
        //   width: "400px",
        //   willClose: () => {},
        // });

        ////console.log("Get All Plywood Types   error -> ", resMessage);
      }
    );
  };

  const handleNewPost = () => {
    if (utext === "") {
      Swal.fire({
        icon: "error",
        title: "Idea Post",
        text: "Your  Ads message is empty",
        confirmButtonText: "OK",
        confirmButtonColor: "red",
        allowOutsideClick: false,
        width: "400px",
        willClose: () => {},
      });
      return;
    }

    var posts_data = {
      image_posted: uImg ? uImg : "",
      text_posted: utext,
      author_name_posted: user,
      user_id: userId,
      is_admin: isAdmin,
      user_email: uemail ? uemail : "",
      date_posted: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
    };

    Swal.fire({
      title: "Please wait!",
      text: "Creating New Idea",
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

    PostsServices.sendPostorAds(posts_data).then(
      (response) => {
        Swal.close();

        getIdeasPosted();
        getAdsForUser();

        setUtex("");
        setUImg(null);
        setUpImgStat(false);
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
          title: "Creating New Idea",
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

  function ValidateEmail(input) {
    var validRegex =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

    if (validRegex.test(input)) {
      return true;
    } else {
      return false;
    }
  }

  const handleNewAdd = () => {
    if (utext === "" || uemail === "") {
      Swal.fire({
        icon: "error",
        title: "Advertisement Post",
        text: "Your  Ads message or email is empty",
        confirmButtonText: "OK",
        confirmButtonColor: "red",
        allowOutsideClick: false,
        width: "400px",
        willClose: () => {},
      });
      return;
    }

    if (!ValidateEmail(uemail)) {
      Swal.fire({
        icon: "error",
        title: "Advertisement Post",
        text: "In valid Email",
        confirmButtonText: "OK",
        confirmButtonColor: "red",
        allowOutsideClick: false,
        width: "400px",
        willClose: () => {},
      });
      return;
    }

    var posts_data = {
      image_posted: uImg ? uImg : "",
      text_posted: utext,
      author_name_posted: user,
      user_id: userId,
      user_email: uemail ? uemail : "",
      is_admin: isAdmin,
      date_posted: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
    };

    Swal.fire({
      title: "Please wait!",
      text: "Creating New Advertisement and sending Emails",
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

    PostsServices.sendPostorAds(posts_data).then(
      (response) => {
        Swal.close();

        getAdsPosted();

        setUemail("");

        setUtex("");
        setUImg(null);
        setUpImgStat(false);
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
          title: "Creating New Advertisement and sending Emails",
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

  //!========================================

  const ToggleClassThemeMain = () => {
    //console.log({ isLightTheme });
    setLightTheme(!isLightTheme);
  };

  const ToggleClassLight = () => {
    //console.log({ isLight });
    setLight(!isLight);
  };

  const handleThemeBtn = () => {
    ToggleClassThemeMain();
    ToggleClassLight();
  };

  const loadMorePosts = () => {
    if (pHowMany > pAll) {
      setPHowMany(pAll);
    } else {
      setPHowMany(pHowMany + 5);
    }
  };

  const handleTextArea = (e) => {
    e.preventDefault();

    //console.log(" text-> ", e.target.value);
    setUtex(e.target.value);
  };

  const handleEmailArea = (e) => {
    e.preventDefault();

    //console.log(" text-> ", e.target.value);
    setUemail(e.target.value);
  };

  const handleImageUpload = ($event) => {
    //console.log($event.target.files);
    const files = $event.target.files;

    if (files.length) {
      const file = files[0];
      var filename = file.name;

      var filenametext = document.getElementById("noFile");

      if (/^\s*$/.test(filename)) {
        setUpImgStat(false);
        // $("#noFile").text("No file chosen...");
        filenametext.textContent = "No file chosen...";
      } else {
        setUpImgStat(true);
        //   $("#noFile").text(filename.replace("C:\\fakepath\\", ""));
        filenametext.textContent = filename.replace("C:\\fakepath\\", "");
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        setUImg(event.target.result);
        //console.log(event.target.result);
        // const wb = read(event.target.result);
        // const sheets = wb.SheetNames;
        // if (sheets.length) {
        //   const rows = utils.sheet_to_json(wb.Sheets[sheets[0]]);
        //   //setUsersImported(rows);
        //   //  setTableData(rows);
        //   //handleUploadusers(rows);
        // }
      };
      reader.readAsDataURL(file);
    }
  };

  function topFunction() {
    let myarticle = document.getElementById("art");
    myarticle.scrollTop = 0;
    document.documentElement.scrollTop = 0;

    if (BlogPosts.length > 5) {
      setPHowMany(5);
    } else {
      setPHowMany(BlogPosts.length);
    }
  }

  const handleScroll = (event) => {
    //  console.log("scrollTop: ", event.currentTarget.scrollTop);
    // console.log("offsetHeight: ", event.currentTarget.offsetHeight);

    // Get the button
    let mybutton = document.getElementById("constr_article_Btn");

    // console.log("hello");

    // window.onscroll = function () {
    //   scrollFunction();
    // };

    //   function scrollFunction() {
    if (
      event.currentTarget.scrollTop > 20 ||
      document.documentElement.scrollTop > 20
    ) {
      mybutton.style.display = "block";
    } else {
      mybutton.style.display = "none";
    }
    //    }
  };

  const goBackhandle = () => {
    navigate(-1);
  };

  var headerContent = (
    <>
      <header>
        <div className="container">
          <nav className="navbar">
            <a href="#">
              <img
                src={SimpleLogo}
                alt="blog's logo"
                width="150"
                height="60"
                className="logo-light"
              />
              <img
                src={SimpleLogo}
                alt="blog's logo"
                width="150"
                height="60"
                className="logo-dark"
              />
            </a>

            <button onClick={goBackhandle} id="backBtn" title="Go Back">
              Go Back
            </button>

            <div className="btn-group">
              <button
                className={
                  isLight
                    ? "theme-btn theme-btn-mobile light"
                    : "theme-btn theme-btn-mobile dark"
                }
                onClick={handleThemeBtn}
              >
                {isLight ? (
                  <>
                    {" "}
                    <ion-icon name="sunny" className="sun"></ion-icon>
                    <i className="fa fa-moon-o" aria-hidden="true"></i>
                  </>
                ) : (
                  <>
                    {" "}
                    <ion-icon name="moon" className="moon"></ion-icon>
                    <i className="fa fa-sun-o" aria-hidden="true"></i>
                  </>
                )}
              </button>
            </div>

            <div className="flex-wrapper">
              <button
                className={
                  isLight
                    ? "theme-btn theme-btn-desktop light"
                    : "theme-btn theme-btn-desktop dark"
                }
                onClick={handleThemeBtn}
              >
                <ion-icon name="moon" className="moon"></ion-icon>
                <ion-icon name="sunny" className="sun"></ion-icon>
              </button>
            </div>

            <div className="mobile-nav">
              <button className="nav-close-btn">
                <ion-icon name="close-outline"></ion-icon>
              </button>

              <div className="wrapper">
                <p className="h3 nav-title">Main Menu</p>
              </div>

              <div>
                <p className="h3 nav-title">Topics</p>
              </div>
            </div>
          </nav>
        </div>
      </header>
    </>
  );

  var heroContent = (
    <>
      <>
        <div className="hero">
          <div className="container">
            <div className="left">
              <h1 className="h1">
                {isAdmin ? (
                  <>
                    Logged in as <b>&nbsp;Admin&nbsp;{user}</b>
                  </>
                ) : (
                  <>
                    Logged in as <b>&nbsp;User&nbsp;{user}</b>
                  </>
                )}
              </h1>
              <>
                {isAdmin ? (
                  <>
                    <p className="h3"> Post your advertisements here </p>
                  </>
                ) : (
                  <>
                    <p className="h3"> Post your new posts here </p>
                  </>
                )}
              </>
            </div>
            <>
              {isAdmin ? (
                <></>
              ) : (
                <>
                  <div className="right">
                    <div className="pattern-bg"></div>
                    <div className="img-box">
                      <div className="shape shape-1"></div>
                      <div className="shape shape-2"></div>
                    </div>
                  </div>
                </>
              )}
            </>
          </div>
        </div>
      </>
    </>
  );

  var asideContents = (
    <>
      <div className="aside">
        {isAdmin ? (
          <>
            {" "}
            <div className="contact">
              <h2 className="h2">Responses to Ads</h2>

              <div className="wrapper">
                {/* <p>
              Do you want to learn more about how I can we help you to overcome
              problems? Let us have a conversation.
            </p> */}

                <div id="art2" className="blog-card-group-ads">
                  <>
                    {resData.length ? (
                      resData.map(
                        (
                          {
                            user_name,
                            user_id,
                            like_field,
                            user_email,
                            user_zip_path,
                            adsId,
                          },
                          index
                        ) => {
                          console.log(
                            " Client response mode l-> ",
                            user_name,
                            user_id,
                            like_field,
                            user_email,
                            user_zip_path,
                            adsId,

                            index
                          );
                          return (
                            <ClientsResponseBlogCardModel
                              key={index}
                              user_name={user_name}
                              user_id={user_id}
                              like_field={like_field}
                              user_email={user_email}
                              user_zip_path={user_zip_path}
                              adsId={adsId}
                            />
                          );
                        }
                      )
                    ) : (
                      <h4> No User Responses for selected Advertisement</h4>
                    )}
                  </>
                </div>

                {/* <ul className="social-link">
              <li>
                <a href="#" className="icon-box discord">
                  <ion-icon name="logo-discord"></ion-icon>
                </a>
              </li>

              <li>
                <a href="#" className="icon-box twitter">
                  <ion-icon name="logo-twitter"></ion-icon>
                </a>
              </li>

              <li>
                <a href="#" className="icon-box facebook">
                  <ion-icon name="logo-facebook"></ion-icon>
                </a>
              </li>
            </ul> */}
              </div>
            </div>
          </>
        ) : (
          <>
            {" "}
            <div className="contact">
              <h2 className="h2">Your Recomended Ads</h2>

              <div className="wrapper">
                {/* <p>
              Do you want to learn more about how I can we help you to overcome
              problems? Let us have a conversation.
            </p> */}

                <div id="art2" className="blog-card-group-ads">
                  <>
                    {uAds.length ? (
                      <TransitionGroup component="ul">
                        {uAds.map(
                          ({
                            ads_img,
                            ads_text,
                            ads_author,
                            ads_date,
                            ads_like_field,
                            ads_id,
                            nodeRef,
                          }) => {
                            //console.log(post.id, post, postIndex);
                            return (
                              <CSSTransition
                                key={ads_id}
                                nodeRef={nodeRef}
                                timeout={700}
                                classNames="item"
                              >
                                <UserAdsBlogCardModel
                                  key={ads_id}
                                  ads_id={ads_id}
                                  ads_img={ads_img}
                                  ads_text={ads_text}
                                  ads_author={ads_author}
                                  ads_date={ads_date}
                                  ads_like_field={ads_like_field}
                                  postIndex={ads_id}
                                  user={user}
                                  userId={userId}
                                  adsAll={uAds}
                                  changeAds={setUAds}
                                  nodeRef={nodeRef}
                                />
                              </CSSTransition>
                            );
                          }
                        )}
                      </TransitionGroup>
                    ) : (
                      <h4> No Ads related to your Field</h4>
                    )}
                  </>
                </div>

                {/* <ul className="social-link">
              <li>
                <a href="#" className="icon-box discord">
                  <ion-icon name="logo-discord"></ion-icon>
                </a>
              </li>

              <li>
                <a href="#" className="icon-box twitter">
                  <ion-icon name="logo-twitter"></ion-icon>
                </a>
              </li>

              <li>
                <a href="#" className="icon-box facebook">
                  <ion-icon name="logo-facebook"></ion-icon>
                </a>
              </li>
            </ul> */}
              </div>
            </div>
          </>
        )}

        <div className="newsletter">
          <h2 className="h2">
            {isAdmin ? <>New Advertisements Post</> : <>New Idea Post</>}
          </h2>

          <div className="wrapper">
            {isAdmin ? (
              <></>
            ) : (
              <>
                <p>Share A New Thought , Expirience with Friends</p>
              </>
            )}
            <textarea
              id="w3review"
              name="w3review"
              rows="4"
              cols="50"
              placeholder={isAdmin ? "Your Message" : "Your Ideas"}
              value={utext}
              onChange={handleTextArea}
            ></textarea>
            {isAdmin ? (
              <>
                {" "}
                <input
                  type="text"
                  name="email"
                  id="email"
                  value={uemail}
                  placeholder="Your Email"
                  onChange={handleEmailArea}
                />
              </>
            ) : (
              <></>
            )}

            <img alt="post photo" src={uImg} width="200" hieght="200" />
            <div className={upImgStat ? "file-upload active" : "file-upload"}>
              <div className="file-select">
                <div className="file-select-button" id="fileName">
                  Choose File
                </div>
                <div className="file-select-name" id="noFile">
                  No file chosen...
                </div>
                <input
                  type="file"
                  name="chooseFile"
                  id="chooseFile"
                  multiple={false}
                  onChange={handleImageUpload}
                />
              </div>
            </div>
            <br></br>
            <button
              type="buuton"
              className="btn btn-primary"
              onClick={isAdmin ? () => handleNewAdd() : () => handleNewPost()}
            >
              {isAdmin ? <>Post Advertisement</> : <>Post your Thought</>}
            </button>
          </div>
        </div>
      </div>
    </>
  );

  var blogPostsContent = (
    <>
      <div className="main">
        <div className="container">
          <div className="blog">
            <h2 className="h2">
              {isAdmin ? (
                <>Latest Blog Advertisements</>
              ) : (
                <>Latest Blog Posts</>
              )}
            </h2>
            <div id="art" className="blog-card-group" onScroll={handleScroll}>
              <button
                onClick={topFunction}
                id="constr_article_Btn"
                title="Go to top"
              >
                page top
              </button>

              <>
                {pData.length ? (
                  pData.slice(0, pHowMany).map((post, postIndex) => {
                    //console.log(post.id, post, postIndex);
                    return (
                      <AdsBlogCardModel
                        key={postIndex}
                        {...post}
                        postIndex={postIndex}
                        on_Post_Clikc={(post_id) => {
                          // console.log(" test click 2 ", post_id);
                          setselAdver(post_id);
                        }}
                        selectedPost={selAdver}
                      />
                    );
                  })
                ) : (
                  <h3>
                    {" "}
                    {isAdmin ? (
                      <>No Add Posts Yet Add New Advertisements</>
                    ) : (
                      <>No Idea Posts Yet Add New Ideas</>
                    )}
                  </h3>
                )}
              </>
            </div>
            <button className="btn load-more" onClick={loadMorePosts}>
              Load More
            </button>
          </div>

          {asideContents}
        </div>
      </div>
    </>
  );

  var bodyContents = (
    <>
      <div
        id="body-content"
        className={isLightTheme ? "light-theme" : "dark-theme"}
      >
        {headerContent}

        <main>
          {heroContent}
          {blogPostsContent}
        </main>
      </div>
    </>
  );

  var content = <>{bodyContents}</>;

  return content;
};

export default AdsBlog;
