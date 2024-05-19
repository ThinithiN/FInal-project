import Api from "./Api";
import ApiLocal from "./ApiLocal";

const loadVideos = async (path) => {
  const response = await ApiLocal.get(path);

  return response;
};
const TutorialsServices = { loadVideos };

export default TutorialsServices;