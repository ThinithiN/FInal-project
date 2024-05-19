import Api from "./Api";
import ApiLocal from "./ApiLocal";

const loadGeneralMCQ = async (path) => {
  const response = await ApiLocal.get(path);

  return response;
};

const answer_by_speech = async (
  name,
  id,
  nameOftheTest,
  levelofmcq,
  qindex_temp,
  r,
  userspeachtotext,
  uservoice
) => {
  const formData = new FormData();

  formData.append("name", name);
  formData.append("id", id);

  formData.append("nameOftheTest", nameOftheTest);
  formData.append("levelofmcq", levelofmcq);
  formData.append("qindex_temp", qindex_temp);
  formData.append("r", r);

  formData.append("userspeachtotext", userspeachtotext);

  formData.append("uservoice", uservoice, "uservoice.wav");

  const response = await Api.post("/answer_by_speech", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response;
};



const answer_by_speech_aiinterview = async (
  name,
  id,
  nameOftheTest,
  levelofmcq,
  qindex_temp,
  r,
  uservoice
) => {
  const formData = new FormData();

  formData.append("name", name);
  formData.append("id", id);

  formData.append("nameOftheTest", nameOftheTest);
  formData.append("levelofmcq", levelofmcq);
  formData.append("qindex_temp", qindex_temp);
  formData.append("r", r);


  formData.append("uservoice", uservoice, "uservoice.wav");

  const response = await Api.post("/answer_by_speech_aiinterview", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response;
};


const upload_results = async (name, id, nameOftheTest, levelofmcq, results) => {
  const response = await Api.post("/upload_results", {
    name,
    id,
    nameOftheTest,
    levelofmcq,
    results,
  });

  return response;
};

const GeneralMCQService = {
  loadGeneralMCQ,
  answer_by_speech,
  answer_by_speech_aiinterview,
  upload_results,
};

export default GeneralMCQService;
