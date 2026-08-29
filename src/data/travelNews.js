// Real-Time Travel News, Breaking Headlines & Seasonal "When NOT to Visit" Advisories

export const travelNewsArticles = [
  {
    id: "news-nepal-floods",
    headline: "🚨 NEPAL EMERGENCY ADVISORY: Flash Floods & Landslides on Prithvi Highway",
    region: "Kathmandu & Pokhara, Nepal",
    category: "Emergency Alert",
    categoryIcon: "🚨",
    date: "August 2026",
    priority: "CRITICAL",
    badgeColor: "red",
    summary:
      "Heavy monsoon downpours have triggered severe flash floods and landslides along the Mugling-Prithvi highway connecting Kathmandu and Pokhara. Highway transit is severely disrupted.",
    details:
      "The Nepal Department of Hydrology and Meteorology has issued an orange alert for Bagmati and Gandaki provinces. Tourist buses between Kathmandu and Pokhara are facing 12-16 hour delays. All tourists are strongly advised to avoid mountain road travel and take 25-minute domestic flights (Buddha Air / Yeti Airlines) between Kathmandu (KTM) and Pokhara (PKR).",
    avoidAction: "DO NOT take highway buses or private cabs through Mugling gorge right now. Use domestic air transit.",
    safeAlternatives: "Domestic flights operational; city heritage sightseeing in Kathmandu Valley (Pashupatinath, Boudhanath) remains accessible.",
  },
  {
    id: "news-dubai-summer",
    headline: "☀️ DUBAI & UAE: Peak Summer Heat Wave Advisory (47°C - 49°C)",
    region: "Dubai & Abu Dhabi, UAE",
    category: "Seasonal Warning",
    categoryIcon: "☀️",
    date: "Summer Season",
    priority: "HIGH",
    badgeColor: "orange",
    summary:
      "Extreme desert temperatures reaching 48°C with high coastal humidity. Outdoor desert safaris and walking tours during midday are dangerous.",
    details:
      "Tourists visiting Dubai in the summer must restrict activities to air-conditioned indoor mega-attractions (Dubai Mall, Museum of the Future, Ski Dubai, Burj Khalifa Observation Deck). Outdoor Red Dune Safaris should only be done post 5:30 PM.",
    avoidAction: "DO NOT plan outdoor walking tours or open-top safari rides between 10:30 AM and 4:30 PM.",
    safeAlternatives: "Visit between November and March for pleasant 24°C winter weather.",
  },
  {
    id: "news-araku-fog",
    headline: "🌫️ ARAKU VALLEY & GHATS: Dense Winter Fog & Night Driving Risk",
    region: "Visakhapatnam & Araku, Andhra Pradesh",
    category: "Driving Advisory",
    categoryIcon: "⚠️",
    date: "Winter Season",
    priority: "MEDIUM",
    badgeColor: "yellow",
    summary:
      "Zero visibility on hairpin ghat bends due to thick cloud mist between 7:00 PM and 7:00 AM.",
    details:
      "The S.Kota-Tyda ghat road experiences zero mobile connectivity and thick mountain fog. Rental cars without high-beam fog lamps face serious hazard risks. Cell phone GPS does not work inside the valley.",
    avoidAction: "DO NOT drive on the ghat section after 6:30 PM. Complete your descent before sunset.",
    safeAlternatives: "Take the morning Vistadome scenic train (Train #18551) from Vizag Station for a panoramic, 100% safe daylight journey.",
  },
  {
    id: "news-goa-monsoon",
    headline: "🌊 GOA: Monsoon High Tide & Beach Shack Closure Advisory",
    region: "North & South Goa",
    category: "Seasonal Warning",
    categoryIcon: "🌊",
    date: "June to September",
    priority: "MEDIUM",
    badgeColor: "blue",
    summary:
      "Red flags raised across all beaches. Ocean swimming, water sports, and temporary beach shacks are closed by state tourism order.",
    details:
      "The Arabian Sea produces dangerous rip currents and high waves during the southwest monsoon. All water sports (parasailing, scuba, jet ski) are strictly halted. Beach shacks in Baga, Anjuna, and Calangute are dismantled.",
    avoidAction: "DO NOT enter the sea or attempt unauthorized water sports.",
    safeAlternatives: "Explore monsoon waterfall treks (Dudhsagar Falls) and spice plantations, or visit during peak season (November - February).",
  },
  {
    id: "news-kedarnath-monsoon",
    headline: "⛰️ HIMALAYAN CHAR DHAM: Monsoon Cloudburst & Trekking Alert",
    region: "Kedarnath, Badrinath & Uttarakhand",
    category: "Emergency Alert",
    categoryIcon: "🚨",
    date: "Monsoon Season",
    priority: "HIGH",
    badgeColor: "red",
    summary:
      "High-altitude foot treks suspended periodically due to rockfalls and swollen Mandakini river.",
    details:
      "Trek permits from Gaurikund to Kedarnath are halted during heavy rain alerts. Landslides along the Rishikesh-Badrinath National Highway (NH-58) cause sudden roadblocks.",
    avoidAction: "DO NOT attempt high altitude trekking without official SDRF weather clearance.",
    safeAlternatives: "Optimal pilgrimage window is May-June (pre-monsoon) or September-October (post-monsoon).",
  },
  {
    id: "news-kakinada-coringa",
    headline: "🌿 CORINGA MANGROVES: High Tide Marine Sanctuary Protocol",
    region: "Kakinada, Andhra Pradesh",
    category: "Marine Advisory",
    categoryIcon: "🌿",
    date: "Year Round",
    priority: "LOW",
    badgeColor: "green",
    summary:
      "Official AP Tourism motorboats operate strictly between 9:00 AM and 5:00 PM with mandatory life jackets.",
    details:
      "Private fishermen offering illegal boat rides into the open Bay of Bengal estuary are unauthorized and lack safety equipment. Always board boats from the designated forest department jetty.",
    avoidAction: "DO NOT accept rides from private unregistered boat touts at the outer gate.",
    safeAlternatives: "Use the 3.5km elevated wooden mangrove boardwalk and licensed forest department boats.",
  },
  {
    id: "news-ladakh-winter",
    headline: "❄️ LEH LADAKH: Sub-Zero Winter & Mountain Pass Closure (-25°C)",
    region: "Ladakh, Jammu & Kashmir",
    category: "Seasonal Warning",
    categoryIcon: "❄️",
    date: "November to April",
    priority: "HIGH",
    badgeColor: "purple",
    summary:
      "Manali-Leh and Srinagar-Leh highways completely closed due to 15-foot snow walls at Zojila and Rohtang passes.",
    details:
      "Temperatures plunge to -25°C with severe oxygen thinness. Pangong Lake and Nubra Valley routes require 4x4 snow chains and acclimatization stops.",
    avoidAction: "DO NOT attempt road trips to Ladakh during winter months. Only flight transit to Kushok Bakula Airport is available.",
    safeAlternatives: "Plan your road trips between June and September for open mountain passes and lush valleys.",
  },
];

