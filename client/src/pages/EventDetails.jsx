import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import "./EventDetails.css";

function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/events/${id}`,
      );
      setEvent(response.data);
    } catch (error) {
      console.log("Error fetching event", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Please log in first to book seats.");
      return;
    }

    try {
      const orderResponse = await axios.post(
        "http://localhost:5000/api/bookings/create-order",
        {
          eventId: id,
          seatsBooked: 1,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const { orderId, amount, currency, keyId } = orderResponse.data;

      const options = {
        key: keyId,
        amount: amount,
        currency: currency,
        name: "Event Booking App",
        description: event.title,
        order_id: orderId,
        handler: async function (response) {
          try {
            await axios.post(
              "http://localhost:5000/api/bookings/verify-payment",
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                eventId: id,
                seatsBooked: 1,
              },
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              },
            );

            toast.success("Booking successful! Payment verified.");
            fetchEvent(); // refresh seat count on this page
          } catch (error) {
            toast.error(
              error.response?.data?.message || "Payment verification failed",
            );
          }
        },
        prefill: {
          name: JSON.parse(localStorage.getItem("user"))?.name,
          email: JSON.parse(localStorage.getItem("user"))?.email,
        },
        theme: {
          color: "#4f46e5",
        },
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.open();
    } catch (error) {
      toast.error(error.response?.data?.message || "Booking failed");
    }
  };

  if (loading) {
    return <p>Loading event...</p>;
  }

  if (!event) {
    return <p>Event not found.</p>;
  }

  return (
    <div className="details-container">
      <Link to="/" className="details-back-link">
        ← Back to Events
      </Link>

      <div className="details-card">
        <img src={event.imageUrl} alt={event.title} className="details-image" />

        <div className="details-content">
          <h1 className="details-title">{event.title}</h1>
          <p className="details-description">{event.description}</p>

          <div className="details-info-grid">
            <div className="details-info-item">
              <span className="details-info-label">Venue</span>
              <span className="details-info-value">{event.venue}</span>
            </div>
            <div className="details-info-item">
              <span className="details-info-label">Date</span>
              <span className="details-info-value">
                {new Date(event.date).toLocaleDateString()}
              </span>
            </div>
            <div className="details-info-item">
              <span className="details-info-label">Price</span>
              <span className="details-info-value">₹{event.price}</span>
            </div>
            <div className="details-info-item">
              <span className="details-info-label">Seats Left</span>
              <span className="details-info-value">
                {event.availableSeats} / {event.totalSeats}
              </span>
            </div>
          </div>

          <button
            className="details-book-btn"
            onClick={handleBooking}
            disabled={event.availableSeats === 0}
          >
            {event.availableSeats === 0 ? "Sold Out" : "Book 1 Seat"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default EventDetails;
