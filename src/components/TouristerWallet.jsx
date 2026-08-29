import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaWallet,
  FaAward,
  FaPlus,
  FaArrowUp,
  FaArrowDown,
  FaGift,
  FaHistory,
  FaQrcode,
  FaTimes,
  FaTag,
  FaCreditCard,
  FaGlobeAmericas,
  FaCheckCircle,
} from "react-icons/fa";
import touristerWalletImg from "../assets/tourister-wallet.png";
import "./TouristerWallet.css";

const initialRewards = [
  {
    id: "rew-lounge-1",
    title: "Executive Airport & Railway VIP Lounge Access Pass",
    desc: "Complimentary access to Premium Lounges across major Indian airports & railway junctions (Buffet dining, high-speed WiFi, shower & relaxation zone).",
    costPoints: 350,
    category: "VIP Lounge Access",
    icon: "🛋️",
  },
  {
    id: "rew-1",
    title: "10% GI Artisan Craft Discount Voucher",
    desc: "Valid at all verified Bidriware, Etikoppaka & Sanganer artisan guild shops across India.",
    costPoints: 150,
    category: "Artisan Discount",
    icon: "🎨",
  },
  {
    id: "rew-2",
    title: "Free Eco-Boardwalk Sanctuary Pass",
    desc: "1 Complimentary Entry Pass for Coringa or Pichavaram mangrove eco-trails.",
    costPoints: 200,
    category: "Eco-Pass",
    icon: "🌿",
  },
  {
    id: "rew-3",
    title: "₹500 Heritage Homestay Dining Voucher",
    desc: "Redeemable for traditional thali & regional dining at partner heritage homestays.",
    costPoints: 300,
    category: "Food & Stay",
    icon: "🍲",
  },
  {
    id: "rew-4",
    title: "Tourister Gold Pioneer Shield Badge",
    desc: "Permanent profile prestige emblem with VIP guide priority assistance.",
    costPoints: 500,
    category: "Status Badge",
    icon: "🏆",
  },
];

