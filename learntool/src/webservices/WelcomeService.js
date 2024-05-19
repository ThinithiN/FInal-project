import Api from "./Api";

const getUserStats = async (name, id) => {
  const response = await Api.post("/get_user_stat", {
    name,
    id,
  });

  return response;
};


const WelcomeService = {
  getUserStats,
};

export default WelcomeService;