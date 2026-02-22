import React from "react";
import { Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "./components/ErrorBoundary";
import Home from "./components/Home";
import Chat from "./components/Chat";
import Question from "./components/Question";
import SignIn from "./components/SignIn";
import SignUp from "./components/SignUp";
import { ROUTES } from "./constants";

function App() {
  return (
    <ErrorBoundary>
      <div className="App">
        <Routes>
          <Route path={ROUTES.HOME} element={<Home />} />
          <Route path={ROUTES.CHAT} element={<Chat />} />
          <Route path={ROUTES.QUESTION} element={<Question />} />
          <Route path={ROUTES.SIGNIN} element={<SignIn />} />
          <Route path={ROUTES.SIGNUP} element={<SignUp />} />
        </Routes>
      </div>
    </ErrorBoundary>
  );
}

export default App;