function TouristerWallet({
  onBack,
  userPoints = 300,
  walletBalance = 2500,
  onUpdateBalance,
  onUpdatePoints,
  username = "Tourister",
}) {
  const [activeTab, setActiveTab] = useState("wallet"); // 'wallet' | 'card-to-upi' | 'rewards' | 'history'
  const [showAddMoneyModal, setShowAddMoneyModal] = useState(false);
  const [addAmount, setAddAmount] = useState(1000);
  const [showPayModal, setShowPayModal] = useState(false);
  const [payRecipient, setPayRecipient] = useState("Etikoppaka Master Woodcraft Guild");
  const [payAmount, setPayAmount] = useState(450);

  // International Card to UPI State
  const [foreignCurrency, setForeignCurrency] = useState("USD");
  const [foreignAmount, setForeignAmount] = useState(50);
  const [cardNumber, setCardNumber] = useState("4532 •••• •••• 8892");
  const [cardHolder, setCardHolder] = useState("John Alexander");
  const [cardExpiry, setCardExpiry] = useState("08/29");
  const [cardCvv, setCardCvv] = useState("742");
  const [billingCountry, setBillingCountry] = useState("United States");
  const [cardTransferSuccess, setCardTransferSuccess] = useState(false);

  const exchangeRates = {
    USD: 83.5,
    EUR: 90.2,
    GBP: 105.8,
    AUD: 54.6,
    SGD: 62.1,
    CAD: 61.3,
  };

  const calculatedINR = Math.round(Number(foreignAmount) * (exchangeRates[foreignCurrency] || 83.5));

  const [transactions, setTransactions] = useState([
    {
      id: "tx-1",
      title: "Hidden Gem Verified: Etikoppaka Craft Village",
      type: "points",
      amount: "+300 T-Points",
      date: "Today, 2:15 PM",
      status: "Completed",
      positive: true,
    },
    {
      id: "tx-2",
      title: "Simulated Wallet Top-Up via UPI",
      type: "cash",
      amount: "+₹2,500",
      date: "Yesterday, 6:30 PM",
      status: "Completed",
      positive: true,
    },
  ]);

  const handleAddFunds = (e) => {
    e.preventDefault();
    if (addAmount <= 0) return;

    onUpdateBalance(walletBalance + Number(addAmount));
    const newTxId = `tx-fund-${transactions.length + 1}`;
    setTransactions((prev) => [
      {
        id: newTxId,
        title: "Wallet Top-up (Simulated UPI)",
        type: "cash",
        amount: `+₹${addAmount}`,
        date: "Just now",
        status: "Completed",
        positive: true,
      },
      ...prev,
    ]);

    setShowAddMoneyModal(false);
    alert(`Successfully added ₹${addAmount} to your Tourister Wallet!`);
  };

  const handleInternationalCardTransfer = (e) => {
    e.preventDefault();
    if (foreignAmount <= 0) return;

    onUpdateBalance(walletBalance + calculatedINR);
    const newTxId = `tx-card-${transactions.length + 1}`;
    setTransactions((prev) => [
      {
        id: newTxId,
        title: `Card-to-UPI Exchange (${foreignAmount} ${foreignCurrency} → ₹${calculatedINR.toLocaleString()})`,
        type: "cash",
        amount: `+₹${calculatedINR.toLocaleString()}`,
        date: "Just now",
        status: "Converted to UPI",
        positive: true,
      },
      ...prev,
    ]);

    setCardTransferSuccess(true);
    setTimeout(() => {
      setCardTransferSuccess(false);
    }, 4000);
  };

  const handleMakePayment = (e) => {
    e.preventDefault();
    if (payAmount <= 0) return;
    if (payAmount > walletBalance) {
      alert("Insufficient wallet balance! Please top-up via card or UPI.");
      return;
    }

    onUpdateBalance(walletBalance - Number(payAmount));
    const newTxId = `tx-pay-${transactions.length + 1}`;
    setTransactions((prev) => [
      {
        id: newTxId,
        title: `Payment to ${payRecipient}`,
        type: "cash",
        amount: `-₹${payAmount}`,
        date: "Just now",
        status: "Completed",
        positive: false,
      },
      ...prev,
    ]);

    setShowPayModal(false);
    alert(`Payment of ₹${payAmount} to ${payRecipient} completed!`);
  };

  const handleRedeemReward = (reward) => {
    if (userPoints < reward.costPoints) {
      alert(
        `Insufficient T-Points! You need ${reward.costPoints} T-Points to redeem this reward. Visit more Hidden Gems to earn points!`
      );
      return;
    }

    onUpdatePoints(userPoints - reward.costPoints);
    const newTxId = `tx-reward-${transactions.length + 1}`;
    setTransactions((prev) => [
      {
        id: newTxId,
        title: `Redeemed: ${reward.title}`,
        type: "points",
        amount: `-${reward.costPoints} T-Points`,
        date: "Just now",
        status: "Redeemed",
        positive: false,
      },
      ...prev,
    ]);

    alert(
      `🎉 Congratulations! You have successfully redeemed "${reward.title}". Your pass voucher code is TOURISTER-LOUNGE-VIP.`
    );
  };

  const touristUpiId = `${username.toLowerCase().replace(/\s+/g, "")}@tourister`;

  return (
    <main className="tourister-wallet-page">
      {/* NAVBAR */}
      <header className="wallet-navbar">
        <button className="wallet-back-btn" onClick={onBack}>
          ← Dashboard
        </button>
        <div className="wallet-nav-title">TOURISTER WALLET & T-POINTS</div>
        <div className="wallet-user-tag">{username}</div>
      </header>

      <div className="wallet-content-wrap">
        {/* TOP CARDS GRID */}
        <section className="wallet-hero-grid">
          {/* CASH BALANCE CARD */}
          <motion.div
            className="balance-card cash-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="balance-top">
              <div className="card-type-label">
                <FaWallet /> SIMULATED WALLET BALANCE
              </div>
              <span className="live-status-pill">Active UPI Ready</span>
            </div>

            <div className="balance-val">₹{walletBalance.toLocaleString()}</div>
            <p className="balance-hint">
              Personal UPI ID: <strong>{touristUpiId}</strong>. Pay at any Indian merchant or artisan QR!
            </p>

            <div className="balance-actions">
              <button
                className="add-funds-btn"
                onClick={() => setShowAddMoneyModal(true)}
              >
                <FaPlus /> Add Funds (UPI)
              </button>
              <button
                className="card-bridge-btn"
                onClick={() => setActiveTab("card-to-upi")}
              >
                <FaCreditCard /> Foreign Card to UPI
              </button>
              <button
                className="pay-scan-btn"
                onClick={() => setShowPayModal(true)}
              >
                <FaQrcode /> Scan & Pay
              </button>
            </div>
          </motion.div>

          {/* T-POINTS CARD */}
          <motion.div
            className="balance-card points-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="balance-top">
              <div className="card-type-label points-label">
                <FaAward /> T-POINTS REWARD VAULT
              </div>
              <span className="unfakeable-pill">Anti-Fake GPS Verified</span>
            </div>

            <div className="balance-val points-val">{userPoints} <span>T-Points</span></div>
            <p className="balance-hint">
              Earned exclusively by scanning verified on-site Hidden Gem check-in QR codes.
            </p>

            <div className="points-tier-status">
              <span>Next Tier: <strong>{userPoints >= 500 ? "Legend Tourister" : "Gold Pioneer"}</strong></span>
              <div className="tier-progress-track">
                <div
                  className="tier-progress-fill"
                  style={{ width: `${Math.min(100, (userPoints / 500) * 100)}%` }}
                />
              </div>
            </div>
          </motion.div>
        </section>

        {/* NAVIGATION TABS */}
        <div className="wallet-tabs-bar">
          <button
            className={activeTab === "wallet" ? "tab-btn active" : "tab-btn"}
            onClick={() => setActiveTab("wallet")}
          >
            <FaWallet /> Overview & Quick Pay
          </button>
          <button
            className={activeTab === "card-to-upi" ? "tab-btn active" : "tab-btn"}
            onClick={() => setActiveTab("card-to-upi")}
          >
            <FaGlobeAmericas /> Foreigner Card-to-UPI Bridge
          </button>
          <button
            className={activeTab === "rewards" ? "tab-btn active" : "tab-btn"}
            onClick={() => setActiveTab("rewards")}
          >
            <FaGift /> T-Points VIP Lounge & Perks ({initialRewards.length})
          </button>
          <button
            className={activeTab === "history" ? "tab-btn active" : "tab-btn"}
            onClick={() => setActiveTab("history")}
          >
            <FaHistory /> Transaction History ({transactions.length})
          </button>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === "wallet" && (
          <section className="wallet-overview-section">
            <div className="wallet-banner-row">
              <div className="wallet-promo-card">
                <img
                  src={touristerWalletImg}
                  alt="Tourister Wallet"
                  className="wallet-hero-img"
                />
                <div className="promo-details">
                  <h3>Why use Tourister Wallet?</h3>
                  <ul>
                    <li><strong>International Card-to-UPI Bridge:</strong> Foreigners without an Indian bank account can enter international cards to pay anywhere via UPI.</li>
                    <li><strong>T-Points Lounge Access:</strong> Redeem verified T-Points for VIP Airport and Railway Station Lounges.</li>
                    <li><strong>Zero Transaction Fees:</strong> 100% of payments go directly to local artisan craftsmen.</li>
                    <li><strong>Built-in Scam Guard:</strong> Payments to reported fraud merchants are automatically blocked.</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* TAB 2: INTERNATIONAL CARD-TO-UPI BRIDGE */}
        {activeTab === "card-to-upi" && (
          <section className="card-to-upi-section">
            <div className="card-bridge-grid">
              {/* Form Col */}
              <div className="card-form-card">
                <div className="bridge-badge">
                  <FaGlobeAmericas /> INTERNATIONAL TOURIST PAYMENT GATEWAY
                </div>
                <h2>Convert International Card to UPI Balance</h2>
                <p>
                  No Indian bank account needed. Enter any international credit/debit card (Visa, Mastercard, Amex), convert currency to INR, and use your Tourister UPI QR to scan and pay at street shops, cafes, and artisan markets in India.
                </p>

                {cardTransferSuccess && (
                  <div className="card-success-alert">
                    <FaCheckCircle /> Successfully converted {foreignAmount} {foreignCurrency} into <strong>₹{calculatedINR.toLocaleString()} INR</strong> and credited to your Tourister UPI Wallet!
                  </div>
                )}

                <form onSubmit={handleInternationalCardTransfer}>
                  <div className="form-row-2">
                    <div className="input-box">
                      <label>SELECT HOME CURRENCY</label>
                      <select
                        value={foreignCurrency}
                        onChange={(e) => setForeignCurrency(e.target.value)}
                      >
                        <option value="USD">USD ($ - US Dollar)</option>
                        <option value="EUR">EUR (€ - Euro)</option>
                        <option value="GBP">GBP (£ - British Pound)</option>
                        <option value="AUD">AUD ($ - Australian Dollar)</option>
                        <option value="SGD">SGD ($ - Singapore Dollar)</option>
                        <option value="CAD">CAD ($ - Canadian Dollar)</option>
                      </select>
                    </div>

                    <div className="input-box">
                      <label>AMOUNT IN {foreignCurrency}</label>
                      <input
                        type="number"
                        min="5"
                        value={foreignAmount}
                        onChange={(e) => setForeignAmount(Number(e.target.value))}
                        required
                      />
                    </div>
                  </div>

                  <div className="exchange-preview-box">
                    <span>Live Exchange Conversion (1 {foreignCurrency} = ₹{exchangeRates[foreignCurrency]}):</span>
                    <strong>You Receive: ₹{calculatedINR.toLocaleString()} INR in Tourister Wallet</strong>
                  </div>

                  <div className="input-box">
                    <label>INTERNATIONAL CARD NUMBER</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-row-3">
                    <div className="input-box">
                      <label>CARDHOLDER NAME</label>
                      <input
                        type="text"
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value)}
                        required
                      />
                    </div>
                    <div className="input-box">
                      <label>EXPIRY</label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        required
                      />
                    </div>
                    <div className="input-box">
                      <label>CVV</label>
                      <input
                        type="password"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="input-box">
                    <label>BILLING COUNTRY</label>
                    <input
                      type="text"
                      value={billingCountry}
                      onChange={(e) => setBillingCountry(e.target.value)}
                      required
                    />
                  </div>

                  <button type="submit" className="convert-upi-btn">
                    Convert & Add ₹{calculatedINR.toLocaleString()} to Tourister UPI →
                  </button>
                </form>
              </div>

              {/* Digital UPI QR Preview */}
              <div className="digital-upi-card">
                <h3>Your Active Tourister UPI ID</h3>
                <p>Present this QR code or provide your UPI ID to receive payments or scan to pay in India.</p>

                <div className="upi-qr-display-box">
                  <svg viewBox="0 0 160 160" width="160" height="160">
                    <rect width="160" height="160" fill="#ffffff" rx="10" />
                    <rect x="15" y="15" width="35" height="35" fill="#1e1b4b" rx="4" />
                    <rect x="22" y="22" width="21" height="21" fill="#ffffff" rx="2" />
                    <rect x="27" y="27" width="11" height="11" fill="#6366f1" />

                    <rect x="110" y="15" width="35" height="35" fill="#1e1b4b" rx="4" />
                    <rect x="117" y="22" width="21" height="21" fill="#ffffff" rx="2" />
                    <rect x="122" y="27" width="11" height="11" fill="#6366f1" />

                    <rect x="15" y="110" width="35" height="35" fill="#1e1b4b" rx="4" />
                    <rect x="22" y="117" width="21" height="21" fill="#ffffff" rx="2" />
                    <rect x="27" y="122" width="11" height="11" fill="#6366f1" />

                    <circle cx="65" cy="25" r="4" fill="#1e1b4b" />
                    <circle cx="80" cy="25" r="4" fill="#6366f1" />
                    <circle cx="95" cy="25" r="4" fill="#1e1b4b" />
                    <circle cx="65" cy="40" r="4" fill="#1e1b4b" />
                    <circle cx="80" cy="55" r="4" fill="#ec4899" />
                    <circle cx="95" cy="40" r="4" fill="#1e1b4b" />

                    <rect x="55" y="70" width="50" height="20" fill="#6366f1" rx="4" />
                    <text x="80" y="84" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">
                      UPI
                    </text>

                    <circle cx="25" cy="75" r="4" fill="#1e1b4b" />
                    <circle cx="40" cy="85" r="4" fill="#6366f1" />
                    <circle cx="120" cy="75" r="4" fill="#1e1b4b" />
                    <circle cx="135" cy="85" r="4" fill="#ec4899" />

                    <circle cx="65" cy="115" r="4" fill="#1e1b4b" />
                    <circle cx="80" cy="130" r="4" fill="#6366f1" />
                    <circle cx="95" cy="115" r="4" fill="#1e1b4b" />
                    <circle cx="115" cy="130" r="4" fill="#1e1b4b" />
                    <circle cx="135" cy="120" r="4" fill="#1e1b4b" />
                  </svg>
                </div>

                <div className="upi-id-badge">
                  <span>TOURISTER UPI VIRTUAL ID:</span>
                  <strong>{touristUpiId}</strong>
                </div>

                <div className="card-linked-info">
                  <span>Linked Card:</span>
                  <strong>{cardNumber} ({billingCountry})</strong>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* TAB 3: REWARDS STORE (WITH VIP PREMIUM LOUNGES ACCESS) */}
        {activeTab === "rewards" && (
          <section className="rewards-store-section">
            <div className="section-title-wrap">
              <h2>Redeem T-Points For VIP Lounges & Travel Perks</h2>
              <p>Use your non-fakeable T-Points earned from visiting verified Hidden Gems for airport/railway lounges and discounts.</p>
            </div>

            <div className="rewards-grid">
              {initialRewards.map((reward) => {
                const canAfford = userPoints >= reward.costPoints;
                return (
                  <motion.div
                    key={reward.id}
                    className={`reward-card ${reward.category === "VIP Lounge Access" ? "lounge-highlight-card" : ""}`}
                    whileHover={{ y: -5 }}
                  >
                    <div className="reward-icon-header">
                      <span className="reward-emoji">{reward.icon}</span>
                      <span className="reward-cost">
                        <FaAward /> {reward.costPoints} T-Points
                      </span>
                    </div>

                    <h3>{reward.title}</h3>
                    <p>{reward.desc}</p>

                    <div className="reward-card-bottom">
                      <span className="reward-category-tag">
                        <FaTag /> {reward.category}
                      </span>
                      <button
                        className={`redeem-btn ${canAfford ? "active" : "locked"}`}
                        onClick={() => handleRedeemReward(reward)}
                      >
                        {canAfford ? "Redeem Pass →" : "Earn More Points"}
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </section>
        )}

        {/* TAB 4: TRANSACTION HISTORY */}
        {activeTab === "history" && (
          <section className="history-section">
            <div className="history-card">
              <h3>Recent Wallet & Points Activity</h3>
              <div className="tx-list">
                {transactions.map((tx) => (
                  <div key={tx.id} className="tx-item">
                    <div className="tx-icon-area">
                      {tx.positive ? (
                        <FaArrowDown className="tx-icon green" />
                      ) : (
                        <FaArrowUp className="tx-icon orange" />
                      )}
                    </div>

                    <div className="tx-info">
                      <strong>{tx.title}</strong>
                      <span>{tx.date} · {tx.status}</span>
                    </div>

                    <div className={`tx-amount ${tx.positive ? "pos" : "neg"}`}>
                      {tx.amount}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>

      {/* ADD MONEY MODAL */}
      <AnimatePresence>
        {showAddMoneyModal && (
          <div
            className="wallet-modal-backdrop"
            onClick={() => setShowAddMoneyModal(false)}
          >
            <motion.div
              className="wallet-modal-card"
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <button
                className="modal-close"
                onClick={() => setShowAddMoneyModal(false)}
              >
                <FaTimes />
              </button>

              <h2>Add Funds (Simulated UPI)</h2>
              <p>Top up your Tourister travel wallet for seamless trip payments.</p>

              <form onSubmit={handleAddFunds}>
                <div className="quick-amounts">
                  {[500, 1000, 2500, 5000].map((amt) => (
                    <button
                      type="button"
                      key={amt}
                      className={addAmount === amt ? "quick-amt active" : "quick-amt"}
                      onClick={() => setAddAmount(amt)}
                    >
                      +₹{amt}
                    </button>
                  ))}
                </div>

                <div className="input-box">
                  <label>ENTER CUSTOM AMOUNT (₹)</label>
                  <input
                    type="number"
                    min="100"
                    step="100"
                    value={addAmount}
                    onChange={(e) => setAddAmount(Number(e.target.value))}
                    required
                  />
                </div>

                <button type="submit" className="confirm-btn">
                  Confirm Top-Up (₹{addAmount}) →
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SCAN & PAY MODAL */}
      <AnimatePresence>
        {showPayModal && (
          <div
            className="wallet-modal-backdrop"
            onClick={() => setShowPayModal(false)}
          >
            <motion.div
              className="wallet-modal-card"
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <button
                className="modal-close"
                onClick={() => setShowPayModal(false)}
              >
                <FaTimes />
              </button>

              <h2>Scan & Pay Simulation</h2>
              <p>Pay local artisans, eco-guides, or transport instantly.</p>

              <form onSubmit={handleMakePayment}>
                <div className="input-box">
                  <label>MERCHANT / ARTISAN NAME</label>
                  <input
                    type="text"
                    value={payRecipient}
                    onChange={(e) => setPayRecipient(e.target.value)}
                    required
                  />
                </div>

                <div className="input-box">
                  <label>PAYMENT AMOUNT (₹)</label>
                  <input
                    type="number"
                    min="10"
                    value={payAmount}
                    onChange={(e) => setPayAmount(Number(e.target.value))}
                    required
                  />
                </div>

                <div className="wallet-curr-bal">
                  Available Balance: <strong>₹{walletBalance}</strong>
                </div>

                <button type="submit" className="confirm-btn">
                  Pay ₹{payAmount} Securely →
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}

export default TouristerWallet;
