import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image, PageBreak, KeepTogether, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super(NumberedCanvas, self).showPage()
        super(NumberedCanvas, self).save()

    def draw_page_decorations(self, page_count):
        if self._pageNumber == 1:
            return  # Clean first page header
        
        self.saveState()
        self.setFont("Helvetica", 8.5)
        self.setFillColor(colors.HexColor("#64748b"))
        
        # Header
        self.drawString(54, 11 * inch - 36, "Tourister Project Report — Problem Analysis, Features & Capabilities")
        self.setStrokeColor(colors.HexColor("#e2e8f0"))
        self.setLineWidth(0.75)
        self.line(54, 11 * inch - 42, 8.5 * inch - 54, 11 * inch - 42)
        
        # Footer
        self.line(54, 48, 8.5 * inch - 54, 48)
        self.drawString(54, 34, "Tourister — AI-Powered Smart Tourism Operating System")
        self.drawRightString(8.5 * inch - 54, 34, f"Page {self._pageNumber} of {page_count}")
        self.restoreState()


def build_pdf(filename="Tourister_Project_Documentation.pdf"):
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54,
    )

    styles = getSampleStyleSheet()

    # Color Palette
    PRIMARY = colors.HexColor("#0f172a")     # Dark Navy
    SECONDARY = colors.HexColor("#1d4ed8")   # Royal Blue
    ACCENT = colors.HexColor("#0284c7")      # Sky Blue
    TEXT_DARK = colors.HexColor("#1e293b")   # Slate 800
    TEXT_MUTED = colors.HexColor("#64748b")  # Slate 500
    BG_LIGHT = colors.HexColor("#f8fafc")    # Slate 50
    CARD_BG = colors.HexColor("#f1f5f9")     # Slate 100
    BORDER_COLOR = colors.HexColor("#cbd5e1")# Slate 300
    RED_ACCENT = colors.HexColor("#be123c")  # Crimson Red

    # Custom Typography
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=PRIMARY,
    )

    h1_style = ParagraphStyle(
        'Heading1_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=15,
        leading=19,
        textColor=PRIMARY,
        spaceBefore=14,
        spaceAfter=6,
        keepWithNext=True,
    )

    h2_style = ParagraphStyle(
        'Heading2_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=SECONDARY,
        spaceBefore=10,
        spaceAfter=4,
        keepWithNext=True,
    )

    problem_title_style = ParagraphStyle(
        'ProblemTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        textColor=RED_ACCENT,
        spaceBefore=8,
        spaceAfter=3,
        keepWithNext=True,
    )

    feature_title_style = ParagraphStyle(
        'FeatureTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11.5,
        leading=15.5,
        textColor=SECONDARY,
        spaceBefore=10,
        spaceAfter=3,
        keepWithNext=True,
    )

    body_style = ParagraphStyle(
        'Body_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=14.5,
        textColor=TEXT_DARK,
        spaceAfter=5,
    )

    bullet_style = ParagraphStyle(
        'Bullet_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=14,
        textColor=TEXT_DARK,
        leftIndent=14,
        firstLineIndent=-8,
        spaceAfter=3,
    )

    story = []

    # ==========================================
    # HEADER / COVER TITLE
    # ==========================================
    logo_path = os.path.join("src", "assets", "aditya-logo.png")
    qr_path = "tourister_qr_code.png"

    header_data = [
        [
            Paragraph("<b>🌍 Tourister</b><br/><font color='#1d4ed8' size=12><b>Comprehensive Project Report & Feature Analysis</b></font>", title_style),
            Image(logo_path, width=1.3*inch, height=0.6*inch) if os.path.exists(logo_path) else Paragraph("", body_style)
        ]
    ]
    t_header = Table(header_data, colWidths=[5.2*inch, 1.8*inch])
    t_header.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('ALIGN', (1,0), (1,0), 'RIGHT'),
    ]))
    story.append(t_header)
    story.append(Spacer(1, 6))
    story.append(HRFlowable(width="100%", thickness=2, color=SECONDARY, spaceAfter=10))

    # Project Summary Meta Box
    meta_data = [
        [
            Paragraph("<b>Project Name:</b> Tourister (AI Travel Platform)", body_style),
            Paragraph("<b>Author / Developer:</b> Saraschandra", body_style),
        ],
        [
            Paragraph("<b>Live Website:</b> <font color='#1d4ed8'><u>https://saras5786.github.io/Tourister/</u></font>", body_style),
            Paragraph("<b>GitHub:</b> <font color='#1d4ed8'><u>https://github.com/saras5786/tourister</u></font>", body_style),
        ],
    ]
    t_meta = Table(meta_data, colWidths=[3.5*inch, 3.5*inch])
    t_meta.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), BG_LIGHT),
        ('BOX', (0,0), (-1,-1), 1, BORDER_COLOR),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#e2e8f0")),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(t_meta)
    story.append(Spacer(1, 10))

    # ==========================================
    # 1. PROJECT OVERVIEW
    # ==========================================
    story.append(Paragraph("1. Project Overview & Mission", h1_style))
    story.append(Paragraph(
        "<b>Tourister</b> is an all-in-one smart travel and tourism web application designed to act as a complete digital travel companion. It assists users through every stage of their journey — from <b>initial trip planning and budget calculation</b>, to <b>live transit navigation, language translation, and emergency safety</b>, all the way to <b>post-trip community sharing and rewards</b>. Powered by conversational Artificial Intelligence (GPT AI) and interactive web technologies, Tourister simplifies travel by combining multiple essential travel tools into a single, intuitive platform.",
        body_style
    ))

    story.append(Spacer(1, 8))

    # ==========================================
    # 2. PROBLEMS SOLVED (DETAILED)
    # ==========================================
    story.append(Paragraph("2. Real-World Problems Solved by Tourister", h1_style))
    story.append(Paragraph(
        "Modern travelers face numerous challenges before and during their trips. Tourister was engineered specifically to solve each of these key pain points:",
        body_style
    ))

    problems = [
        (
            "Problem 1: App Fragmentation & Information Overload",
            "Travelers usually have to switch between 6 to 10 different apps — one for flights, one for trains, another for blogs/itineraries, a separate translation app, weather apps, emergency numbers, and travel forums. This leads to confusion, battery drain, and wasted time.",
            "Tourister consolidates all these disconnected utilities into ONE single unified platform. From AI-driven itinerary planning to audio phrasebooks, route calculations, and SOS emergency dialers, everything is accessible in one place."
        ),
        (
            "Problem 2: Rigid, Generic, and Impersonal Itineraries",
            "Traditional tour packages and online travel blogs provide generic, one-size-fits-all itineraries. They do not account for a traveler's personal budget, trip duration, whether they are traveling solo or with family, or real-time constraints.",
            "The Tourister AI Assistant generates fully personalized, structured travel blueprints in seconds. It tailors the plan to the user's specific starting city, budget, pace, interests, and season, and allows dynamic adjustments through conversational chat."
        ),
        (
            "Problem 3: Safety Uncertainties & Emergency Vulnerability in Unfamiliar Places",
            "When traveling to new cities or remote locations, tourists often do not know local emergency phone numbers, medical helpline contacts, police stations, or women's safety helplines. In an emergency, every second counts.",
            "The Tourist Safety & SOS Center provides instant, one-touch direct dialers for national emergency services (Police 112, Ambulance 108, Tourist Helpline 1363, Women Helpline 1091), along with international embassy directories and situational safety protocols."
        ),
        (
            "Problem 4: Language & Cultural Communication Barriers",
            "In regional or international destinations, tourists struggle to communicate with local taxi drivers, shopkeepers, and restaurant staff. This leads to getting overcharged, getting lost, or failing to communicate critical medical needs.",
            "The Audio Guide & Multilingual Phrasebook offers categorized phrases (Greetings, Bargaining, Food, Transit, Medical Help) with real-time audio voice pronunciation so travelers can speak and understand native phrases effortlessly."
        ),
        (
            "Problem 5: Overtourism vs. Missed Local Hidden Gems",
            "Mainstream tourist spots are overcrowded, expensive, and commercialized, while incredible cultural landmarks and scenic offbeat destinations remain completely undiscovered by travelers.",
            "The Hidden Gems Portal curates exclusive offbeat spots (like Gandikota, Majuli Island, Dhanushkodi) with exact geo-coordinates, best visiting seasons, difficulty levels, and photo guides, encouraging sustainable and authentic exploration."
        ),
        (
            "Problem 6: Pre-Flight Confusion & Airport Transit Stress",
            "Navigating airport terminal rules, DigiYatra biometric requirements, baggage weight limits, and boarding passes causes significant anxiety for air travelers.",
            "The Fast-Track Airport Pass provides an interactive pre-departure readiness checklist (verifying DigiYatra, IDs, baggage limits, and check-in) and generates a simulated digital boarding pass for smooth terminal navigation."
        ),
        (
            "Problem 7: Unreliable Travel Reviews & Lack of Rewarded Community Sharing",
            "Many travel blogs are sponsored or outdated, and real travelers have no incentive to share authentic local advice or warning tips.",
            "The Community Feed allows travelers to post verified experiences and stories. It includes automated AI content moderation to check for authenticity, and integrates with the Tourister Wallet to reward active contributors with redeemable points."
        ),
    ]

    for p_title, p_desc, p_sol in problems:
        p_table_data = [
            [Paragraph(f"<b>❌ {p_title}</b>", problem_title_style)],
            [Paragraph(f"<b>The Challenge:</b> {p_desc}", body_style)],
            [Paragraph(f"<b><font color='#1d4ed8'>💡 How Tourister Solves It:</font></b> {p_sol}", body_style)],
        ]
        t_prob = Table(p_table_data, colWidths=[7.0*inch])
        t_prob.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), BG_LIGHT),
            ('BOX', (0,0), (-1,-1), 1, BORDER_COLOR),
            ('TOPPADDING', (0,0), (-1,-1), 4),
            ('BOTTOMPADDING', (0,0), (-1,-1), 4),
            ('LEFTPADDING', (0,0), (-1,-1), 8),
            ('RIGHTPADDING', (0,0), (-1,-1), 8),
        ]))
        story.append(t_prob)
        story.append(Spacer(1, 5))

    story.append(Spacer(1, 8))

    # ==========================================
    # 3. COMPREHENSIVE FEATURE BREAKDOWN
    # ==========================================
    story.append(Paragraph("3. Comprehensive Feature Breakdown", h1_style))

    features = [
        (
            "3.1 🤖 Tourister AI Assistant (Intelligent Travel Engine)",
            "The heart of Tourister is a conversational AI travel advisor powered by GPT-5.6 with real-time web capabilities:",
            [
                "<b>Structured 8-Part Travel Blueprint:</b> Every itinerary automatically generates: (1) Trip Summary & Theme, (2) Best Time to Visit, (3) Day-by-Day Detailed Schedule, (4) Estimated Budget Breakdown, (5) Must-Try Local Food, (6) Critical Safety Guidelines, (7) Secret Hidden Spots, and (8) Customized Packing Checklist.",
                "<b>Dual-Layer Resilience:</b> Includes an embedded heuristic fallback engine that ensures users always receive high-quality travel advice even during network disruptions or API quotas.",
                "<b>Conversational Interface:</b> Supports freeform user prompts, travel style adjustments, budget filters, and customized itinerary revisions in real time."
            ]
        ),
        (
            "3.2 🗺️ Multi-Modal Trip Planner & Route Calculator",
            "An intelligent route navigation engine that bridges source cities to any travel destination:",
            [
                "<b>Multi-Transport Comparison:</b> Real-time estimates for Flights (✈️), Trains (🚆), Buses (🚌), and Driving/Road Trips (🚗) with accurate duration and fare approximations.",
                "<b>Eco-Friendly Badging:</b> Highlights low-carbon transport choices with green badges to promote sustainable tourism.",
                "<b>Interactive Travel Map:</b> Visualizes destination coordinates, waypoint nodes, and geographic highlights."
            ]
        ),
        (
            "3.3 💎 Hidden Gems & Offbeat Discovery Portal",
            "Empowers explorers to discover India's and the world's most breathtaking secret spots:",
            [
                "<b>Rich Curated Spot Cards:</b> Includes detailed descriptions, best seasons, geo-coordinates, and difficulty meters.",
                "<b>Gamified Check-in & Unlock System:</b> Users can unlock secret spots and earn explorer points in their Tourister Wallet.",
                "<b>Scannable Landmark Verification:</b> Integrates QR-ready verification for on-site landmark check-ins."
            ]
        ),
        (
            "3.4 🛡️ Tourist Safety SOS & Emergency Hub",
            "A comprehensive digital shield for traveler safety and peace of mind:",
            [
                "<b>One-Touch Emergency Calling:</b> Instant direct dialers for Police (112), Ambulance (108), Tourist Police (1363), and Women Helpline (1091).",
                "<b>Embassy Directory:</b> Contact details and addresses for international consulates and embassies.",
                "<b>Emergency Checklists:</b> Actionable protocols for solo travelers, late-night transit safety, medical readiness, and scam prevention."
            ]
        ),
        (
            "3.5 🎧 Multilingual Audio Guide & Smart Phrasebook",
            "Eliminates language barriers across local and international travels:",
            [
                "<b>Real-Time Audio Voice Pronunciation:</b> Built-in Web Speech voice synthesizer pronounces phrases in authentic native accents.",
                "<b>Categorized Travel Phrases:</b> Covers Greetings & Etiquette, Directions & Transport, Bargaining & Shopping, Food Ordering, Medical Help, and Transit."
            ]
        ),
        (
            "3.6 ✈️ Fast-Track Airport Pass & Readiness",
            "Streamlines the airport experience from home to the boarding gate:",
            [
                "<b>Pre-Flight Verification Checklist:</b> Verifies DigiYatra registration, passport validity, web check-in, and cabin baggage allowances.",
                "<b>Digital Boarding Simulation:</b> Generates a dynamic, scannable digital boarding pass for easy terminal navigation."
            ]
        ),
        (
            "3.7 💼 Tourister Wallet & Gamified Rewards",
            "Incentivizes exploration and community engagement through reward points:",
            [
                "<b>Tourister Points (TP) Economy:</b> Earn points by planning itineraries, unlocking hidden gems, and contributing verified advice.",
                "<b>Redemption Hub:</b> Redeem accumulated points for travel vouchers, luggage accessories, priority airport passes, and audio guides."
            ]
        ),
        (
            "3.8 👥 Community Feed & AI-Moderated Travel Stories",
            "A trusted peer-to-peer social network for authentic travelers:",
            [
                "<b>Travel Logs & Photo Sharing:</b> Share real trip experiences, itinerary tips, and destination reviews.",
                "<b>Automated AI Quality Evaluation:</b> Scores community posts for authenticity, safety, and helpfulness before publishing."
            ]
        ),
    ]

    for f_title, f_intro, f_bullets in features:
        story.append(Paragraph(f_title, feature_title_style))
        story.append(Paragraph(f_intro, body_style))
        for b in f_bullets:
            story.append(Paragraph(f"• {b}", bullet_style))
        story.append(Spacer(1, 3))

    story.append(Spacer(1, 8))

    # ==========================================
    # 4. TARGET AUDIENCE & PRACTICAL IMPACT
    # ==========================================
    story.append(Paragraph("4. Target Audience & Practical Value", h1_style))
    
    impact_data = [
        [
            Paragraph("<b>Target Audience</b>", body_style),
            Paragraph("<b>Key Value Delivered by Tourister</b>", body_style)
        ],
        [
            Paragraph("<b>Solo & Backpacking Travelers</b>", body_style),
            Paragraph("Instant emergency SOS safety network, audio phrasebook, and budget-friendly offbeat itineraries.", body_style)
        ],
        [
            Paragraph("<b>Family & Group Vacationers</b>", body_style),
            Paragraph("Comprehensive multi-day itineraries, pre-flight airport checklists, and transparent budget estimations.", body_style)
        ],
        [
            Paragraph("<b>International Tourists</b>", body_style),
            Paragraph("Multi-language phrasebook with speech synthesis, embassy directory, and verified safety advisories.", body_style)
        ],
        [
            Paragraph("<b>Adventure & Nature Explorers</b>", body_style),
            Paragraph("Curated hidden gems with exact coordinates, difficulty ratings, and unlockable explorer badges.", body_style)
        ],
    ]
    t_impact = Table(impact_data, colWidths=[2.2*inch, 4.8*inch])
    t_impact.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), PRIMARY),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('GRID', (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, BG_LIGHT]),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(t_impact)

    story.append(Spacer(1, 10))

    # ==========================================
    # 5. PERMANENT LIVE ACCESS & QR CODE
    # ==========================================
    story.append(Paragraph("5. Permanent Live Access & Scannable QR Code", h1_style))
    
    qr_table_data = [
        [
            Image(qr_path, width=1.6*inch, height=1.6*inch) if os.path.exists(qr_path) else Paragraph("QR Code", body_style),
            Paragraph(
                "<b>📱 Scan with Smartphone Camera to Launch Live App</b><br/><br/>"
                "• <b>Permanent Live URL:</b> <font color='#1d4ed8'><u>https://saras5786.github.io/Tourister/</u></font><br/>"
                "• <b>GitHub Repository:</b> <font color='#1d4ed8'><u>https://github.com/saras5786/tourister</u></font><br/>"
                "• <b>Platform & Hosting:</b> GitHub Pages (24/7 Free Global CDN with HTTPS)<br/>"
                "• <b>Core Technologies:</b> React 19, Vite, Framer Motion, Puter.js AI Engine",
                body_style
            )
        ]
    ]
    t_qr = Table(qr_table_data, colWidths=[1.8*inch, 5.2*inch])
    t_qr.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('BACKGROUND', (0,0), (-1,-1), BG_LIGHT),
        ('BOX', (0,0), (-1,-1), 1, BORDER_COLOR),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
        ('RIGHTPADDING', (0,0), (-1,-1), 10),
    ]))
    story.append(t_qr)

    # Build Document
    doc.build(story, canvasmaker=NumberedCanvas)
    print("SUCCESS: Full Information Documentation PDF generated.")


if __name__ == "__main__":
    build_pdf()
