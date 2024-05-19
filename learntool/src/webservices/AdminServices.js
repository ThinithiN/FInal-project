import axios from "axios";

import Api from "./Api";

const uploadUsers = async (userlist) => {
  var data = {
    userlist: userlist,
  };

  console.log("Sending data- > ", { data });

  const response = Api.post("/upload_users", data);

  return response;
};

const getUsers = async () => {
  const response = Api.post("/get_users");

  return response;
};

const uploadQuections = async (filename, quectionsList) => {
  var data = {
    filename: filename,
    quectionsList: quectionsList,
  };
  console.log("Sending data- > ", { data });
  const response = Api.post("/upload_quections", data);

  return response;
};

const getQuections = async (QuectionsName) => {
  var data = {
    QuectionsName: QuectionsName,
  };
  console.log("Sending data- > ", { data });
  const response = Api.post("/get_quections", data);

  return response;
};

const getQuectionsPlusUsers = async () => {
  const response = Api.post("/get_quections_plus_users");

  return response;
};

const getResults = async () => {
  const response = Api.post("/get_results");

  return response;
};

const loginAdmin = async (email, password) => {
  var data = {
    email: email,
    password: password,
  };

  console.log("Sending data- > ", { data });

  const response = Api.post("/admin_login", data);

  return response;
};

const createResetGroups = async () => {
  const response = Api.post("/create_reset_groups");

  return response;
};

const getGroups = async () => {
  const response = Api.post("/get_groups");

  return response;
};

const updateGroups = async (
  group_id_1,
  id_1,
  id_1_key,
  group_id_2,
  id_2,
  id_2_key
) => {
  var data = {
    group_id_1: group_id_1,
    id_1: id_1,
    id_1_key: id_1_key,
    group_id_2: group_id_2,
    id_2: id_2,
    id_2_key: id_2_key,
  };

  const response = axios.post("http://localhost:5000/swap_groups", data);

  return response;
};

const AdminServices = {
  uploadUsers,
  getUsers,
  uploadQuections,
  getQuections,
  getQuectionsPlusUsers,
  getResults,
  loginAdmin,
  createResetGroups,
  getGroups,
  updateGroups,
};

export default AdminServices;
