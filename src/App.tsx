import React from "react";
import { Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "./components/ErrorBoundary";
import Home from "./components/Home";
import HomePage from "./components/HomePage";
import Chat from "./components/Chat";
import MockTest from "./components/MockTest";
import TailoredPractice from "./components/TailoredPractice";
import History from "./components/History";
import Settings from "./components/Settings";
import SignIn from "./components/SignIn";
import SignUp from "./components/SignUp";
import { ROUTES } from "./constants";

function App() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path={ROUTES.HOME} element={<Home />} />
        <Route path={ROUTES.HOME_APP} element={<HomePage />} />
        <Route path={ROUTES.CHAT} element={<Chat />} />
        <Route path={ROUTES.MOCK_TEST} element={<MockTest />} />
        <Route path={ROUTES.TAILORED_PRACTICE} element={<TailoredPractice />} />
        <Route path={ROUTES.HISTORY} element={<History />} />
        <Route path={ROUTES.SETTINGS} element={<Settings />} />
        <Route path={ROUTES.SIGNIN} element={<SignIn />} />
        <Route path={ROUTES.SIGNUP} element={<SignUp />} />
      </Routes>
    </ErrorBoundary>
  );
}

export default App;
