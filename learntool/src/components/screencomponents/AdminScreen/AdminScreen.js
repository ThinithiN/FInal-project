import React, { useState, useEffect, useRef } from "react";

import Swal from "sweetalert2";

import Select from "react-select";

import { read, utils, writeFile } from "xlsx";

import { useNavigate, useLocation } from "react-router-dom";

import AdminServices from "../../../webservices/AdminServices";

import Table from "../../basiccomponents/Admin/Table/Table";

import LocalDataStorage from "../../basiccomponents/LocalStorageHandler/LocalDataStorage";

import "./AdminScreen.css";
import GeneralMCQService from "../../../webservices/GeneralMCQService";

const COLUMNS_RESULTS = [
  {
    Header: "Id",
    Footer: "Id",
    accessor: "id",
    sticky: "left",
  },
  {
    Header: "Name",
    Footer: "Name",
    accessor: "name",
    sticky: "left",
  },

  {
    Header: "AIOneQuection",
    Footer: "AIOneQuection",
    accessor: (row) => row,
    // accessor: "aiinterviewone_score",
    disableFilters: true,
    sticky: "left",
    Cell: ({ value }) => {
      //var scores1 = "23/100";
      var size_str = value.aiinterviewone_score.toString();
      return size_str;




      
    },
  },
  {
    Header: "AITwoQuection",
    Footer: "AITwoQuection",
    accessor: "aiinterviewtwo_score",
    disableFilters: true,
    sticky: "left",
    Cell: ({ value }) => {
      //var scores1 = "23/100";
      var size_str = value.toString();
      return size_str;
    },
  },
  {
    Header: "Stream Selected",
    Footer: "Stream Selected",
    accessor: "stream_selected",
    sticky: "left",
  },
  {
    Header: "Level 1 Score",
    Footer: "Level 1 Score",
    // accessor: "stream_level_1_score",
    accessor: (row) => row,
    disableFilters: true,
    sticky: "left",
    Cell: ({ value }) => {
      //var scores1 = "23/100";
      var size_str = "";
      if (value.blind) {
        size_str = "Not considered";
      } else {
        size_str = value.stream_level_1_score.toString();
      }
      return size_str;
    },
  },
  {
    Header: "Level 2 Score",
    Footer: "Level 2 Score",
    accessor: "stream_level_2_score",
    disableFilters: true,
    sticky: "left",
    Cell: ({ value }) => {
      //var scores1 = "23/100";
      var size_str = value.toString();
      return size_str;
    },
  },
  {
    Header: "Level 3 Score",
    Footer: "Level 3 Score",
    accessor: "stream_level_3_score",
    disableFilters: true,
    sticky: "left",
    Cell: ({ value }) => {
      //var scores1 = "23/100";
      var size_str = value.toString();
      return size_str;
    },
  },
  {
    Header: "Level 4 Score",
    Footer: "Level 4 Score",
    accessor: "stream_level_4_score",
    disableFilters: true,
    sticky: "left",
    Cell: ({ value }) => {
      //var scores1 = "23/100";
      var size_str = value.toString();
      return size_str;
    },
  },
  {
    Header: "Final Exam Score",
    Footer: "Final Exam Score",
    accessor: "final_exam_score",
    disableFilters: true,
    sticky: "left",
    Cell: ({ value }) => {
      //var scores1 = "23/100";
      var size_str = value.toString();
      return size_str;
    },
  },
  {
    Header: "Facial Score",
    Footer: "Facial Score",
    accessor: "final_exam_facial_expression_score",
    disableFilters: true,
    sticky: "left",
    Cell: ({ value }) => {
      //var scores1 = "23/100";
      var size_str = value.toString();
      return size_str;
    },
  },
];
const COLUMNS_USERS = [
  {
    Header: "Id",
    Footer: "Id",
    accessor: "id",
    disableFilters: true,
    sticky: "left",
  },
  {
    Header: "Name",
    Footer: "Name",
    accessor: "name",
    sticky: "left",
  },
  {
    Header: "Password",
    Footer: "Password",
    accessor: "password",
    disableFilters: true,
    sticky: "left",
  },
];

