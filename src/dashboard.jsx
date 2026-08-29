import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import touristerAI from "./assets/tourister-ai.png";
import touristerWallet from "./assets/tourister-wallet.png";

import "./Dashboard.css";

const dots = [
  { id: 1, left: "8%", top: "18%", size: 10, type: "pink" },
  { id: 2, left: "16%", top: "72%", size: 18, type: "orange" },
  { id: 3, left: "28%", top: "15%", size: 8, type: "blue" },
  { id: 4, left: "38%", top: "82%", size: 13, type: "purple" },
  { id: 5, left: "50%", top: "13%", size: 9, type: "cyan" },
  { id: 6, left: "63%", top: "24%", size: 15, type: "pink" },
  { id: 7, left: "74%", top: "80%", size: 10, type: "blue" },
  { id: 8, left: "88%", top: "18%", size: 18, type: "purple" },
  { id: 9, left: "92%", top: "58%", size: 8, type: "cyan" },
  { id: 10, left: "6%", top: "52%", size: 7, type: "blue" },
  { id: 11, left: "23%", top: "40%", size: 9, type: "orange" },
  { id: 12, left: "46%", top: "55%", size: 7, type: "pink" },
  { id: 13, left: "57%", top: "74%", size: 14, type: "cyan" },
  { id: 14, left: "81%", top: "42%", size: 8, type: "purple" },
  { id: 15, left: "34%", top: "67%", size: 7, type: "blue" },
];

