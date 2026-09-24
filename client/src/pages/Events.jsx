import axios from "axios";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import "./Events.css";

function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const socket = io("http://localhost:5000");

    socket.on("seatsUpdated", (data) => {
      setEvents((prevEvents) =>
        prevEvents.map((event) =>
          event._id === data.eventId
            ? { ...event, availableSeats: data.availableSeats }
            : event,
        ),
      );
    });
    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/events");
      setEvents(response.data);
    } catch (error) {
      console.log("Error fetching events", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async (eventId) => {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Please log in first to book seats.");
      return;
    }

    try {
      const orderResponse = await axios.post(
        "http://localhost:5000/api/bookings/create-order",
        {
          eventId,
          seatsBooked: 1,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const { orderId, amount, currency, keyId } = orderResponse.data;

      // step 2: Open razorpay's payment pop-up;
      const options = {
        key: keyId,
        amount: amount,
        currency: currency,
        name: "Event Booking App",
        description: "seat booking successful",
        order_id: orderId,
        handler: async function (response) {
          //step 3: this is run after successful payment.
          try {
            const verifyresponse = await axios.post(
              "http://localhost:5000/api/bookings/verify-payment",
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                eventId,
                seatsBooked: 1,
              },
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              },
            );
            toast.success("Booking successful! Payment verified");
          } catch (error) {
            toast.error(
              error.response?.data?.message || "Payment verification failed",
            );
          }
        },
        prefill: {
          name: JSON.parse(localStorage.getItem("User"))?.name,
          email: JSON.parse(localStorage.getItem("User"))?.email,
        },
        theme: {
          color: "#4f46e5",
        },
      };
      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.open();
    } catch (error) {
      console.log("Message: ", error);
      toast.error(error.response?.data?.message || "Booking failed");
    }
  };

  if (loading) {
    return <p>Loading events..</p>;
  }

  return (
    <div className="events-container">
      <div className="events-container">
        <div className="hero-section">
          <h1 className="hero-title">Find Your Next Experience</h1>
          <p className="hero-subtitle">
            Discover and book tickets for concerts, shows, and events near you.
          </p>
        </div>

        <h2 className="events-title">Available Events</h2>

        {events.length === 0 && <p>Events not found!</p>}

        <div className="events-grid">
          {events.map((event) => (
            <div key={event._id} className="event-card">
              <Link to={`/events/${event._id}`} className="event-card-link">
                <img
                  src={event.imageUrl}
                  alt={event.title}
                  className="event-card-image"
                />
                <h3 className="event-card-title">{event.title}</h3>
                <p className="event-card-description">{event.description}</p>
              </Link>
              <p className="event-card-detail">Venue: {event.venue}</p>
              <p className="event-card-detail">
                Date: {new Date(event.date).toLocaleDateString()}
              </p>
              <p className="event-card-price">₹{event.price}</p>
              <p className="event-card-seats">
                {event.availableSeats} / {event.totalSeats} seats available
              </p>
              <Link to={`/events/${event._id}`} className="event-card-button">
                View Details
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Events;
