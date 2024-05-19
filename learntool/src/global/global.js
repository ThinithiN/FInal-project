import React, { createContext, useContext, useReducer } from "react";

// Define a context
const GlobalStateContext = createContext();

// Define a reducer function
const globalStateReducer = (state, action) => {
  switch (action.type) {
    case "SET_VALUE":
      return { ...state, value: action.payload };
    //! more varibles with names
    // case "INCREMENT_COUNTER":
    //   return { ...state, counter: state.counter + 1 };
    // case "TOGGLE_LOGGED_STATUS":
    //   return { ...state, isLogged: !state.isLogged };
    default:
      return state;
  }
};

// Create a custom hook to use the global state
export const useGlobalState = () => {
  const context = useContext(GlobalStateContext);
  if (!context) {
    throw new Error("useGlobalState must be used within a GlobalStateProvider");
  }
  return context;
};

// Create a provider component that wraps your app
export const GlobalStateProvider = ({ children }) => {
  const [state, dispatch] = useReducer(globalStateReducer, { value: "" });

  return (
    <GlobalStateContext.Provider value={{ state, dispatch }}>
      {children}
    </GlobalStateContext.Provider>
  );
};
