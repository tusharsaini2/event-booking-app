import { useEffect, useState } from "react";
import axios from "axios";
import "./MyBookings.css";

function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("Please log in to view your bookings.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(
        "http://localhost:5000/api/bookings/my-bookings",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setBookings(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <p>Loading your bookings...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className="bookings-container">
      <h2 className="bookings-title">My Bookings</h2>

      {bookings.length === 0 && <p>You have no bookings yet.</p>}

      {bookings.map((booking) => (
        <div key={booking._id} className="booking-card">
          <div className="booking-info">
            <h3>{booking.event?.title}</h3>
            <p>Venue: {booking.event?.venue}</p>
            <p>
              Date:{" "}
              {booking.event?.date &&
                new Date(booking.event.date).toLocaleDateString()}
            </p>
            <p>Seats Booked: {booking.seatsBooked}</p>
          </div>

          <span className={`booking-status ${booking.status}`}>
            {booking.status}
          </span>
        </div>
      ))}
    </div>
  );
}

export default MyBookings;
