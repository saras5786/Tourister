// Community travel posts, live scam alerts, and AI authenticity verification logs

export const initialCommunityPosts = [
  {
    id: "post-araku-net",
    author: "Ravi Teja",
    avatar: "RT",
    authorTier: "Silver Voyager",
    destination: "Visakhapatnam",
    category: "Scam Alert",
    categoryIcon: "⚠️",
    title: "Zero Mobile Network & UPI Failure near Borra Caves & Katiki - Carry Cash!",
    content:
      "Heads up travelers heading to Araku! As soon as you enter the ghats near Tyda and Borra Caves, Airtel/Jio network completely drops. All tea stalls, entry ticket counters, and auto drivers refuse UPI because network is dead. Make sure you withdraw ₹2,000 - ₹3,000 in cash at Vizag or S.Kota before starting.",
    location: "Borra Caves & Katiki Waterfalls, Araku",
    timestamp: "1 hour ago",
    upvotes: 215,
    commentsCount: 47,
    aiVerification: {
      status: "Verified Critical Tip",
      credibilityScore: 99,
      aiAnalysis: "Confirmed with telecom cell tower coverage maps in Eastern Ghats.",
      riskLevel: "Essential Advisory",
    },
  },
  {
    id: "post-araku-veg",
    author: "Sneha Agrawal",
    avatar: "SA",
    authorTier: "Gold Explorer",
    destination: "Visakhapatnam",
    category: "Travel Hack",
    categoryIcon: "💡",
    title: "Can't Find Pure Veg / Jain Food on Araku Ghat Road - Helpful Guide",
    content:
      "If you are strictly vegetarian, finding clean food along the ghat road is very difficult as 90% of dhabas only cook non-veg bamboo chicken in shared utensils. The only reliable pure veg options are APTDC Haritha Resort Restaurant in Araku and Annapurna Bhavan near the tribal museum. Or pack breakfast from Vizag city!",
    location: "Araku Valley Main Road",
    timestamp: "3 hours ago",
    upvotes: 184,
    commentsCount: 32,
    aiVerification: {
      status: "Verified Food Guide",
      credibilityScore: 98,
      aiAnalysis: "Cross-checked with regional restaurant registries.",
      riskLevel: "Safe & Helpful",
    },
  },
  {
    id: "post-araku-bamboo",
    author: "K. Venkatesh",
    avatar: "KV",
    authorTier: "Bronze Explorer",
    destination: "Visakhapatnam",
    category: "Scam Alert",
    categoryIcon: "🚨",
    title: "Pitty Scam: Overpriced Bamboo Chicken near Chaparai Waterfalls",
    content:
      "Roadside stalls near Chaparai claim '1kg bamboo chicken' for ₹600, but in reality they stuff mostly bones and barely 300g meat inside the bamboo stalk. Ask them to weigh raw pieces in front of you or eat at licensed tribal cooperatives in Araku town.",
    location: "Chaparai Cascade Rapids, Araku",
    timestamp: "5 hours ago",
    upvotes: 129,
    commentsCount: 22,
    aiVerification: {
      status: "Verified Warning",
      credibilityScore: 96,
      aiAnalysis: "Multiple tourist complaint logs validated.",
      riskLevel: "Moderate Caution",
    },
  },
  {
    id: "post-nepal-flood",
    author: "Siddhartha Thapa",
    avatar: "ST",
    authorTier: "Legend Tourister",
    destination: "Kathmandu",
    category: "Scam Alert",
    categoryIcon: "🚨",
    title: "BREAKING: Heavy Monsoon Floods & Landslide on Prithvi Highway to Pokhara",
    content:
      "Heavy monsoon rains have caused landslides near Mugling on the main Kathmandu-Pokhara highway. Road travel is taking 14+ hours with heavy blockades. We strongly advise taking a 25-minute domestic flight (Buddha Air / Yeti Airlines) instead of tourist buses until monsoon recedes.",
    location: "Prithvi Highway (Kathmandu - Pokhara Route), Nepal",
    timestamp: "2 hours ago",
    upvotes: 310,
    commentsCount: 64,
    aiVerification: {
      status: "Verified Emergency Alert",
      credibilityScore: 100,
      aiAnalysis: "Confirmed with Nepal Department of Hydrology & Meteorology flood alerts.",
      riskLevel: "High Caution",
    },
  },
  {
    id: "post-nepal-scam",
    author: "Arjun Chettri",
    avatar: "AC",
    authorTier: "Gold Explorer",
    destination: "Kathmandu",
    category: "Scam Alert",
    categoryIcon: "⚠️",
    title: "Pashupatinath & Thamel Fake Rudraksha / Gemstone & Taxi Surcharge Alert",
    content:
      "Beware of self-proclaimed 'holy sadhus' and touts outside Pashupatinath temple selling fake plastic-coated Rudrakshas and counterfeit singing bowls claiming they are 200 years old. Also, at Tribhuvan Airport (KTM), non-metered taxis quote 2000 NPR for a 500 NPR ride. Use the official prepaid counter or Pathao app.",
    location: "Pashupatinath Temple & Thamel Quarter, Kathmandu",
    timestamp: "3 hours ago",
    upvotes: 245,
    commentsCount: 38,
    aiVerification: {
      status: "Verified Scam Warning",
      credibilityScore: 98,
      aiAnalysis: "Matches Nepal Tourism Board consumer grievance records.",
      riskLevel: "High Caution",
    },
  },
  {
    id: "post-kkd-boat",
    author: "M. Satish Kumar",
    avatar: "SK",
    authorTier: "Silver Voyager",
    destination: "Kakinada",
    category: "Scam Alert",
    categoryIcon: "🚨",
    title: "Coringa Mangrove Forest: Unofficial Boat Operators Overcharging - Avoid!",
    content:
      "When you arrive at Coringa Sanctuary, private touts outside the main gate claim the forest boat ride is 'booked out' and offer private country boats for ₹1,500. Do NOT trust them. Walk directly inside to the official AP Tourism Forest Counter where standard eco-boat tickets are ₹120 per person with proper life jackets.",
    location: "Coringa Wildlife Sanctuary, Kakinada",
    timestamp: "4 hours ago",
    upvotes: 172,
    commentsCount: 26,
    aiVerification: {
      status: "Verified Critical Alert",
      credibilityScore: 99,
      aiAnalysis: "Confirmed with Andhra Pradesh Forest Department eco-tourism guidelines.",
      riskLevel: "High Caution",
    },
  },
  {
    id: "post-kkd-food",
    author: "Bhavana Varma",
    avatar: "BV",
    authorTier: "Gold Pioneer",
    destination: "Kakinada",
    category: "Travel Hack",
    categoryIcon: "💡",
    title: "The Ultimate Kakinada Food Trail: Authentic Gottam Kaja & Subbayya Gari Butta Bhojanam",
    content:
      "Don't leave Kakinada without visiting Kotaiah Sweets (original creator of crispy syrupy Gottam Kaja since 1891) and the legendary Subbayya Gari Hotel for their royal traditional 32-item vegetarian feast served in a banana leaf basket. True Andhra culinary paradise!",
    location: "Main Road, Kakinada",
    timestamp: "6 hours ago",
    upvotes: 288,
    commentsCount: 41,
    aiVerification: {
      status: "Verified Gastronomy Guide",
      credibilityScore: 100,
      aiAnalysis: "Heritage food establishment verified.",
      riskLevel: "Safe & Recommended",
    },
  },
  {
    id: "post-tpt-1",
    author: "K. Raghunath",
    avatar: "KR",
    authorTier: "Legend Tourister",
    destination: "Tirupati",
    category: "Scam Alert",
    categoryIcon: "🚨",
    title: "Beware of Fake 'VIP Protocol Darshan' Agents near Tirupati Station",
    content:
      "Agents near Platform 1 claim they can provide instant ₹300 or VIP Darshan passes for ₹2,500 cash. TTD has officially stated all genuine darshan tokens are biometric and issued only online on official TTD seva portal or at authorized SSD counters in Tirupati. Never pay touts cash!",
    location: "Tirupati Central Station & Alipiri Bus Stand",
    timestamp: "4 hours ago",
    upvotes: 198,
    commentsCount: 39,
    aiVerification: {
      status: "Verified Warning",
      credibilityScore: 99,
      aiAnalysis: "Matches TTD Vigilance & Security Advisory. High priority tourist warning.",
      riskLevel: "High Caution",
    },
  },
  {
    id: "post-dubai-1",
    author: "Hamdan Malik",
    avatar: "HM",
    authorTier: "Gold Pioneer",
    destination: "Dubai",
    category: "Travel Hack",
    categoryIcon: "💡",
    title: "How to Avoid Airport Taxi Surcharges & Burj Khalifa Waiting Lines in Dubai",
    content:
      "Don't take the direct luxury black cabs from DXB Airport which charge a 25 AED surcharge. Instead, walk 2 minutes to the Dubai Metro station directly connected to Terminal 1 & 3 and buy a Silver Nol Card. Also, book Burj Khalifa At The Top sunset slots at least 1 week in advance!",
    location: "Dubai International Airport & Downtown Dubai",
    timestamp: "Yesterday",
    upvotes: 167,
    commentsCount: 29,
    aiVerification: {
      status: "Verified Travel Hack",
      credibilityScore: 99,
      aiAnalysis: "RTA public transit guidelines verified.",
      riskLevel: "Safe & Recommended",
    },
  },
];

// Simulated AI Authenticity Evaluation function
export const evaluatePostWithAI = async (postData) => {
  await new Promise((resolve) => setTimeout(resolve, 800));

  const text = `${postData.title} ${postData.content}`.toLowerCase();
  
  let score = 95;
  let status = "Verified";
  let riskLevel = "Safe & Helpful";
  let analysis = "Content passes natural language analysis, geolocation coherence, and scam pattern checks.";

  if (postData.category === "Scam Alert" || text.includes("scam") || text.includes("fake") || text.includes("tout") || text.includes("overcharge") || text.includes("flood")) {
    score = Math.min(99, 92 + Math.floor(Math.random() * 8));
    status = "Verified Alert";
    riskLevel = "Tourist Warning";
    analysis = "AI verified against real-time travel security and weather databases.";
  } else if (postData.category === "Hidden Gem" || text.includes("artisan") || text.includes("craft") || text.includes("secret")) {
    score = 98;
    status = "Verified Gem";
    riskLevel = "Cultural Experience";
    analysis = "Artisan relevance and cultural significance cross-verified.";
  }

  return {
    status,
    credibilityScore: score,
    aiAnalysis: analysis,
    riskLevel,
  };
};

export default initialCommunityPosts;