// Seasonal Matrix: "Best Time to Visit" vs "When NOT to Visit"
export const seasonalGuideMatrix = [
  {
    destination: "Kathmandu & Nepal Himalayas",
    bestMonths: "October to April (Crisp Himalayan views, clear skies)",
    worstMonths: "July to September (Monsoon flash floods, road landslides)",
    riskFactor: "High (Road blocks on mountain highways)",
    recommendation: "Book domestic flights (Kathmandu to Pokhara) if traveling during monsoon.",
  },
  {
    destination: "Tirupati Balaji",
    bestMonths: "September to March (Pleasant temple breeze)",
    worstMonths: "May to June (Extreme summer heat above 41°C)",
    riskFactor: "Moderate (Long darshan queues in hot weather)",
    recommendation: "Book early morning (3:30 AM) Suprabhatam or night darshan slots.",
  },
  {
    destination: "Kakinada & Coringa Eco-Forest",
    bestMonths: "October to March (Migratory birds & pleasant sea breeze)",
    worstMonths: "May to July (Coastal humidity and pre-monsoon squalls)",
    riskFactor: "Low (Boat rides subject to tide timings)",
    recommendation: "Visit Coringa boardwalk at 9:00 AM and try authentic Gottam Kaja.",
  },
  {
    destination: "Visakhapatnam & Araku",
    bestMonths: "October to March (Misty coffee valleys & waterfall views)",
    worstMonths: "April to June (Coastal heat in Vizag city)",
    riskFactor: "Medium (Zero internet in Araku valley - carry cash)",
    recommendation: "Take the Vistadome train and avoid late-night ghat driving.",
  },
  {
    destination: "Dubai (UAE)",
    bestMonths: "November to March (Pleasant 24°C, luxury shopping festival)",
    worstMonths: "June to August (Scorching 48°C desert heat)",
    riskFactor: "High (Dehydration risk outdoors during midday)",
    recommendation: "Stick to air-conditioned mega malls and evening desert safaris.",
  },
  {
    destination: "Goa Coast",
    bestMonths: "November to February (Sunsets, water sports, vibrant shacks)",
    worstMonths: "June to September (Monsoon rough sea, swimming ban)",
    riskFactor: "Medium (All water sports closed)",
    recommendation: "Visit in winter or enjoy inland spice plantation tours.",
  },
  {
    destination: "Leh Ladakh",
    bestMonths: "June to September (All mountain passes open, emerald lakes)",
    worstMonths: "November to April (Extreme -25°C freeze, closed highways)",
    riskFactor: "Extreme (High altitude sickness & snow blockage)",
    recommendation: "Acclimatize 48 hours in Leh city before climbing high passes.",
  },
  {
    destination: "Varanasi (Kashi)",
    bestMonths: "October to March (Pleasant Ganga Aarti & temple walks)",
    worstMonths: "May to June (Heatwave) & August (Ganga river flood levels)",
    riskFactor: "Moderate (Ghat steps submerge during peak monsoon)",
    recommendation: "Attend 6:00 PM Dashashwamedh Ghat Aarti and avoid station touts.",
  },
];

export default travelNewsArticles;