const COLUMNS_QUECTIONS = [
  {
    Header: "Id",
    Footer: "Id",
    accessor: "id",
    disableFilters: true,
    sticky: "left",
  },
  {
    Header: "Quection",
    Footer: "Quection",
    accessor: "q",
    sticky: "left",
  },
  {
    Header: "Answer 1",
    Footer: "Answer 1",
    disableFilters: true,
    accessor: "a1",
    sticky: "left",
  },
  {
    Header: "Answer 2",
    Footer: "Answer 2",
    disableFilters: true,
    accessor: "a2",
    sticky: "left",
  },
  {
    Header: "Answer 3",
    Footer: "Answer 3",
    disableFilters: true,
    accessor: "a3",
    sticky: "left",
  },

  {
    Header: "Answer 4",
    Footer: "Answer 4",
    disableFilters: true,
    accessor: "a4",
    sticky: "left",
  },

  {
    Header: "Right Answer",
    Footer: "Right Answer",
    disableFilters: true,
    accessor: "r",
    sticky: "left",
  },
];

const AdminScreen = () => {
  const location = useLocation();

  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);

  const [quections, setQuections] = useState([]);

  const [usersImported, setUsersImported] = useState([]);

  const [resultsImported, setResultsImported] = useState([]);

  const [isGroups, setIsGroups] = useState(false);

  const tabledRef = useRef();

  const [tableData, setTableData] = useState([]);

  const [tableColumns, setTableColumns] = useState([]);

  const [columnsQ, setcolumsQ] = useState(COLUMNS_RESULTS);

  var loaderWheel = (
    <>
      <div className="loaderWarapper-admin">
        <div className="loader-admin">
          <div className="loader-admin-wheel"></div>
          <div className="loader-admin-text"></div>
        </div>
      </div>
    </>
  );

  const handleExportResults = () => {
    // const headings = [["Movie", "Category", "Director", "Rating"]];
    const wb = utils.book_new();
    const ws = utils.json_to_sheet([]);
    //utils.sheet_add_aoa(ws, headings);
    utils.sheet_add_json(ws, resultsImported, {
      //origin: "A2",
      //skipHeader: true,
    });
    utils.book_append_sheet(wb, ws, "Report");
    writeFile(wb, "Results Report.xlsx");
  };

  //!============

  const [showLevel, setShowlevel] = useState(false);
  const [islevelMCQ, setIslevelMCQ] = useState(false);
  const [nameOftheTest, setNameOftheTest] = useState("");
  const [nameOftheStream, setNameOftheStream] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");

  //* get user list

  const getUsersList = () => {
    setLoading(true);

    Swal.fire({
      title: "Please wait!",
      text: "Please wait loading users !!",
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

    AdminServices.getUsers().then(
      (response) => {
        //console.log("response data  ->", response);

        const { userList } = response.data;

        if (userList) {
          if (userList.length) {
            setUsersImported(userList);

            setLoading(false);
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
        setLoading(true);

        Swal.fire({
          icon: "error",
          title: "Load Users",
          text: resMessage,
          confirmButtonText: "OK",
          confirmButtonColor: "red",
          allowOutsideClick: false,
          width: "400px",
          willClose: () => {},
        });

        ////console.log("Get All Plywood Types   error -> ", resMessage);
      }
    );
  };

  const getResultsList = () => {
    Swal.fire({
      title: "Please wait!",
      text: "Please wait loading Results!!",
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

    AdminServices.getUsers().then(
      (response) => {
        // console.log("response data results  ->", response);

        const { userList } = response.data;

        if (userList.length > 0) {
          setResultsImported(userList);
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
          title: "Load Results",
          text: resMessage,
          confirmButtonText: "OK",
          confirmButtonColor: "red",
          allowOutsideClick: false,
          width: "400px",
          willClose: () => {},
        });

        ////console.log("Get All Plywood Types   error -> ", resMessage);
      }
    );
  };

  const getQuectionsList = () => {
    setLoading(true);

    Swal.fire({
      title: "Please wait!",
      text: "Please wait loading Quections!!",
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

    let mcq_que_path = "";

    mcq_que_path =
      process.env.PUBLIC_URL +
      "/McqGeneralQuections/" +
      nameOftheTest +
      "/" +
      nameOftheTest +
      ".json";

    if (nameOftheTest === "FinalQuection") {
      if (nameOftheStream === "StreamOne") {
        mcq_que_path =
          process.env.PUBLIC_URL +
          "/McqGeneralQuections/" +
          nameOftheTest +
          "/FinalQuectionOne.json";
      } else if (nameOftheStream === "StreamTwo") {
        mcq_que_path =
          process.env.PUBLIC_URL +
          "/McqGeneralQuections/" +
          nameOftheTest +
          "/FinalQuectionTwo.json";
      } else if (nameOftheStream === "StreamThree") {
        mcq_que_path =
          process.env.PUBLIC_URL +
          "/McqGeneralQuections/" +
          nameOftheTest +
          "/FinalQuectionThree.json";
      }
    }

    if (islevelMCQ) {
      mcq_que_path =
        process.env.PUBLIC_URL +
        "/McqGeneralQuections/" +
        nameOftheTest +
        "/" +
        selectedLevel +
        ".json";
    }

    //!============

    GeneralMCQService.loadGeneralMCQ(mcq_que_path).then(
      (response) => {
        const data = response.data;

        //console.log(" res data", data);

        if (data && data.length > 0) {
          setQuections(data);

          Swal.close();
        }
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
          title: "Load Quections",
          text: "No Quections found",
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

    //!===========
  };

  const filterDataList = () => {
    if (nameOftheTest === "U" && nameOftheStream === "U" && !showLevel) {
      getUsersList();
      showUsersData();
    } else if (nameOftheTest === "R" && nameOftheStream === "R" && !showLevel) {
      getResultsList();
      showResultsData();
    } else {
      if (nameOftheTest !== "") {
        getQuectionsList();
        showQuectionsData();
      }
    }
  };

  useEffect(() => {
    showUsersData();
  }, [usersImported]);

  useEffect(() => {
    showQuectionsData();
  }, [quections]);

  // useEffect(() => {
  //   if (!resultsImported.length) {
  //     console.log("here 1");
  //     return;
  //   }
  //   console.log("here 2", resultsImported);
  //   if (resultsImported.stream_selected === "StreamOne") {
  //     console.log("here 3");
  //     setcolumsQ((prevArray) =>
  //       prevArray.map((obj) =>
  //         obj.accessor === "stream_level_1_score"
  //           ? {
  //               ...obj,
  //               Header: "Cyber Security Level 1",
  //               Footer: "Cyber Security Level 1",
  //             }
  //           : obj.accessor === "stream_level_2_score"
  //           ? {
  //               ...obj,
  //               Header: "Cyber Security Level 2",
  //               Footer: "Cyber Security Level 2",
  //             }
  //           : obj.accessor === "stream_level_3_score"
  //           ? {
  //               ...obj,
  //               Header: "Cyber Security Level 3",
  //               Footer: "Cyber Security Level 3",
  //             }
  //           : obj.accessor === "stream_level_4_score"
  //           ? {
  //               ...obj,
  //               Header: "Cyber Security Level 4",
  //               Footer: "Cyber Security Level 4",
  //             }
  //           : obj
  //       )
  //     );
  //   } else if (resultsImported.stream_selected === "StreamTwo") {
  //     setcolumsQ((prevArray) =>
  //       prevArray.map((obj) =>
  //         obj.accessor === "stream_level_1_score"
  //           ? {
  //               ...obj,
  //               Header: "Buisness Level 1",
  //               Footer: "Buisness Level 1",
  //             }
  //           : obj.accessor === "stream_level_2_score"
  //           ? {
  //               ...obj,
  //               Header: "Buisness Level 2",
  //               Footer: "Buisness Level 2",
  //             }
  //           : obj.accessor === "stream_level_3_score"
  //           ? {
  //               ...obj,
  //               Header: "Buisness Level 3",
  //               Footer: "Buisness Level 3",
  //             }
  //           : obj.accessor === "stream_level_4_score"
  //           ? {
  //               ...obj,
  //               Header: "Buisness Level 4",
  //               Footer: "Buisness Level 4",
  //             }
  //           : obj
  //       )
  //     );
  //   } else if (resultsImported.stream_selected === "StreamThree") {
  //     setcolumsQ((prevArray) =>
  //       prevArray.map((obj) =>
  //         obj.accessor === "stream_level_1_score"
  //           ? {
  //               ...obj,
  //               Header: "IT Level 1",
  //               Footer: "IT Level 1",
  //             }
  //           : obj.accessor === "stream_level_2_score"
  //           ? {
  //               ...obj,
  //               Header: "IT Level 2",
  //               Footer: "IT Level 2",
  //             }
  //           : obj.accessor === "stream_level_3_score"
  //           ? {
  //               ...obj,
  //               Header: "IT Level 3",
  //               Footer: "IT Level 3",
  //             }
  //           : obj.accessor === "stream_level_4_score"
  //           ? {
  //               ...obj,
  //               Header: "IT Level 4",
  //               Footer: "IT Level 4",
  //             }
  //           : obj
  //       )
  //     );
  //   }

  //   // showResultsData();
  // }, [resultsImported]);

  useEffect(() => {
    console.log({ columnsQ });
  }, [columnsQ]);

  //!==============

  const showUsersData = () => {
    //console.log({ usersImported });

    if (usersImported.length) {
      setLoading(false);
    } else {
      setLoading(true);
      return;
    }

    setTableColumns(COLUMNS_USERS);
    setTableData(usersImported);
  };

  const showQuectionsData = () => {
    if (quections.length) {
      setLoading(false);
    } else {
      setLoading(true);
      return;
    }

    setTableColumns(COLUMNS_QUECTIONS);
    setTableData(quections);
  };

  const showResultsData = () => {
    //console.log({ resultsImported });

    if (resultsImported.length) {
      setLoading(false);
    } else {
      setLoading(true);
      return;
    }

    setTableColumns(COLUMNS_RESULTS);
    setTableData(resultsImported);
  };

  //!==== Bulk selection  one

  const bulkIdsOptions = [
    { label: "None", value: 1 },
    { label: "Show Users", value: 2 },
    { label: "Show AI Interview one Quections ", value: 3 },
    { label: "Show AI Interview two Quections ", value: 4 },
    { label: "Show Cyber Security Quections", value: 5 },
    { label: "Show Buisness Quections", value: 6 },
    { label: "Show IT Quections", value: 7 },
    { label: "Show Final quiz  Cyber Security Quections", value: 8 },
    { label: "Show Final quiz  Buisness Quections", value: 9 },
    { label: "Show Final quiz  IT Quections", value: 10 },
    { label: "Show Results", value: 11 },
  ];

  const bulkIdsStylings = {
    dropdownIndicator: (base) => ({
      ...base,
      color: "black", // Custom colour
    }),
    control: (base) => ({
      ...base,
      fontFamily: "Times New Roman",
      background: "#f2f2f2",
      color: "black",
      //border: 0,
      // This line disable the blue border
      borderRadius: "5px",
    }),
    menu: (base) => ({
      ...base,
      fontFamily: "Times New Roman",
      background: "#f2f2f2",
      color: "black",
      borderRadius: "5px",
    }),
    option: (base) => ({
      ...base,
      fontFamily: "Times New Roman",
      background: "#f2f2f2",
      color: "black",
      cursor: "pointer",
      "&:hover": { backgroundColor: "#80bfff" },
      borderRadius: "5px",
    }),
  };

  const [bulkIdsOptionData, setbulkIdsOptionData] = useState(1);

  const bulkIdsActions = (val) => {
    setbulkIdsOptionData(val.value);
  };

  useEffect(() => {
    if (bulkIdsOptionData === 1) {
      setLoading(true);
      return;
    }

    switch (bulkIdsOptionData) {
      case 2:
        setIsGroups(false);
        setNameOftheTest("U");
        setNameOftheStream("U");
        setShowlevel(false);
        setIslevelMCQ(false);
        break;
      case 3:
        setIsGroups(false);
        setNameOftheTest("AIOneQuection");
        setNameOftheStream("");
        setShowlevel(false);
        setIslevelMCQ(false);
        break;
      case 4:
        setIsGroups(false);
        setNameOftheTest("AITwoQuection");
        setNameOftheStream("");
        setShowlevel(false);
        setIslevelMCQ(false);
        break;
      case 5:
        setIsGroups(false);
        setNameOftheTest("StreamOne");
        setNameOftheStream("StreamOne");
        setShowlevel(true);

        break;
      case 6:
        setIsGroups(false);
        setNameOftheTest("StreamTwo");
        setNameOftheStream("StreamTwo");
        setShowlevel(true);

        break;
      case 7:
        setIsGroups(false);
        setNameOftheTest("StreamThree");
        setNameOftheStream("StreamThree");
        setShowlevel(true);
        break;
      case 8:
        setIsGroups(false);
        setNameOftheTest("FinalQuection");
        setNameOftheStream("StreamOne");
        setShowlevel(false);
        setIslevelMCQ(false);
        break;
      case 9:
        setIsGroups(false);
        setNameOftheTest("FinalQuection");
        setNameOftheStream("StreamTwo");
        setShowlevel(false);
        setIslevelMCQ(false);
        break;
      case 10:
        setIsGroups(false);
        setNameOftheTest("FinalQuection");
        setNameOftheStream("StreamThree");
        setShowlevel(false);
        setIslevelMCQ(false);
        break;
      case 11:
        setIsGroups(false);
        setNameOftheTest("R");
        setNameOftheStream("R");
        setShowlevel(false);
        setIslevelMCQ(false);
        break;
      default:
        setIsGroups(false);
        break;
    }
  }, [bulkIdsOptionData]);

  //!==== Bulk selection  two

  const bulkIdsOptions2 = [
    { label: "none", value: 1 },
    { label: "Level 1", value: 2 },
    { label: "Level 2", value: 3 },
    { label: "Level 3", value: 4 },
    { label: "Level 4", value: 5 },
  ];

  const bulkIdsStylings2 = {
    dropdownIndicator: (base) => ({
      ...base,
      color: "black", // Custom colour
    }),
    control: (base) => ({
      ...base,
      fontFamily: "Times New Roman",
      background: "#f2f2f2",
      color: "black",
      //border: 0,
      // This line disable the blue border
      borderRadius: "5px",
    }),
    menu: (base) => ({
      ...base,
      fontFamily: "Times New Roman",
      background: "#f2f2f2",
      color: "black",
      borderRadius: "5px",
    }),
    option: (base) => ({
      ...base,
      fontFamily: "Times New Roman",
      background: "#f2f2f2",
      color: "black",
      cursor: "pointer",
      "&:hover": { backgroundColor: "#80bfff" },
      borderRadius: "5px",
    }),
  };

  const [bulkIdsOptionData2, setbulkIdsOptionData2] = useState(1);

  const bulkIdsActions2 = (val) => {
    setbulkIdsOptionData2(val.value);
  };

  useEffect(() => {
    if (bulkIdsOptionData2 === 1) {
      setLoading(true);
      setIslevelMCQ(false);
      return;
    }

    switch (bulkIdsOptionData2) {
      case 2:
        setIsGroups(false);
        setSelectedLevel("q1");
        setIslevelMCQ(true);
        break;
      case 3:
        setIsGroups(false);
        setSelectedLevel("q2");
        setIslevelMCQ(true);
        break;
      case 4:
        setIsGroups(false);
        setSelectedLevel("q3");
        setIslevelMCQ(true);
        break;
      case 5:
        setIsGroups(false);
        setSelectedLevel("q4");
        setIslevelMCQ(true);
        break;
      default:
        setIsGroups(false);
        break;
    }
  }, [bulkIdsOptionData2]);

  useEffect(() => {
    console.log({ tableData });
  }, [tableData]);

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const adminLogOut = () => {
    LocalDataStorage.clearLocalStorage();

    navigate("/");
  };

  var content = (
    <>
      <div className="admin-page">
        <div className="admin-page-topbar ">
          <div className="admin-page-topbar-h">Admin</div>
          <div className="admin-page-topbar-logout" onClick={adminLogOut}>
            Logout
          </div>
        </div>

        <div className="admin-page-mid1">
          <div className="admin-page-mid1-results">
            <button
              className="btn-export-results"
              onClick={handleExportResults}
            >
              Export Results
            </button>
          </div>
        </div>

        <div className="admin-page-mid2">
          <div className="admin-page-mid2-bulkActions">
            <div className="admin-page-mid2-bulkAction-select">
              <Select
                defaultValue={bulkIdsOptions[0]}
                onChange={bulkIdsActions}
                styles={bulkIdsStylings}
                options={bulkIdsOptions}
                isSearchable={false}
              />
            </div>

            <div className="admin-page-mid2-bulkAction-select2">
              {showLevel && (
                <Select
                  defaultValue={bulkIdsOptions2[0]}
                  onChange={bulkIdsActions2}
                  styles={bulkIdsStylings2}
                  options={bulkIdsOptions2}
                  isSearchable={false}
                />
              )}
            </div>
            <div
              className="admin-page-mid2-bulkAction-apply"
              onClick={async () => {
                filterDataList();
              }}
            >
              Apply Filters
            </div>
          </div>

          <div className="admin-page-mid2-search">
            {/* <div className="admin-page-mid2-search-input">
              <input
                className="search_type_ply"
                type="txt"
                //placeholder="Type"
                //value={searchTitle_Type}
                //onChange={onChangeSearchTitle_Type}
                autoFocus
                required
              />
            </div>
            <div className="admin-page-mid2-search-button">
              <i className="bi bi-search"></i>
            </div> */}
          </div>
        </div>

        <div className="admin-page-mid3">
          {loading ? (
            loaderWheel
          ) : (
            <Table
              dataIn={tableData}
              columnsIn={tableColumns}
              isGroups={isGroups}
              //props={(tableData, tableColumns, isGroups)}
              ref={tabledRef}
            />
          )}
        </div>
        <div className="admin-page-bottom"></div>
      </div>
    </>
  );

  return content;
};

export default AdminScreen;
