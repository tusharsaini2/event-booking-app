import { Link, useNavigate } from "react-router-dom";
import {
  Calendar,
  Ticket,
  PlusCircle,
  LogOut,
  LogIn,
  UserPlus,
} from "lucide-react";
import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar-links">
        <Link to="/" className="navbar-link">
          <Calendar size={18} />
          Events
        </Link>

        {token && (
          <>
            <Link to="/my-bookings" className="navbar-link">
              <Ticket size={18} />
              My Bookings
            </Link>
            {user?.role === "admin" && (
              <Link to="/create-event" className="navbar-link">
                <PlusCircle size={18} />
                Create Event
              </Link>
            )}
          </>
        )}
      </div>

      <div className="navbar-links">
        {token ? (
          <>
            <span className="navbar-user">Welcome, {user?.name}</span>
            <button className="navbar-logout-btn" onClick={handleLogout}>
              <LogOut size={16} />
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="navbar-link">
              <LogIn size={18} />
              Login
            </Link>
            <Link to="/signup" className="navbar-link">
              <UserPlus size={18} />
              Signup
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
