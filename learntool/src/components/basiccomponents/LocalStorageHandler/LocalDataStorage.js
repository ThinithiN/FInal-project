const setLocalStorageObject = (objName, objData) => {
  window.localStorage.setItem(objName, objData);
};

const getLocalStorageObject = (objName) => {
  return JSON.parse(window.localStorage.getItem(objName));
};

const clearLocalStorage = () => {
  window.localStorage.clear();
};

const removeLocalStorageObject = (objName) => {
  window.localStorage.removeItem(objName);
};
const LocalDataStorage = {
  setLocalStorageObject,
  getLocalStorageObject,
  clearLocalStorage,
  removeLocalStorageObject,
};

export default LocalDataStorage;
