import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { API_URL } from "../config";
import axios from "axios";
import toast from "react-hot-toast";
import "./Auth.css";

function VerifyOtp() {
  const [otp, setOtp] = useState("");
  // const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email;

  const handleSubmit = async (e) => {
    e.preventDefault();
    // setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/api/auth/verify-otp`, {
        email,
        otp,
      });

      toast.success(response.data.message);

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      toast.error(error.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  if (!email) {
    return (
      <div className="auth-container">
        <p>No email found. Please sign up first.</p>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <h2 className="auth-title">Verify Your Email</h2>
      <p
        style={{
          textAlign: "center",
          marginBottom: "16px",
          color: "var(--color-text-muted)",
        }}
      >
        We sent a 6-digit code to {email}
      </p>

      <form onSubmit={handleSubmit}>
        <div className="auth-field">
          <label>Enter OTP</label>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            maxLength={6}
            required
          />
        </div>

        <button type="submit" className="auth-submit-btn">
          Verify
        </button>
      </form>
    </div>
  );
}

export default VerifyOtp;