function Dashboard() {
  const [mouse, setMouse] = useState({
    x: 0,
    y: 0,
  });

  const [activeSection, setActiveSection] = useState(null);

  useEffect(() => {
    const handleMouseMove = (event) => {
      setMouse({
        x: event.clientX,
        y: event.clientY,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const getDotMovement = (left, top) => {
    const dotX =
      (parseFloat(left) / 100) * window.innerWidth;

    const dotY =
      (parseFloat(top) / 100) * window.innerHeight;

    const dx = dotX - mouse.x;
    const dy = dotY - mouse.y;

    const distance = Math.sqrt(
      dx * dx + dy * dy
    );

    const interactionDistance = 180;

    if (
      distance < interactionDistance &&
      distance > 0
    ) {
      const strength =
        (interactionDistance - distance) /
        interactionDistance;

      return {
        x:
          (dx / distance) *
          strength *
          35,

        y:
          (dy / distance) *
          strength *
          35,
      };
    }

    return {
      x: 0,
      y: 0,
    };
  };

  return (
    <div
      className="dashboard-page"
      style={{
        "--mouse-x": `${mouse.x}px`,
        "--mouse-y": `${mouse.y}px`,
      }}
    >
      {/* MOUSE GLOW */}

      <div className="dashboard-mouse-glow" />

      {/* DYNAMIC BACKGROUND */}

      <div className="dashboard-orb orb-one" />
      <div className="dashboard-orb orb-two" />
      <div className="dashboard-orb orb-three" />
      <div className="dashboard-orb orb-four" />

      {/* INTERACTIVE DOTS */}

      {dots.map((dot) => {
        const movement = getDotMovement(
          dot.left,
          dot.top
        );

        return (
          <motion.div
            key={dot.id}
            className={`dashboard-dot ${dot.type}`}
            style={{
              left: dot.left,
              top: dot.top,
              width: dot.size,
              height: dot.size,
            }}
            animate={{
              x: movement.x,
              y: movement.y,
            }}
            transition={{
              type: "spring",
              stiffness: 150,
              damping: 13,
            }}
          />
        );
      })}

      {/* TOP NAVBAR */}

      <header className="dashboard-navbar">

        <div className="dashboard-logo">
          TOURISTER
        </div>

        <div className="dashboard-nav-right">

          <button
            className="wallet-nav-button"
            onClick={() =>
              setActiveSection("wallet")
            }
          >
            Explore Tourister Wallet
          </button>

          <div className="profile-circle">
            U
          </div>

        </div>

      </header>

      {/* MAIN CONTENT */}

      <main className="dashboard-main">

        {/* WELCOME */}

        <section className="dashboard-welcome">

          <motion.p
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
          >
            Welcome to your travel space
          </motion.p>

          <motion.h1
            initial={{
              opacity: 0,
              y: 30,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.1,
            }}
          >
            What would you like to do today?
          </motion.h1>

          <motion.span
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            transition={{
              delay: 0.3,
            }}
          >
            Plan, explore, connect and travel smarter.
          </motion.span>

        </section>

        {/* MAIN FEATURE CARDS */}

        <section className="feature-grid">

          {/* AI */}

          <motion.button
            className="feature-card ai-card"
            onClick={() =>
              setActiveSection("ai")
            }
            whileHover={{
              y: -12,
              scale: 1.02,
            }}
            whileTap={{
              scale: 0.98,
            }}
          >

            <div className="card-image-area">

              <img
                src={touristerAI}
                alt="Tourister AI"
              />

            </div>

            <div className="card-content">

              <div className="card-number">
                01
              </div>

              <h2>
                Tourister AI
              </h2>

              <p>
                Let AI create a personalised
                travel plan based on your
                destination, budget and interests.
              </p>

              <span className="card-action">
                Start Planning →
              </span>

            </div>

          </motion.button>


          {/* MANUAL PLAN */}

          <motion.button
            className="feature-card manual-card"
            onClick={() =>
              setActiveSection("manual")
            }
            whileHover={{
              y: -12,
              scale: 1.02,
            }}
            whileTap={{
              scale: 0.98,
            }}
          >

            <div className="manual-icon">
              <span>02</span>
            </div>

            <div className="card-content">

              <div className="card-number">
                CREATE
              </div>

              <h2>
                Make Your Own Plan
              </h2>

              <p>
                Build your trip step by step.
                Choose destinations, places,
                transport and your schedule.
              </p>

              <span className="card-action">
                Create Your Plan →
              </span>

            </div>

          </motion.button>


          {/* COMMUNITY */}

          <motion.button
            className="feature-card community-card"
            onClick={() =>
              setActiveSection("community")
            }
            whileHover={{
              y: -12,
              scale: 1.02,
            }}
            whileTap={{
              scale: 0.98,
            }}
          >

            <div className="community-visual">

              <div className="community-line line-one" />
              <div className="community-line line-two" />
              <div className="community-line line-three" />

            </div>

            <div className="card-content">

              <div className="card-number">
                03
              </div>

              <h2>
                Travel Community
              </h2>

              <p>
                Share your experiences,
                post travel updates and report
                problems you face during travel.
              </p>

              <span className="card-action">
                Explore Community →
              </span>

            </div>

          </motion.button>

        </section>


        {/* NEWS SECTION */}

        <section className="travel-news">

          <div className="news-label">
            TRAVEL UPDATE
          </div>

          <div className="news-content">

            <div>

              <h2>
                Nepal Travel Information
              </h2>

              <p>
                Stay updated with the latest
                travel and weather information
                before planning your journey.
              </p>

            </div>

            <button
              onClick={() =>
                setActiveSection("news")
              }
            >
              View Updates →
            </button>

          </div>

        </section>


        {/* WALLET CARD */}

        <motion.section
          className="wallet-section"
          whileHover={{
            y: -6,
          }}
        >

          <div className="wallet-image">

            <img
              src={touristerWallet}
              alt="Tourister Wallet"
            />

          </div>

          <div className="wallet-content">

            <span>
              TOURISTER WALLET
            </span>

            <h2>
              Travel with simpler payments.
            </h2>

            <p>
              A simulated travel wallet where
              users can add funds and use their
              wallet balance for Tourister payments.
            </p>

            <button
              onClick={() =>
                setActiveSection("wallet")
              }
            >
              Open Wallet →
            </button>

          </div>

        </motion.section>


        {/* ACTIVE SECTION */}

        {activeSection && (

          <motion.section
            className="active-panel"
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
          >

            <button
              className="close-panel"
              onClick={() =>
                setActiveSection(null)
              }
            >
              ×
            </button>

            {activeSection === "ai" && (
              <>
                <h2>
                  Tourister AI Planner
                </h2>

                <p>
                  Enter your destination,
                  budget and travel preferences
                  to begin planning your trip.
                </p>

                <button>
                  Create AI Plan →
                </button>
              </>
            )}

            {activeSection === "manual" && (
              <>
                <h2>
                  Make Your Own Plan
                </h2>

                <p>
                  Start building your travel
                  itinerary step by step.
                </p>

                <button>
                  Create New Plan →
                </button>
              </>
            )}

            {activeSection === "community" && (
              <>
                <h2>
                  Travel Community
                </h2>

                <p>
                  Share experiences, post travel
                  information or report a problem.
                </p>

                <button>
                  Create Post →
                </button>
              </>
            )}

            {activeSection === "wallet" && (
              <>
                <h2>
                  Tourister Wallet
                </h2>

                <p>
                  Wallet simulation will appear
                  here. You can later add balance,
                  verification and payment features.
                </p>

                <button>
                  Open Wallet →
                </button>
              </>
            )}

            {activeSection === "news" && (
              <>
                <h2>
                  Latest Travel Updates
                </h2>

                <p>
                  Important destination updates
                  and travel alerts will appear
                  here.
                </p>
              </>
            )}

          </motion.section>

        )}

      </main>

    </div>
  );
}

export default Dashboard;