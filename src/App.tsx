import { BrowserRouter as Router, Routes, Route } from "react-router";
import { Analytics } from "@vercel/analytics/react";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Videos from "./pages/UiElements/Videos";
import Images from "./pages/UiElements/Images";
import Alerts from "./pages/UiElements/Alerts";
import Badges from "./pages/UiElements/Badges";
import Avatars from "./pages/UiElements/Avatars";
import Buttons from "./pages/UiElements/Buttons";
import LineChart from "./pages/Charts/LineChart";
import BarChart from "./pages/Charts/BarChart";
import Calendar from "./pages/Calendar";
import BasicTables from "./pages/Tables/BasicTables";
import FormElements from "./pages/Forms/FormElements";
import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import { AnalyticsWrapper } from "./components/common/AnalyticsWrapper";
import Landing from "./pages/Landing"; // Added landing page
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './config/firebase';
import { useEffect, useState } from 'react';
import { AuthPromptProvider } from './context/AuthPromptContext';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [authReady, setAuthReady] = useState(false);
  useEffect(()=>{ const unsub = onAuthStateChanged(auth, u=>{ setUser(u); setAuthReady(true); }); return ()=>unsub(); },[]);
  if(!authReady) return <div className="p-10 text-center">Loading...</div>;
  return (
    <>
      <Router>
        <AuthPromptProvider>
          <AnalyticsWrapper>
            <ScrollToTop />
            <Routes>
              {/* Public Landing Page */}
              {/* <Route index path="/" element={<Landing />} /> */}
               <Route index path="/" element={<Home />} />

              {/* Dashboard Layout now public preview; components can show auth prompt */}
              <Route element={<AppLayout /> }>
                <Route path="/app" element={<Home />} />
                <Route path="/dashboard" element={<Home />} />
                {/* Others Page */}
                <Route path="/profile" element={user ? <UserProfiles /> : <Landing />} />
                <Route path="/calendar" element={user ? <Calendar /> : <Landing />} />
                <Route path="/blank" element={user ? <Blank /> : <Landing />} />
                {/* Forms */}
                <Route path="/form-elements" element={user ? <FormElements /> : <Landing />} />
                {/* Tables */}
                <Route path="/basic-tables" element={user ? <BasicTables /> : <Landing />} />
                {/* Ui Elements */}
                <Route path="/alerts" element={user ? <Alerts /> : <Landing />} />
                <Route path="/avatars" element={user ? <Avatars /> : <Landing />} />
                <Route path="/badge" element={user ? <Badges /> : <Landing />} />
                <Route path="/buttons" element={user ? <Buttons /> : <Landing />} />
                <Route path="/images" element={user ? <Images /> : <Landing />} />
                <Route path="/videos" element={user ? <Videos /> : <Landing />} />
                {/* Charts */}
                <Route path="/line-chart" element={user ? <LineChart /> : <Landing />} />
                <Route path="/bar-chart" element={user ? <BarChart /> : <Landing />} />
              </Route>

              {/* Auth Layout */}
              <Route path="/signin" element={<SignIn />} />
              <Route path="/signup" element={<SignUp />} />

              {/* Fallback Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AnalyticsWrapper>
        </AuthPromptProvider>
      </Router>
      <Analytics />
    </>
  );
}
