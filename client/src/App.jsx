import React from "react";
import Navbar from "./components/Navbar";
import MyBookings from "./pages/MyBookings";
import CreateEvent from "./pages/CreateEvent";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Events from "./pages/Events";
import EventDetails from "./pages/EventDetails";
import VerifyOtp from "./pages/VerifyOtp";
import { Toaster } from "react-hot-toast";
import { BrowserRouter, Link, Route, Routes } from "react-router-dom";

function App() {
  return (
    <>
      <BrowserRouter>
        <Navbar />
        <Toaster position="top-right" />
        <Routes>
          <Route path="/" element={<Events />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/my-bookings" element={<MyBookings />} />
          <Route path="/create-event" element={<CreateEvent />} />
          <Route path="/events/:id" element={<EventDetails />}></Route>
          <Route path="/verify-otp" element={<VerifyOtp />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
