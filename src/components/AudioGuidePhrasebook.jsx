import { useState } from "react";
import { FaVolumeUp, FaLanguage, FaHeadphones, FaPlay } from "react-icons/fa";
import "./AudioGuidePhrasebook.css";

const phrasesData = {
  Telugu: [
    { en: "Hello / Greetings", local: "Namaskaram (నమస్కారం)", usage: "Respectful greeting to elders & shopkeepers" },
    { en: "What is the price of this craft?", local: "Deeni vela entha? (దీని వెల ఎంత?)", usage: "Asking artisan for genuine price" },
    { en: "Is this authentic handmade craft?", local: "Idhi chetho chesina craft aa? (ఇది చేత్తో చేసిన క్రాఫ్ట్ ఆ?)", usage: "Verifying GI-tagged handmade quality" },
    { en: "Can you show me how it is made?", local: "Idhi ela chestaaro chupistara? (ఇది ఎలా చేస్తారో చూపిస్తారా?)", usage: "Requesting master artisan demonstration" },
    { en: "Thank you so much!", local: "Chala Dhanyavadhalu (చాలా ధన్యవాదాలు)", usage: "Expressing heartfelt gratitude" },
  ],
  Hindi: [
    { en: "Hello / Namaste", local: "Namaste / Pranam (नमस्ते)", usage: "Traditional respectful greeting" },
    { en: "What is the price of this?", local: "Iska daam kya hai? (इसका दाम क्या है?)", usage: "Inquiring price politely" },
    { en: "Can you give the authentic artisan certificate?", local: "Kya iska praman patra milega? (क्या इसका प्रमाण पत्र मिलेगा?)", usage: "Requesting GI artisan invoice" },
    { en: "Where is the heritage gate?", local: "Heritage darwaza kidhar hai? (हेरिटेज दरवाजा किधर है?)", usage: "Asking for monument landmarks" },
    { en: "Thank you!", local: "Bahut Dhanyavaad (बहुत धन्यवाद)", usage: "Saying thanks" },
  ],
  Tamil: [
    { en: "Hello / Greetings", local: "Vanakkam (வணக்கம்)", usage: "Warm greeting to locals" },
    { en: "How much does this cost?", local: "Idhu evvalavu? (இது எவ்வளவு?)", usage: "Asking price for silk or sculpture" },
    { en: "Is this pure handloom?", local: "Idhu sutha kaithari aa? (இது சுத்த கைத்தறி ஆ?)", usage: "Checking handloom authenticity" },
    { en: "Thank you very much!", local: "Mikka Nandri (மிக்க நன்றி)", usage: "Expressing thanks" },
  ],
};

function AudioGuidePhrasebook({ onBack }) {
  const [selectedLang, setSelectedLang] = useState("Telugu");
  const [playingIdx, setPlayingIdx] = useState(null);

  const handlePlaySimulatedAudio = (idx, text) => {
    setPlayingIdx(idx);
    if ("speechSynthesis" in window) {
      try {
        const utterance = new SpeechSynthesisUtterance(text.split("(")[0]);
        utterance.rate = 0.9;
        window.speechSynthesis.speak(utterance);
      } catch (e) {
        console.log("Speech synthesis error", e);
      }
    }
    setTimeout(() => {
      setPlayingIdx(null);
    }, 1800);
  };

  return (
    <main className="audio-phrasebook-page">
      <header className="phrase-navbar">
        <button className="phrase-back-btn" onClick={onBack}>
          ← Dashboard
        </button>
        <div className="phrase-nav-title">
          <FaHeadphones /> LOCAL ARTISAN AUDIO PHRASEBOOK
        </div>
        <div className="phrase-status-pill">
          <FaLanguage /> 4 Regional Languages
        </div>
      </header>

      <div className="phrase-container">
        <section className="phrase-hero">
          <div className="phrase-badge">
            <FaLanguage /> BREAK LANGUAGE BARRIERS WITH ARTISANS
          </div>
          <h1>
            Speak with Local <span>Master Craftsmen</span>
          </h1>
          <p>
            Connect directly with rural artisans, weavers, and heritage guides in their native language. Listen to crystal-clear pronunciation audio snippets.
          </p>

          <div className="lang-selector-tabs">
            {Object.keys(phrasesData).map((lang) => (
              <button
                key={lang}
                className={selectedLang === lang ? "lang-btn active" : "lang-btn"}
                onClick={() => setSelectedLang(lang)}
              >
                {lang}
              </button>
            ))}
          </div>
        </section>

        <section className="phrases-grid-section">
          <div className="phrases-card-list">
            {phrasesData[selectedLang].map((item, idx) => (
              <div key={idx} className="phrase-card">
                <div className="phrase-text-col">
                  <span className="phrase-en">{item.en}</span>
                  <strong className="phrase-local">{item.local}</strong>
                  <p className="phrase-usage">{item.usage}</p>
                </div>

                <button
                  className={`audio-play-btn ${playingIdx === idx ? "playing" : ""}`}
                  onClick={() => handlePlaySimulatedAudio(idx, item.local)}
                >
                  {playingIdx === idx ? (
                    <>
                      <FaVolumeUp className="pulse" /> Playing Audio...
                    </>
                  ) : (
                    <>
                      <FaPlay /> Listen Audio
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

export default AudioGuidePhrasebook;
