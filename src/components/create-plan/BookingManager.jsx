import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaPlane,
  FaTrain,
  FaBus,
  FaHotel,
  FaPlus,
  FaTrash,
  FaEdit,
  FaCalendarAlt,
  FaClock,
  FaMapMarkerAlt,
  FaTicketAlt,
  FaTimes,
  FaCheck,
  FaInfoCircle,
} from "react-icons/fa";
import "./BookingManager.css";

const STORAGE_KEY = "tourister_manual_bookings";

function BookingManager({ destination = "Kakinada", source = "Hyderabad" }) {
  const [bookings, setBookings] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [modalType, setModalType] = useState(null); // 'flight' | 'train' | 'bus' | 'hotel' | null
  const [editingId, setEditingId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    // Flight fields
    airlineName: "",
    flightNumber: "",
    flightDate: "",
    flightDeparture: "",
    flightArrival: "",
    flightOriginAirport: "",
    flightDestAirport: "",
    flightPnr: "",
    flightSeat: "",
    flightTerminal: "",
    // Train fields
    trainName: "",
    trainNumber: "",
    trainDate: "",
    trainDeparture: "",
    trainArrival: "",
    trainPnr: "",
    trainSeat: "",
    // Bus fields
    busOperator: "",
    busNumber: "",
    busDate: "",
    busDeparture: "",
    busArrival: "",
    busBoardingPoint: "",
    busPnr: "",
    // Hotel fields
    hotelName: "",
    hotelCheckIn: "",
    hotelCheckOut: "",
    hotelPnr: "",
    hotelRoomType: "",
    hotelAddress: "",
  });

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
  }, [bookings]);

  const openAddModal = (type) => {
    setModalType(type);
    setEditingId(null);
    setFormData({
      // Flight defaults
      airlineName: "",
      flightNumber: "",
      flightDate: new Date().toISOString().split("T")[0],
      flightDeparture: "08:30 AM",
      flightArrival: "11:15 AM",
      flightOriginAirport: source,
      flightDestAirport: destination,
      flightPnr: "",
      flightSeat: "14A",
      flightTerminal: "Terminal 2",
      // Train defaults
      trainName: "",
      trainNumber: "",
      trainDate: new Date().toISOString().split("T")[0],
      trainDeparture: "06:30 AM",
      trainArrival: "02:30 PM",
      trainPnr: "",
      trainSeat: "",
      // Bus defaults
      busOperator: "",
      busNumber: "",
      busDate: new Date().toISOString().split("T")[0],
      busDeparture: "09:00 PM",
      busArrival: "06:00 AM",
      busBoardingPoint: source,
      busPnr: "",
      // Hotel defaults
      hotelName: "",
      hotelCheckIn: new Date().toISOString().split("T")[0],
      hotelCheckOut: new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0],
      hotelPnr: "",
      hotelRoomType: "Deluxe AC Room",
      hotelAddress: destination,
    });
  };

  const openEditModal = (booking) => {
    setModalType(booking.type);
    setEditingId(booking.id);
    setFormData({ ...booking.data });
  };

  const handleSaveBooking = (e) => {
    e.preventDefault();

    if (editingId) {
      // Update existing
      setBookings((prev) =>
        prev.map((b) =>
          b.id === editingId ? { ...b, data: { ...formData } } : b
        )
      );
    } else {
      // Create new
      const newBooking = {
        id: `bk-${Date.now()}`,
        type: modalType,
        destination,
        source,
        createdAt: new Date().toISOString(),
        data: { ...formData },
      };
      setBookings((prev) => [newBooking, ...prev]);
    }

    setModalType(null);
    setEditingId(null);
  };

  const handleDeleteBooking = (id) => {
    setBookings((prev) => prev.filter((b) => b.id !== id));
  };

  return (
    <div className="booking-manager-wrapper">
      {/* SECTION HEADER & ADD ACTIONS */}
      <div className="manager-header-row">
        <div>
          <h3>My Saved Personal Trip Bookings</h3>
          <p>
            Manually save your confirmed flight, train, bus, or hotel tickets for quick access during your journey.
          </p>
        </div>

        <div className="add-booking-buttons-group">
          <button
            type="button"
            className="add-bk-btn flight"
            onClick={() => openAddModal("flight")}
          >
            <FaPlus /> <FaPlane /> Add Flight
          </button>
          <button
            type="button"
            className="add-bk-btn train"
            onClick={() => openAddModal("train")}
          >
            <FaPlus /> <FaTrain /> Add Train
          </button>
          <button
            type="button"
            className="add-bk-btn bus"
            onClick={() => openAddModal("bus")}
          >
            <FaPlus /> <FaBus /> Add Bus
          </button>
          <button
            type="button"
            className="add-bk-btn hotel"
            onClick={() => openAddModal("hotel")}
          >
            <FaPlus /> <FaHotel /> Add Hotel
          </button>
        </div>
      </div>

      <div className="booking-notice-callout">
        <FaInfoCircle />
        <span>
          <strong>Personal Trip Record:</strong> Manually added details are stored locally on your device to keep your tickets organized.
        </span>
      </div>

      {/* SAVED BOOKINGS CARDS GRID */}
      {bookings.length === 0 ? (
        <div className="no-bookings-placeholder">
          <FaTicketAlt className="empty-ticket-icon" />
          <h4>No personal booking records added yet</h4>
          <p>Click the buttons above to save your flight, train, bus, or hotel booking.</p>
        </div>
      ) : (
        <div className="saved-bookings-grid">
          {bookings.map((b) => {
            const d = b.data;

            // FLIGHT CARD
            if (b.type === "flight") {
              return (
                <div key={b.id} className="booking-card flight-card">
                  <div className="card-top-type">
                    <span className="type-badge flight">
                      <FaPlane /> FLIGHT TICKET
                    </span>
                    <div className="card-action-btns">
                      <button onClick={() => openEditModal(b)} title="Edit">
                        <FaEdit />
                      </button>
                      <button onClick={() => handleDeleteBooking(b.id)} title="Delete">
                        <FaTrash />
                      </button>
                    </div>
                  </div>

                  <h4 className="booking-title">
                    {d.airlineName || "Flight"}{" "}
                    {d.flightNumber ? `(${d.flightNumber})` : ""}
                  </h4>

                  <div className="booking-fields-list">
                    <div>
                      <FaCalendarAlt /> Date: <strong>{d.flightDate || "Not specified"}</strong>
                    </div>
                    <div>
                      <FaClock /> Dep: <strong>{d.flightDeparture || "--"}</strong> ({d.flightOriginAirport || source}) ➔ Arr: <strong>{d.flightArrival || "--"}</strong> ({d.flightDestAirport || destination})
                    </div>
                    {d.flightPnr && (
                      <div>
                        <FaTicketAlt /> PNR / E-Ticket: <strong>{d.flightPnr}</strong>
                      </div>
                    )}
                    {(d.flightSeat || d.flightTerminal) && (
                      <div>
                        {d.flightSeat ? `Seat: ${d.flightSeat}` : ""}{" "}
                        {d.flightTerminal ? `· ${d.flightTerminal}` : ""}
                      </div>
                    )}
                  </div>
                </div>
              );
            }

            // TRAIN CARD
            if (b.type === "train") {
              return (
                <div key={b.id} className="booking-card train-card">
                  <div className="card-top-type">
                    <span className="type-badge train">
                      <FaTrain /> TRAIN BOOKING
                    </span>
                    <div className="card-action-btns">
                      <button onClick={() => openEditModal(b)} title="Edit">
                        <FaEdit />
                      </button>
                      <button onClick={() => handleDeleteBooking(b.id)} title="Delete">
                        <FaTrash />
                      </button>
                    </div>
                  </div>

                  <h4 className="booking-title">
                    {d.trainName || "Express Train"}{" "}
                    {d.trainNumber ? `(#${d.trainNumber})` : ""}
                  </h4>

                  <div className="booking-fields-list">
                    <div>
                      <FaCalendarAlt /> Date: <strong>{d.trainDate || "Not specified"}</strong>
                    </div>
                    <div>
                      <FaClock /> Dep: <strong>{d.trainDeparture || "--"}</strong> ➔ Arr: <strong>{d.trainArrival || "--"}</strong>
                    </div>
                    {d.trainPnr && (
                      <div>
                        <FaTicketAlt /> PNR: <strong>{d.trainPnr}</strong>
                      </div>
                    )}
                    {d.trainSeat && (
                      <div>
                        Coach/Seat: <strong>{d.trainSeat}</strong>
                      </div>
                    )}
                  </div>
                </div>
              );
            }

            // BUS CARD
            if (b.type === "bus") {
              return (
                <div key={b.id} className="booking-card bus-card">
                  <div className="card-top-type">
                    <span className="type-badge bus">
                      <FaBus /> BUS BOOKING
                    </span>
                    <div className="card-action-btns">
                      <button onClick={() => openEditModal(b)} title="Edit">
                        <FaEdit />
                      </button>
                      <button onClick={() => handleDeleteBooking(b.id)} title="Delete">
                        <FaTrash />
                      </button>
                    </div>
                  </div>

                  <h4 className="booking-title">
                    {d.busOperator || "AC Sleeper Bus"}{" "}
                    {d.busNumber ? `(${d.busNumber})` : ""}
                  </h4>

                  <div className="booking-fields-list">
                    <div>
                      <FaCalendarAlt /> Date: <strong>{d.busDate || "Not specified"}</strong>
                    </div>
                    <div>
                      <FaClock /> Dep: <strong>{d.busDeparture || "--"}</strong> ➔ Arr: <strong>{d.busArrival || "--"}</strong>
                    </div>
                    {d.busBoardingPoint && (
                      <div>
                        <FaMapMarkerAlt /> Boarding: <strong>{d.busBoardingPoint}</strong>
                      </div>
                    )}
                    {d.busPnr && (
                      <div>
                        <FaTicketAlt /> Booking Ref: <strong>{d.busPnr}</strong>
                      </div>
                    )}
                  </div>
                </div>
              );
            }

            // HOTEL CARD
            return (
              <div key={b.id} className="booking-card hotel-card">
                <div className="card-top-type">
                  <span className="type-badge hotel">
                    <FaHotel /> HOTEL STAY
                  </span>
                  <div className="card-action-btns">
                    <button onClick={() => openEditModal(b)} title="Edit">
                      <FaEdit />
                    </button>
                    <button onClick={() => handleDeleteBooking(b.id)} title="Delete">
                      <FaTrash />
                    </button>
                  </div>
                </div>

                <h4 className="booking-title">{d.hotelName || "Hotel Stay"}</h4>

                <div className="booking-fields-list">
                  <div>
                    <FaCalendarAlt /> Check-in: <strong>{d.hotelCheckIn}</strong> ➔ Check-out: <strong>{d.hotelCheckOut}</strong>
                  </div>
                  {d.hotelRoomType && (
                    <div>
                      Room: <strong>{d.hotelRoomType}</strong>
                    </div>
                  )}
                  {d.hotelAddress && (
                    <div>
                      <FaMapMarkerAlt /> Location: <strong>{d.hotelAddress}</strong>
                    </div>
                  )}
                  {d.hotelPnr && (
                    <div>
                      <FaTicketAlt /> Booking ID: <strong>{d.hotelPnr}</strong>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ADD / EDIT MODAL FORM */}
      <AnimatePresence>
        {modalType && (
          <div className="booking-modal-overlay" onClick={() => setModalType(null)}>
            <motion.div
              className="booking-modal-box"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="booking-modal-header">
                <div>
                  <h3>
                    {editingId ? "Edit" : "Add"}{" "}
                    {modalType === "flight"
                      ? "Flight Ticket"
                      : modalType === "train"
                      ? "Train Ticket"
                      : modalType === "bus"
                      ? "Bus Booking"
                      : "Hotel Stay"}
                  </h3>
                  <p>Save details to your personal trip dossier.</p>
                </div>
                <button
                  type="button"
                  className="close-modal-btn"
                  onClick={() => setModalType(null)}
                >
                  <FaTimes />
                </button>
              </div>

              <form onSubmit={handleSaveBooking} className="booking-form-grid">
                {/* FLIGHT FORM */}
                {modalType === "flight" && (
                  <>
                    <div className="form-field">
                      <label>Airline Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. IndiGo, Air India, Emirates"
                        value={formData.airlineName}
                        onChange={(e) =>
                          setFormData({ ...formData, airlineName: e.target.value })
                        }
                      />
                    </div>
                    <div className="form-field">
                      <label>Flight Number</label>
                      <input
                        type="text"
                        placeholder="e.g. 6E 524 / AI 102"
                        value={formData.flightNumber}
                        onChange={(e) =>
                          setFormData({ ...formData, flightNumber: e.target.value })
                        }
                      />
                    </div>
                    <div className="form-field">
                      <label>Journey Date *</label>
                      <input
                        type="date"
                        required
                        value={formData.flightDate}
                        onChange={(e) =>
                          setFormData({ ...formData, flightDate: e.target.value })
                        }
                      />
                    </div>
                    <div className="form-field">
                      <label>Departure Airport / City</label>
                      <input
                        type="text"
                        placeholder="e.g. Rajiv Gandhi Intl (HYD)"
                        value={formData.flightOriginAirport}
                        onChange={(e) =>
                          setFormData({ ...formData, flightOriginAirport: e.target.value })
                        }
                      />
                    </div>
                    <div className="form-field">
                      <label>Arrival Airport / City</label>
                      <input
                        type="text"
                        placeholder="e.g. Schiphol Airport (AMS) / DEL"
                        value={formData.flightDestAirport}
                        onChange={(e) =>
                          setFormData({ ...formData, flightDestAirport: e.target.value })
                        }
                      />
                    </div>
                    <div className="form-field">
                      <label>Departure Time</label>
                      <input
                        type="text"
                        placeholder="e.g. 08:30 AM"
                        value={formData.flightDeparture}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            flightDeparture: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="form-field">
                      <label>Arrival Time</label>
                      <input
                        type="text"
                        placeholder="e.g. 11:15 AM"
                        value={formData.flightArrival}
                        onChange={(e) =>
                          setFormData({ ...formData, flightArrival: e.target.value })
                        }
                      />
                    </div>
                    <div className="form-field">
                      <label>PNR / E-Ticket Reference</label>
                      <input
                        type="text"
                        placeholder="e.g. 7KJ94L"
                        value={formData.flightPnr}
                        onChange={(e) =>
                          setFormData({ ...formData, flightPnr: e.target.value })
                        }
                      />
                    </div>
                    <div className="form-field">
                      <label>Seat & Terminal</label>
                      <input
                        type="text"
                        placeholder="e.g. Seat: 14A · Terminal 2"
                        value={formData.flightSeat}
                        onChange={(e) =>
                          setFormData({ ...formData, flightSeat: e.target.value })
                        }
                      />
                    </div>
                  </>
                )}

                {/* TRAIN FORM */}
                {modalType === "train" && (
                  <>
                    <div className="form-field">
                      <label>Train Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Godavari Superfast Express"
                        value={formData.trainName}
                        onChange={(e) =>
                          setFormData({ ...formData, trainName: e.target.value })
                        }
                      />
                    </div>
                    <div className="form-field">
                      <label>Train Number</label>
                      <input
                        type="text"
                        placeholder="e.g. 12728"
                        value={formData.trainNumber}
                        onChange={(e) =>
                          setFormData({ ...formData, trainNumber: e.target.value })
                        }
                      />
                    </div>
                    <div className="form-field">
                      <label>Journey Date *</label>
                      <input
                        type="date"
                        required
                        value={formData.trainDate}
                        onChange={(e) =>
                          setFormData({ ...formData, trainDate: e.target.value })
                        }
                      />
                    </div>
                    <div className="form-field">
                      <label>Departure Time</label>
                      <input
                        type="text"
                        placeholder="e.g. 05:15 PM"
                        value={formData.trainDeparture}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            trainDeparture: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="form-field">
                      <label>Arrival Time</label>
                      <input
                        type="text"
                        placeholder="e.g. 06:00 AM"
                        value={formData.trainArrival}
                        onChange={(e) =>
                          setFormData({ ...formData, trainArrival: e.target.value })
                        }
                      />
                    </div>
                    <div className="form-field">
                      <label>PNR / Booking Reference</label>
                      <input
                        type="text"
                        placeholder="e.g. 4829103948"
                        value={formData.trainPnr}
                        onChange={(e) =>
                          setFormData({ ...formData, trainPnr: e.target.value })
                        }
                      />
                    </div>
                    <div className="form-field">
                      <label>Coach & Seat</label>
                      <input
                        type="text"
                        placeholder="e.g. B2 - 42 (Lower Berth)"
                        value={formData.trainSeat}
                        onChange={(e) =>
                          setFormData({ ...formData, trainSeat: e.target.value })
                        }
                      />
                    </div>
                  </>
                )}

                {/* BUS FORM */}
                {modalType === "bus" && (
                  <>
                    <div className="form-field">
                      <label>Bus Operator / Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Orange Tours & Travels AC Sleeper"
                        value={formData.busOperator}
                        onChange={(e) =>
                          setFormData({ ...formData, busOperator: e.target.value })
                        }
                      />
                    </div>
                    <div className="form-field">
                      <label>Bus Number</label>
                      <input
                        type="text"
                        placeholder="e.g. AP 05 TE 9821"
                        value={formData.busNumber}
                        onChange={(e) =>
                          setFormData({ ...formData, busNumber: e.target.value })
                        }
                      />
                    </div>
                    <div className="form-field">
                      <label>Journey Date *</label>
                      <input
                        type="date"
                        required
                        value={formData.busDate}
                        onChange={(e) =>
                          setFormData({ ...formData, busDate: e.target.value })
                        }
                      />
                    </div>
                    <div className="form-field">
                      <label>Departure Time</label>
                      <input
                        type="text"
                        placeholder="e.g. 09:30 PM"
                        value={formData.busDeparture}
                        onChange={(e) =>
                          setFormData({ ...formData, busDeparture: e.target.value })
                        }
                      />
                    </div>
                    <div className="form-field">
                      <label>Arrival Time</label>
                      <input
                        type="text"
                        placeholder="e.g. 06:15 AM"
                        value={formData.busArrival}
                        onChange={(e) =>
                          setFormData({ ...formData, busArrival: e.target.value })
                        }
                      />
                    </div>
                    <div className="form-field">
                      <label>Boarding Point</label>
                      <input
                        type="text"
                        placeholder="e.g. LB Nagar Ring Road"
                        value={formData.busBoardingPoint}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            busBoardingPoint: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="form-field">
                      <label>Booking Reference / Ticket No</label>
                      <input
                        type="text"
                        placeholder="e.g. RB98214"
                        value={formData.busPnr}
                        onChange={(e) =>
                          setFormData({ ...formData, busPnr: e.target.value })
                        }
                      />
                    </div>
                  </>
                )}

                {/* HOTEL FORM */}
                {modalType === "hotel" && (
                  <>
                    <div className="form-field">
                      <label>Hotel Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Royal Grand Heritage Residency"
                        value={formData.hotelName}
                        onChange={(e) =>
                          setFormData({ ...formData, hotelName: e.target.value })
                        }
                      />
                    </div>
                    <div className="form-field">
                      <label>Check-in Date *</label>
                      <input
                        type="date"
                        required
                        value={formData.hotelCheckIn}
                        onChange={(e) =>
                          setFormData({ ...formData, hotelCheckIn: e.target.value })
                        }
                      />
                    </div>
                    <div className="form-field">
                      <label>Check-out Date *</label>
                      <input
                        type="date"
                        required
                        value={formData.hotelCheckOut}
                        onChange={(e) =>
                          setFormData({ ...formData, hotelCheckOut: e.target.value })
                        }
                      />
                    </div>
                    <div className="form-field">
                      <label>Room Type</label>
                      <input
                        type="text"
                        placeholder="e.g. Executive King Suite"
                        value={formData.hotelRoomType}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            hotelRoomType: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="form-field">
                      <label>Hotel Address / Location</label>
                      <input
                        type="text"
                        placeholder="e.g. Main Temple Road, Kakinada"
                        value={formData.hotelAddress}
                        onChange={(e) =>
                          setFormData({ ...formData, hotelAddress: e.target.value })
                        }
                      />
                    </div>
                    <div className="form-field">
                      <label>Booking ID / Reference</label>
                      <input
                        type="text"
                        placeholder="e.g. MMT-HTL-98214"
                        value={formData.hotelPnr}
                        onChange={(e) =>
                          setFormData({ ...formData, hotelPnr: e.target.value })
                        }
                      />
                    </div>
                  </>
                )}

                <div className="form-submit-row">
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={() => setModalType(null)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="save-bk-submit-btn">
                    <FaCheck /> Save Booking Record
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default BookingManager;
