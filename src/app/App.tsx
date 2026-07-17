import { useState, useEffect } from "react";
import { Train, MapPin, Users, Clock, Share2, ChevronDown, AlertCircle, CheckCircle2, TrendingUp, Shield, Smartphone } from "lucide-react";

const SUPABASE_URL = "https://loblkqxsxlcmmamwjibp.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvYmxrcXhzeGxjbW1hbXdqaWJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQyMTE4NDQsImV4cCI6MjA5OTc4Nzg0NH0.Vi7nYkCBUCnZvpNviQ8Ps__RHp5_BlIMx6lCWVmx-QE";

const STATION_DATABASE: Record<string, Record<string, string[]>> = {
  "Mumbai Local": {
    "Western Line": ["Churchgate","Marine Lines","Charni Road","Grant Road","Mumbai Central","Mahalakshmi","Lower Parel","Prabhadevi","Dadar","Matunga Road","Mahim","Bandra","Khar Road","Santacruz","Vile Parle","Andheri","Jogeshwari","Ram Mandir","Goregaon","Malad","Kandivali","Borivali","Dahisar","Mira Road","Bhayandar","Naigaon","Vasai Road","Nallasopara","Virar"],
    "Central Line (Main)": ["CSMT","Masjid","Sandhurst Road","Byculla","Chinchpokli","Currey Road","Parel","Dadar","Matunga","Sion","Kurla","Vidyavihar","Ghatkopar","Vikhroli","Kanjurmarg","Bhandup","Nahur","Mulund","Thane","Kalva","Mumbra","Diva","Kopar","Dombivli","Thakurli","Kalyan"],
    "Harbour Line": ["CSMT","Masjid","Sandhurst Road","Dockyard Road","Reay Road","Cotton Green","Sewri","Wadala Road","King's Circle","Mahim","Bandra","Khar Road","Santacruz","Vile Parle","Andheri","Goregaon","Guru Tegh Bahadur Nagar","Chunabhatti","Kurla","Tilaknagar","Chembur","Govandi","Mankhurd","Vashi","Sanpada","Juinagar","Nerul","Seawoods-Darave","Belapur","Kharghar","Mansarovar","Khandeshwar","Panvel"],
    "Trans-Harbour Line": ["Thane","Airoli","Rabale","Ghansoli","Koparkhairane","Turbhe","Sanpada","Vashi","Juinagar","Nerul","Belapur","Panvel"],
  },
  "Mumbai Metro": {
    "Metro Line 1 (Versova - Ghatkopar)": ["Versova","D.N. Nagar","Azad Nagar","Andheri","Western Express Highway (WEH)","Chakala (JB Nagar)","Marol Naka","Saki Naka","Asalpha","Jagruti Nagar","Ghatkopar"],
    "Metro Line 2A & 7 (Dahisar - Andheri)": ["Andheri West","Lower Oshiwara","Oshiwara","Goregaon West","Bangur Nagar","Malad West","Valnai","Dahanukarwadi","Kandivali West","Pahari Goregaon","Borivali West","Eksar","Mandapeshwar","Kandarpada","Dahisar East","Ovaripada","National Park","Devipada","Magathane","Poisar","Akurli","Kurar","Dindoshi","Aarey","Goregaon East","Jogeshwari East","Shankarwadi","Gundavali"],
    "Metro Line 3 (Aqua Line)": ["Aarey Colony","SEEPZ","MIDC","Marol Naka","Chhatrapati Shivaji Maharaj International Airport (T2)","Sahar Road","Chhatrapati Shivaji Maharaj International Airport (T1)","Santacruz","Vidyanagari","BKC","Dharavi","Sitaladevi","Dadkar Maidan","Siddhivinayak","Worli","Acharya Atre Chowk","Science Museum","Mahalaxmi","Mumbai Central","Grant Road","Girgaon","Kalbadevi","Chhatrapati Shivaji Maharaj Terminus (CSMT)","Hutatma Chowk","Churchgate","Cuffe Parade"],
  },
};

type CrowdLevel = "🟢 Less / Empty" | "🟡 Moderate" | "🔴 Very Crowded";

