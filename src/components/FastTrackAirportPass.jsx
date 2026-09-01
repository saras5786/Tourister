import { useState } from "react";
import {
  FaPlaneDeparture,
  FaQrcode,
  FaPassport,
  FaCheckCircle,
  FaClock,
  FaSuitcase,
  FaShieldAlt,
} from "react-icons/fa";
import "./FastTrackAirportPass.css";

function FastTrackAirportPass({ onBack, username = "Tourister" }) {
  const [flightNumber, setFlightNumber] = useState("6E-1402");
  const [originAirport, setOriginAirport] = useState("Hyderabad Rajiv Gandhi Intl (HYD)");
  const [destinationAirport, setDestinationAirport] = useState("Kathmandu Tribhuvan Intl (KTM)");
  const [passportNumber, setPassportNumber] = useState("T8842910");
  const [checkInDone, setCheckInDone] = useState(false);
  const [digiYatraActive, setDigiYatraActive] = useState(false);
  const [passToken, setPassToken] = useState("FT-SEC-88294");
  const [immigrationDeclared, setImmigrationDeclared] = useState(false);

  const handleCompleteCheckIn = (e) => {
    e.preventDefault();
    setCheckInDone(true);
  };

  const handleActivateDigiYatra = () => {
    const generatedToken = `FT-SEC-${Math.floor(10000 + Math.random() * 90000)}`;
    setPassToken(generatedToken);
    setDigiYatraActive(true);
    setTimeout(() => {
      alert("✨ FastTrack Biometric E-Gate Pass activated! Show this dynamic QR at Airport Gate 3 to skip security lines in < 4 minutes.");
    }, 400);
  };

  const handleDeclareImmigration = () => {
    setImmigrationDeclared(true);
  };

  return (
    <main className="fasttrack-page">
      <header className="fasttrack-navbar">
        <button className="fasttrack-back-btn" onClick={onBack}>
          ← Dashboard
        </button>
        <div className="fasttrack-nav-title">
          <FaPlaneDeparture className="plane-purple" /> AIRPORT FASTTRACK & DIGITAL IMMIGRATION
        </div>
        <div className="express-pill">Express E-Gate Active</div>
      </header>

      <div className="fasttrack-container">
        {/* HERO */}
        <section className="fasttrack-hero">
          <div className="hero-badge">
            <FaPassport /> ZERO-QUEUE AIRPORT DEPARTURE
          </div>
          <h1>
            Express Airport Check-In & <span>Digital Immigration</span>
          </h1>
          <p>
            Complete web check-in in 30 seconds, generate your FastTrack Biometric E-Gate Pass to bypass security queues, and submit digital immigration declarations for international travel.
          </p>
        </section>

        <div className="fasttrack-grid">
          {/* STEP 1: WEB CHECK-IN */}
          <section className="fasttrack-card">
            <div className="card-header-tag">
              <span>STEP 01</span>
              <FaPlaneDeparture />
            </div>
            <h2>1-Click Web Check-In & Seat Pass</h2>
            <p>Generate digital boarding pass and tag luggage beforehand.</p>

            {!checkInDone ? (
              <form onSubmit={handleCompleteCheckIn} className="checkin-form">
                <div className="input-field">
                  <label>FLIGHT NUMBER</label>
                  <input
                    type="text"
                    value={flightNumber}
                    onChange={(e) => setFlightNumber(e.target.value)}
                    required
                  />
                </div>

                <div className="input-field">
                  <label>DEPARTURE AIRPORT</label>
                  <select
                    value={originAirport}
                    onChange={(e) => setOriginAirport(e.target.value)}
                  >
                    <option value="Hyderabad Rajiv Gandhi Intl (HYD)">Hyderabad (HYD) - Rajiv Gandhi Intl</option>
                    <option value="Visakhapatnam Airport (VTZ)">Visakhapatnam (VTZ)</option>
                    <option value="Tirupati Airport (TIR)">Tirupati (TIR)</option>
                    <option value="Delhi Indira Gandhi Intl (DEL)">Delhi (DEL) - Terminal 3</option>
                  </select>
                </div>

                <div className="input-field">
                  <label>DESTINATION AIRPORT</label>
                  <select
                    value={destinationAirport}
                    onChange={(e) => setDestinationAirport(e.target.value)}
                  >
                    <option value="Kathmandu Tribhuvan Intl (KTM)">Kathmandu (KTM) - Tribhuvan Intl (Nepal)</option>
                    <option value="Dubai International (DXB)">Dubai (DXB) - Terminal 1 (UAE)</option>
                    <option value="Visakhapatnam Airport (VTZ)">Visakhapatnam (VTZ)</option>
                    <option value="Tirupati Airport (TIR)">Tirupati (TIR)</option>
                  </select>
                </div>

                <div className="input-field">
                  <label>PASSENGER NAME & PASSPORT/ID</label>
                  <input
                    type="text"
                    value={`${username.toUpperCase()} (ID: ${passportNumber})`}
                    onChange={(e) => setPassportNumber(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" className="checkin-submit-btn">
                  Generate Digital Boarding Pass →
                </button>
              </form>
            ) : (
              <div className="boarding-pass-preview">
                <div className="bp-top">
                  <div>
                    <span className="bp-airline">TOURISTER AIRWAYS</span>
                    <h3>{originAirport.split(" ")[0]} → {destinationAirport.split(" ")[0]}</h3>
                  </div>
                  <span className="seat-badge">Seat 12A (Window)</span>
                </div>

                <div className="bp-meta-grid">
                  <div>
                    <span>PASSENGER</span>
                    <strong>{username.toUpperCase()}</strong>
                  </div>
                  <div>
                    <span>FLIGHT</span>
                    <strong>{flightNumber}</strong>
                  </div>
                  <div>
                    <span>GATE</span>
                    <strong>Gate 04B</strong>
                  </div>
                  <div>
                    <span>BOARDING</span>
                    <strong>07:15 AM</strong>
                  </div>
                </div>

                <div className="bp-qr-row">
                  <div className="bp-qr-code">
                    <FaQrcode className="big-qr-icon" />
                  </div>
                  <div className="bp-status-text">
                    <FaCheckCircle className="green-check" />
                    <strong>Web Check-In Confirmed</strong>
                    <span>Baggage drop window open at Counter #18</span>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* STEP 2: DIGIYATRA / BIOMETRIC FASTTRACK PASS */}
          <section className="fasttrack-card">
            <div className="card-header-tag purple-tag">
              <span>STEP 02</span>
              <FaShieldAlt />
            </div>
            <h2>FastTrack E-Gate Biometric Pass</h2>
            <p>Skip the physical ID check & CISF security queues with face match.</p>

            <div className="digiyatra-box">
              <div className="dy-status-row">
                <div>
                  <strong>Biometric Digital Identity</strong>
                  <span>Linked with DigiLocker / Aadhaar / Passport</span>
                </div>
                <div className="dy-pill">{digiYatraActive ? "E-GATE UNLOCKED" : "READY"}</div>
              </div>

              {!digiYatraActive ? (
                <div className="dy-action-area">
                  <p>
                    Activating FastTrack Biometric verification reduces average airport entry and security check time from <strong>35 minutes down to 3.5 minutes</strong>.
                  </p>
                  <button className="activate-dy-btn" onClick={handleActivateDigiYatra}>
                    <FaQrcode /> Activate FastTrack Biometric Pass →
                  </button>
                </div>
              ) : (
                <div className="dy-active-pass">
                  <div className="dy-radar-box">
                    <div className="radar-scanner-line" />
                    <FaCheckCircle className="pass-icon" />
                  </div>
                  <h3>FastTrack E-Gate Pass Verified</h3>
                  <p>Present barcode at <strong>DigiYatra Dedicated Lane 1 & 2</strong></p>
                  <div className="token-code">PASS ID: {passToken}</div>
                </div>
              )}
            </div>

            {/* STEP 3: DIGITAL IMMIGRATION CARD */}
            <div className="immigration-card-section">
              <div className="imm-header">
                <FaPassport />
                <strong>International E-Visa & Immigration Declaration</strong>
              </div>
              <p>For Nepal / UAE / International destinations, submit pre-arrival customs form.</p>

              {immigrationDeclared ? (
                <div className="imm-success-box">
                  <FaCheckCircle className="green-check" />
                  <span>Digital Customs & Health Declaration approved for {destinationAirport.split(" ")[0]}. Show digital slip at immigration desk.</span>
                </div>
              ) : (
                <button className="declare-imm-btn" onClick={handleDeclareImmigration}>
                  Submit Digital Immigration Form (Zero Paperwork) →
                </button>
              )}
            </div>
          </section>
        </div>

        {/* TIME SAVER METRICS */}
        <section className="fasttrack-benefits-grid">
          <div className="benefit-card">
            <FaClock className="benefit-icon blue" />
            <div>
              <strong>85% Less Airport Wait Time</strong>
              <span>Dedicated express lanes for Tourister passengers</span>
            </div>
          </div>
          <div className="benefit-card">
            <FaSuitcase className="benefit-icon purple" />
            <div>
              <strong>Instant Digital Baggage Tag</strong>
              <span>Track check-in baggage on your mobile screen</span>
            </div>
          </div>
          <div className="benefit-card">
            <FaShieldAlt className="benefit-icon green" />
            <div>
              <strong>256-Bit Encrypted Security</strong>
              <span>Government-certified privacy standard</span>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default FastTrackAirportPass;
