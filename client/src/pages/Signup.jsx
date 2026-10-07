import { useState } from "react";
import axios from "axios";
import { API_URL } from "../config";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import "./Auth.css";

function Signup() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/api/auth/signup`, {
        name,
        email,
        password,
      });

      toast.success(response.data.message);
      navigate("/verify-otp", { state: { email } });
    } catch (error) {
      toast.error(error.response?.data?.message || "something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h2 className="auth-title">Sign Up</h2>

      <form onSubmit={handleSubmit}>
        <div className="auth-field">
          <label>Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="auth-field">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="auth-field">
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="auth-submit-btn" disabled={loading}>
          {loading ? "Loading..." : "Sign Up"}
        </button>
      </form>
    </div>
  );
}

export default Signup;