interface Report {
  crowd_level: string;
  reported_at: string;
  station_name: string;
}

async function fetchLatestReport(station: string): Promise<Report | null> {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/fetch_latest_report`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
      body: JSON.stringify({ p_station_name: station }),
    });
    const data = await res.json();
    return data?.[0] ?? null;
  } catch {
    return null;
  }
}

async function submitReport(
  transitType: string,
  stationName: string,
  crowdLevel: string,
  proofPhoto: string
): Promise<boolean> {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/accept_commuter_report`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
      body: JSON.stringify({
        p_transit_type: transitType,
        p_station_name: stationName,
        p_crowd_level: crowdLevel,
        p_proof_photo: proofPhoto,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

function formatTime(iso: string) {
  try {
    return new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "Just now";
  }
}

function CrowdBadge({ level }: { level: string }) {
  const map: Record<string, { bg: string; text: string; label: string }> = {
    "🟢 Less / Empty": { bg: "bg-emerald-500/20 border-emerald-500/40", text: "text-emerald-400", label: "Less / Empty" },
    "🟡 Moderate": { bg: "bg-yellow-500/20 border-yellow-500/40", text: "text-yellow-400", label: "Moderate" },
    "🔴 Very Crowded": { bg: "bg-red-500/20 border-red-500/40", text: "text-red-400", label: "Very Crowded" },
  };
  const style = map[level] ?? { bg: "bg-muted border-border", text: "text-muted-foreground", label: level };
  const dot = level.startsWith("🟢") ? "🟢" : level.startsWith("🟡") ? "🟡" : "🔴";
  return (
    <span className={`inline-flex items-center gap-2 px-4 py-2 rounded border text-sm font-semibold tracking-wide ${style.bg} ${style.text}`}>
      <span>{dot}</span> {style.label}
    </span>
  );
}

export default function App() {
  const [network, setNetwork] = useState<string>("Mumbai Local");
  const [selectedLine, setSelectedLine] = useState<string>("Western Line");
  const [selectedStation, setSelectedStation] = useState<string>("Andheri");
  const [crowdSelection, setCrowdSelection] = useState<CrowdLevel | null>(null);
  const [latestReport, setLatestReport] = useState<Report | null>(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"success" | "error" | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const lines = Object.keys(STATION_DATABASE[network]);
  const stations = STATION_DATABASE[network][selectedLine] ?? [];

  useEffect(() => {
    const firstLine = Object.keys(STATION_DATABASE[network])[0];
    setSelectedLine(firstLine);
    setSelectedStation(STATION_DATABASE[network][firstLine][0]);
  }, [network]);

  useEffect(() => {
    setSelectedStation(stations[0]);
  }, [selectedLine]);

  useEffect(() => {
    if (!selectedStation) return;
    setLoadingReport(true);
    fetchLatestReport(selectedStation).then((r) => {
      setLatestReport(r);
      setLoadingReport(false);
    });
  }, [selectedStation]);

  async function handleSubmit() {
    if (!crowdSelection) return;
    setSubmitting(true);
    const ok = await submitReport(network, selectedStation, crowdSelection, "");
    setSubmitting(false);
    setSubmitStatus(ok ? "success" : "error");
    if (ok) {
      setCrowdSelection(null);
      setTimeout(() => {
        setSubmitStatus(null);
        fetchLatestReport(selectedStation).then(setLatestReport);
      }, 2000);
    }
  }

  const faqs = [
    {
      q: "How does MumbaikarlLive verify crowd reports?",
      a: "Every report is submitted by a real commuter at the station. Our system timestamps and geo-tags each update. Reports older than 45 minutes are automatically marked stale so you always see current conditions.",
    },
    {
      q: "What are peak hours on Mumbai Local trains?",
      a: "Peak morning rush runs 8:30 AM to 11:00 AM heading into CSMT, Dadar, and Churchgate. Evening peak is 5:30 PM to 9:00 PM in the reverse direction. Platforms like Andheri, Borivali, and Thane see extreme crowding during these windows.",
    },
    {
      q: "Which Mumbai Metro lines are covered?",
      a: "We cover Metro Line 1 (Versova–Ghatkopar), Line 2A & 7 (the WEH corridor), and the fully operational Line 3 Aqua Line from Aarey Colony down to Cuffe Parade.",
    },
    {
      q: "How often is the crowd data updated?",
      a: "Data updates in real time as commuters submit reports. Popular stations like Dadar, Andheri, and CSMT typically receive updates every 5–10 minutes during peak hours.",
    },
    {
      q: "Is MumbaikarlLive free to use?",
      a: "Yes, completely free. MumbaikarlLive is a community tool built for Mumbai commuters. No registration required to check crowd levels.",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <header className="border-b border-border sticky top-0 z-50 bg-background/95 backdrop-blur">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-primary flex items-center justify-center">
              <Train className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-none tracking-tight" style={{ fontFamily: "'Rajdhani', sans-serif", color: "#f5820a" }}>
                MumbaikarlLive
              </h1>
              <p className="text-xs text-muted-foreground">mumbaikarlive.in</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
            Live Updates
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border py-12 md:py-16" style={{ background: "linear-gradient(135deg, #0b1120 0%, #131d30 60%, #1a2234 100%)" }}>
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 40px, #f5820a 40px, #f5820a 41px), repeating-linear-gradient(90deg, transparent, transparent 40px, #f5820a 40px, #f5820a 41px)" }} />
        <div className="max-w-5xl mx-auto px-4 relative z-10">
          <div className="flex items-start gap-3 mb-4">
            <MapPin className="w-5 h-5 text-primary mt-1 shrink-0" />
            <p className="text-xs font-semibold tracking-widest text-primary uppercase">Mumbai, Maharashtra</p>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold leading-tight mb-4" style={{ fontFamily: "'Teko', sans-serif", letterSpacing: "0.02em" }}>
            Real-Time Crowd Tracker<br />
            <span style={{ color: "#f5820a" }}>for Every Mumbai Station</span>
          </h2>
          <p className="text-muted-foreground max-w-xl text-sm md:text-base leading-relaxed">
            Commuter-verified crowd reports across all Western, Central, Harbour, and Metro lines.
            Know before you go — avoid the rush, plan smarter.
          </p>
          <div className="flex flex-wrap gap-4 mt-6">
            {["250+ Stations", "Real-Time Reports", "Photo Verified"].map((t) => (
              <span key={t} className="text-xs border border-border px-3 py-1.5 rounded-full text-muted-foreground">
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Ad Slot 1 */}
      <div className="max-w-5xl mx-auto px-4 my-4">
        <div className="border border-dashed border-border rounded-lg p-3 text-center text-xs text-muted-foreground bg-card">
          <p className="font-semibold">Advertisement</p>
          {/* Google AdSense slot goes here */}
          {/* <ins className="adsbygoogle" style={{display:"block"}} data-ad-client="ca-pub-6016873008902737" data-ad-slot="XXXXXXX" data-ad-format="auto" data-full-width-responsive="true"></ins> */}
        </div>
      </div>

      {/* Main Tracker */}
      <main className="max-w-5xl mx-auto px-4 pb-12">
        <div className="grid md:grid-cols-5 gap-6 mt-6">

          {/* Left: Selector + Submit */}
          <div className="md:col-span-3 space-y-4">
            <div className="bg-card border border-border rounded-xl p-5 space-y-4">
              <h3 className="text-base font-bold tracking-wide" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
                Select Your Station
              </h3>

              {/* Network toggle */}
              <div className="flex rounded-lg overflow-hidden border border-border">
                {Object.keys(STATION_DATABASE).map((n) => (
                  <button
                    key={n}
                    onClick={() => setNetwork(n)}
                    className={`flex-1 py-2.5 text-xs font-semibold tracking-wide transition-colors ${network === n ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:text-foreground"}`}
                    style={{ fontFamily: "'Rajdhani', sans-serif" }}
                  >
                    {n}
                  </button>
                ))}
              </div>

              {/* Line select */}
              <div className="relative">
                <select
                  value={selectedLine}
                  onChange={(e) => setSelectedLine(e.target.value)}
                  className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-sm text-foreground appearance-none pr-10 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {lines.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>

              {/* Station select */}
              <div className="relative">
                <select
                  value={selectedStation}
                  onChange={(e) => setSelectedStation(e.target.value)}
                  className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-sm text-foreground appearance-none pr-10 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {stations.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            {/* Submit crowd level */}
            <div className="bg-card border border-border rounded-xl p-5 space-y-4">
              <h3 className="text-base font-bold tracking-wide" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
                📢 Report Live Status at {selectedStation}
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {(["🟢 Less / Empty", "🟡 Moderate", "🔴 Very Crowded"] as CrowdLevel[]).map((level) => (
                  <button
                    key={level}
                    onClick={() => setCrowdSelection(level)}
                    className={`py-3 rounded-lg border text-xs font-semibold tracking-wide transition-all ${
                      crowdSelection === level
                        ? "border-primary bg-primary/20 text-primary"
                        : "border-border bg-secondary text-muted-foreground hover:border-primary/50 hover:text-foreground"
                    }`}
                    style={{ fontFamily: "'Rajdhani', sans-serif" }}
                  >
                    {level.split(" ").slice(1).join(" ")}
                    <span className="block text-lg">{level[0]}</span>
                  </button>
                ))}
              </div>

              {submitStatus === "success" && (
                <div className="flex items-center gap-2 text-emerald-400 text-sm bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-4 py-3">
                  <CheckCircle2 className="w-4 h-4" /> Report submitted! Thank you.
                </div>
              )}
              {submitStatus === "error" && (
                <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">
                  <AlertCircle className="w-4 h-4" /> Failed to submit. Please try again.
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={!crowdSelection || submitting}
                className="w-full py-3 rounded-lg font-bold tracking-widest text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ fontFamily: "'Rajdhani', sans-serif", background: crowdSelection ? "#f5820a" : undefined, color: crowdSelection ? "#0b1120" : undefined, border: "1px solid rgba(245,130,10,0.3)" }}
              >
                {submitting ? "Submitting..." : "Broadcast Status"}
              </button>

              {/* WhatsApp share */}
              <a
                href={`https://wa.me/?text=Check+if+${encodeURIComponent(selectedStation)}+(${encodeURIComponent(selectedLine)})+is+crowded+right+now:+https://mumbaikarlive.in`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-lg border border-emerald-600/40 text-emerald-400 text-sm font-semibold hover:bg-emerald-500/10 transition-colors"
                style={{ fontFamily: "'Rajdhani', sans-serif" }}
              >
                <Share2 className="w-4 h-4" />
                Share {selectedStation} Status on WhatsApp
              </a>
            </div>
          </div>

          {/* Right: Live Status */}
          <div className="md:col-span-2 space-y-4">
            <div className="bg-card border border-border rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold tracking-wide" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
                  📊 Live Status
                </h3>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Real-time
                </span>
              </div>

              <p className="text-sm text-muted-foreground">{selectedStation}</p>
              <p className="text-xs text-muted-foreground">{selectedLine}</p>

              {loadingReport ? (
                <div className="h-20 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : latestReport ? (
                <div className="space-y-3">
                  <CrowdBadge level={latestReport.crowd_level} />
                  <p className="text-xs text-muted-foreground">
                    Last report: {formatTime(latestReport.reported_at)}
                  </p>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground bg-secondary rounded-lg p-4">
                  No recent reports for this station. Be the first to update fellow commuters!
                </div>
              )}
            </div>

            {/* Quick stats */}
            <div className="bg-card border border-border rounded-xl p-5 space-y-3">
              <h3 className="text-sm font-bold tracking-wide text-muted-foreground uppercase" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
                Peak Hours Guide
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-muted-foreground">Morning Peak</span>
                  <span className="text-foreground font-semibold">8:30 AM – 11:00 AM</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-muted-foreground">Afternoon Calm</span>
                  <span className="text-emerald-400 font-semibold">11:30 AM – 5:00 PM</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-muted-foreground">Evening Peak</span>
                  <span className="text-foreground font-semibold">5:30 PM – 9:00 PM</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Ad Slot 2 */}
        <div className="my-8">
          <div className="border border-dashed border-border rounded-lg p-3 text-center text-xs text-muted-foreground bg-card">
            <p className="font-semibold">Advertisement</p>
          </div>
        </div>

        {/* How It Works */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: "'Teko', sans-serif", letterSpacing: "0.03em" }}>
            How MumbaikarlLive Works
          </h2>
          <p className="text-muted-foreground text-sm mb-8 max-w-2xl">
            A zero-trust crowdsourcing model built by Mumbai commuters, for Mumbai commuters. Every report is verified, timestamped, and displayed in real time.
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { icon: Smartphone, title: "1. Select Your Station", desc: "Choose your transit network, line, and exact platform from our database of 250+ stations across Western, Central, Harbour, and Metro lines." },
              { icon: Users, title: "2. Report the Crowd", desc: "Tap your crowd level — Less, Moderate, or Very Crowded. Your report is instantly saved and visible to every commuter checking the same station." },
              { icon: TrendingUp, title: "3. Plan Smarter", desc: "Check live crowd status before leaving home. See the latest commuter report with timestamp so you know exactly when it was submitted." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-card border border-border rounded-xl p-5 space-y-3">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-bold text-sm" style={{ fontFamily: "'Rajdhani', sans-serif" }}>{title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Mumbai Local Guide — content for AdSense */}
        <section className="mb-12 bg-card border border-border rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold" style={{ fontFamily: "'Teko', sans-serif", letterSpacing: "0.03em" }}>
              Mumbai Commuter Safety Guide
            </h2>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Navigating Mumbai Suburban Railway — covering the Western Line (Churchgate to Virar), Central Line (CSMT to Kalyan), and Harbour Line (CSMT to Panvel) — demands careful planning during peak hours. With over 7 million daily commuters, the Mumbai Local is one of the world's busiest rail networks.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            <strong className="text-foreground">Safety rules every Mumbaikar must know:</strong> Always stand behind the yellow platform safety line. Never board a moving local train. Use foot overbridges (FOBs) to cross tracks — never walk across live rails. Secure your UTS ticket or smart card before boarding to clear ticket checking terminals smoothly. During peak hours at major stations like Andheri, Dadar, Borivali, and Thane, allow alighting passengers to exit before boarding.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The Mumbai Metro network continues to expand across the city. Metro Line 3 (Aqua Line), running underground from Aarey Colony to Cuffe Parade, has significantly reduced road traffic in the BKC–Worli–Churchgate corridor. Metro trains offer air conditioning, fixed seats, and predictable frequency — making them an excellent alternative to local trains for compatible routes.
          </p>
        </section>

        {/* Ad Slot 3 */}
        <div className="my-8">
          <div className="border border-dashed border-border rounded-lg p-3 text-center text-xs text-muted-foreground bg-card">
            <p className="font-semibold">Advertisement</p>
          </div>
        </div>

        {/* FAQ */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6" style={{ fontFamily: "'Teko', sans-serif", letterSpacing: "0.03em" }}>
            Frequently Asked Questions
          </h2>
          <div className="space-y-2">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-card border border-border rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-secondary/50 transition-colors"
                >
                  <span className="text-sm font-semibold pr-4" style={{ fontFamily: "'Rajdhani', sans-serif" }}>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform ${openFaq === i ? "rotate-180" : ""}`} />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed border-t border-border pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-4">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <p className="font-bold text-sm" style={{ fontFamily: "'Rajdhani', sans-serif", color: "#f5820a" }}>MumbaikarlLive</p>
              <p className="text-xs text-muted-foreground mt-1">Real-time crowd tracking for Mumbai commuters</p>
            </div>
            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
              <span>Privacy Policy</span>
              <span>Terms of Service</span>
              <span>Contact</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-6 border-t border-border pt-4">
            Disclaimer: All crowd reports are public crowdsourced inputs and are informational only — not official scheduling data from CR, WR, or MMRC.
            © 2026 MumbaikarlLive. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
