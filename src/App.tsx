import React from "react";
import { Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "./components/ErrorBoundary";
import Home from "./components/Home";
import HomePage from "./components/HomePage";
import Chat from "./components/Chat";
import ChooseCharacter from "./components/ChooseCharacter";
import MockTest from "./components/MockTest";
import TailoredPractice from "./components/TailoredPractice";
import History from "./components/History";
import SignIn from "./components/SignIn";
import SignUp from "./components/SignUp";
import { ROUTES } from "./constants";

function App() {
  return (
    <ErrorBoundary>
      <div className="App">
        <Routes>
          <Route path={ROUTES.HOME} element={<Home />} />
          <Route path={ROUTES.HOME_APP} element={<HomePage />} />
          <Route path={ROUTES.CHAT} element={<Chat />} />
          <Route path={ROUTES.CHOOSE_CHARACTER} element={<ChooseCharacter />} />
          <Route path={ROUTES.MOCK_TEST} element={<MockTest />} />
          <Route
            path={ROUTES.TAILORED_PRACTICE}
            element={<TailoredPractice />}
          />
          <Route path={ROUTES.HISTORY} element={<History />} />
          <Route path={ROUTES.SIGNIN} element={<SignIn />} />
          <Route path={ROUTES.SIGNUP} element={<SignUp />} />
        </Routes>
      </div>
    </ErrorBoundary>
  );
}

export default App;
