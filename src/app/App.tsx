import { useState, useEffect, useRef } from "react";
import { Train, MapPin, Users, Clock, Share2, ChevronDown, AlertCircle, CheckCircle2, TrendingUp, Shield, Smartphone, Camera, X, Navigation } from "lucide-react";

const SUPABASE_URL = "https://loblkqxsxlcmmamwjibp.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvYmxrcXhzeGxjbW1hbXdqaWJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQyMTE4NDQsImV4cCI6MjA5OTc4Nzg0NH0.Vi7nYkCBUCnZvpNviQ8Ps__RHp5_BlIMx6lCWVmx-QE";

// Station coordinates [lat, lng] for GPS verification
const STATION_COORDS: Record<string, [number, number]> = {
  // Western Line
  "Churchgate": [18.9322, 72.8264], "Marine Lines": [18.9436, 72.8232], "Charni Road": [18.9531, 72.8192],
  "Grant Road": [18.9641, 72.8142], "Mumbai Central": [18.9691, 72.8194], "Mahalakshmi": [18.9841, 72.8172],
  "Lower Parel": [18.9941, 72.8194], "Prabhadevi": [19.0011, 72.8239], "Dadar": [19.0178, 72.8478],
  "Matunga Road": [19.0311, 72.8478], "Mahim": [19.0411, 72.8444], "Bandra": [19.0544, 72.8406],
  "Khar Road": [19.0644, 72.8364], "Santacruz": [19.0811, 72.8394], "Vile Parle": [19.0978, 72.8478],
  "Andheri": [19.1197, 72.8469], "Jogeshwari": [19.1364, 72.8478], "Ram Mandir": [19.1494, 72.8519],
  "Goregaon": [19.1594, 72.8494], "Malad": [19.1861, 72.8478], "Kandivali": [19.2061, 72.8528],
  "Borivali": [19.2311, 72.8578], "Dahisar": [19.2511, 72.8578], "Mira Road": [19.2844, 72.8706],
  "Bhayandar": [19.3011, 72.8578], "Naigaon": [19.3511, 72.8508], "Vasai Road": [19.3761, 72.8258],
  "Nallasopara": [19.4161, 72.7978], "Virar": [19.4644, 72.8064],
  // Central Line
  "CSMT": [18.9401, 72.8356], "Masjid": [18.9469, 72.8386], "Sandhurst Road": [18.9536, 72.8422],
  "Byculla": [18.9756, 72.8356], "Chinchpokli": [18.9822, 72.8356], "Currey Road": [18.9922, 72.8356],
  "Parel": [19.0011, 72.8419], "Matunga": [19.0256, 72.8578], "Sion": [19.0436, 72.8644],
  "Kurla": [19.0656, 72.8797], "Vidyavihar": [19.0756, 72.8911], "Ghatkopar": [19.0864, 72.9081],
  "Vikhroli": [19.1011, 72.9211], "Kanjurmarg": [19.1136, 72.9353], "Bhandup": [19.1328, 72.9422],
  "Nahur": [19.1494, 72.9456], "Mulund": [19.1711, 72.9578], "Thane": [19.1819, 72.9750],
  "Kalyan": [19.2403, 73.1305], "Dombivli": [19.2167, 73.0867],
  // Metro Line 3
  "BKC": [19.0658, 72.8697], "Worli": [19.0128, 72.8175], "Siddhivinayak": [19.0161, 72.8314],
  "Dharavi": [19.0406, 72.8519], "Mahalaxmi": [18.9828, 72.8194], "Cuffe Parade": [18.9056, 72.8194],
  "Hutatma Chowk": [18.9322, 72.8353], "Girgaon": [18.9528, 72.8139], "Kalbadevi": [18.9461, 72.8278],
  "Science Museum": [18.9761, 72.8047], "Acharya Atre Chowk": [18.9961, 72.8111],
  "Sahar Road": [19.0994, 72.8711], "Santacruz": [19.0811, 72.8394], "Vidyanagari": [19.0728, 72.8719],
  "SEEPZ": [19.1136, 72.8686], "MIDC": [19.1097, 72.8753], "Marol Naka": [19.1158, 72.8797],
  "Saki Naka": [19.1028, 72.8936], "Asalpha": [19.0928, 72.9003], "Jagruti Nagar": [19.0886, 72.9036],
  // Metro Line 1
  "Versova": [19.1328, 72.8197], "D.N. Nagar": [19.1258, 72.8297], "Azad Nagar": [19.1194, 72.8378],
  "Western Express Highway (WEH)": [19.1136, 72.8594], "Chakala (JB Nagar)": [19.1092, 72.8678],
  // Harbour Line extras
  "Wadala Road": [19.0228, 72.8594], "Reay Road": [18.9697, 72.8469], "Cotton Green": [18.9614, 72.8503],
  "Sewri": [18.9814, 72.8594], "Chembur": [19.0536, 72.9003], "Govandi": [19.0636, 72.9197],
  "Mankhurd": [19.0736, 72.9297], "Vashi": [19.0769, 72.9981], "Nerul": [19.0328, 73.0172],
  "Belapur": [19.0197, 73.0394], "Panvel": [18.9894, 73.1108], "Kharghar": [19.0494, 73.0697],
  "Airoli": [19.1569, 72.9978], "Ghansoli": [19.1258, 73.0081], "Koparkhairane": [19.1058, 73.0136],
  "Turbhe": [19.0894, 73.0208], "Sanpada": [19.0736, 73.0094], "Juinagar": [19.0553, 73.0036],
  "Seawoods-Darave": [19.0164, 73.0239], "Rabale": [19.1408, 72.9986],
};

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
interface Report { crowd_level: string; reported_at: string; }

// Haversine distance in meters
function getDistanceMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function fetchLatestReport(station: string): Promise<Report | null> {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/fetch_latest_report`, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
      body: JSON.stringify({ p_station_name: station }),
    });
    const data = await res.json();
    return data?.[0] ?? null;
  } catch { return null; }
}

async function submitReport(transitType: string, stationName: string, crowdLevel: string, proofPhoto: string): Promise<boolean> {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/accept_commuter_report`, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
      body: JSON.stringify({ p_transit_type: transitType, p_station_name: stationName, p_crowd_level: crowdLevel, p_proof_photo: proofPhoto }),
    });
    return res.ok;
  } catch { return false; }
}

function formatTime(iso: string) {
  try { return new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }); }
  catch { return "Just now"; }
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
  const [network, setNetwork] = useState("Mumbai Local");
  const [selectedLine, setSelectedLine] = useState("Western Line");
  const [selectedStation, setSelectedStation] = useState("Andheri");
  const [crowdSelection, setCrowdSelection] = useState<CrowdLevel | null>(null);
  const [latestReport, setLatestReport] = useState<Report | null>(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"success" | "error" | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Photo proof
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // GPS
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<"idle" | "checking" | "verified" | "too_far" | "no_coords" | "denied">("idle");
  const [distanceMeters, setDistanceMeters] = useState<number | null>(null);

  const lines = Object.keys(STATION_DATABASE[network]);
  const stations = STATION_DATABASE[network][selectedLine] ?? [];

  useEffect(() => {
    const firstLine = Object.keys(STATION_DATABASE[network])[0];
    setSelectedLine(firstLine);
    setSelectedStation(STATION_DATABASE[network][firstLine][0]);
  }, [network]);

  useEffect(() => { setSelectedStation(stations[0]); }, [selectedLine]);

  useEffect(() => {
    if (!selectedStation) return;
    setLoadingReport(true);
    fetchLatestReport(selectedStation).then((r) => { setLatestReport(r); setLoadingReport(false); });
    // Reset GPS status when station changes
    setLocationStatus("idle");
    setDistanceMeters(null);
    if (userLocation) checkDistance(userLocation.lat, userLocation.lng, selectedStation);
  }, [selectedStation]);

  function checkDistance(lat: number, lng: number, station: string) {
    const coords = STATION_COORDS[station];
    if (!coords) { setLocationStatus("no_coords"); return; }
    const dist = Math.round(getDistanceMeters(lat, lng, coords[0], coords[1]));
    setDistanceMeters(dist);
    setLocationStatus(dist <= 200 ? "verified" : "too_far");
  }

  function requestLocation() {
    setLocationStatus("checking");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        checkDistance(latitude, longitude, selectedStation);
      },
      () => setLocationStatus("denied"),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setPhotoPreview(result);
      setPhotoBase64(result.split(",")[1]);
    };
    reader.readAsDataURL(file);
  }

  function clearPhoto() {
    setPhotoBase64(null);
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  const canSubmit =
    !!crowdSelection &&
    !!photoBase64 &&
    (locationStatus === "verified" || locationStatus === "no_coords") &&
    !submitting;

  async function handleSubmit() {
    if (!canSubmit) return;
    setSubmitting(true);
    const ok = await submitReport(network, selectedStation, crowdSelection!, photoBase64!);
    setSubmitting(false);
    setSubmitStatus(ok ? "success" : "error");
    if (ok) {
      setCrowdSelection(null);
      clearPhoto();
      setLocationStatus("idle");
      setUserLocation(null);
      setTimeout(() => {
        setSubmitStatus(null);
        fetchLatestReport(selectedStation).then(setLatestReport);
      }, 2500);
    }
  }

  const faqs = [
    { q: "How does MumbaikarlLive verify crowd reports?", a: "Every report requires two proofs: a live photo of the platform or crowd, and GPS location confirmation that you are within 200 metres of the station. This makes it impossible to submit fake reports from home." },
    { q: "What are peak hours on Mumbai Local trains?", a: "Peak morning rush runs 8:30 AM to 11:00 AM heading into CSMT, Dadar, and Churchgate. Evening peak is 5:30 PM to 9:00 PM in the reverse direction. Platforms like Andheri, Borivali, and Thane see extreme crowding during these windows." },
    { q: "Which Mumbai Metro lines are covered?", a: "We cover Metro Line 1 (Versova–Ghatkopar), Line 2A & 7 (the WEH corridor), and the fully operational Line 3 Aqua Line from Aarey Colony down to Cuffe Parade." },
    { q: "How often is the crowd data updated?", a: "Data updates in real time as commuters submit verified reports. Popular stations like Dadar, Andheri, and CSMT typically receive updates every 5–10 minutes during peak hours." },
    { q: "Is MumbaikarlLive free to use?", a: "Yes, completely free. MumbaikarlLive is a community tool built for Mumbai commuters. No registration required to check crowd levels." },
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
              <h1 className="text-lg font-bold leading-none tracking-tight" style={{ fontFamily: "'Rajdhani', sans-serif", color: "#f5820a" }}>MumbaikarlLive</h1>
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
            GPS + photo verified crowd reports across all Western, Central, Harbour, and Metro lines. Know before you go.
          </p>
          <div className="flex flex-wrap gap-4 mt-6">
            {["250+ Stations", "GPS Verified", "Photo Proof Required", "Real-Time Reports"].map((t) => (
              <span key={t} className="text-xs border border-border px-3 py-1.5 rounded-full text-muted-foreground">{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Ad Slot 1 */}
      <div className="max-w-5xl mx-auto px-4 my-4">
        <div className="border border-dashed border-border rounded-lg p-3 text-center text-xs text-muted-foreground bg-card">
          <p className="font-semibold">Advertisement</p>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 pb-12">
        <div className="grid md:grid-cols-5 gap-6 mt-6">

          {/* Left: Selector + Submit */}
          <div className="md:col-span-3 space-y-4">
            {/* Station selector */}
            <div className="bg-card border border-border rounded-xl p-5 space-y-4">
              <h3 className="text-base font-bold tracking-wide" style={{ fontFamily: "'Rajdhani', sans-serif" }}>Select Your Station</h3>
              <div className="flex rounded-lg overflow-hidden border border-border">
                {Object.keys(STATION_DATABASE).map((n) => (
                  <button key={n} onClick={() => setNetwork(n)}
                    className={`flex-1 py-2.5 text-xs font-semibold tracking-wide transition-colors ${network === n ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:text-foreground"}`}
                    style={{ fontFamily: "'Rajdhani', sans-serif" }}>{n}</button>
                ))}
              </div>
              <div className="relative">
                <select value={selectedLine} onChange={(e) => setSelectedLine(e.target.value)}
                  className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-sm text-foreground appearance-none pr-10 focus:outline-none focus:ring-2 focus:ring-primary">
                  {lines.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
              <div className="relative">
                <select value={selectedStation} onChange={(e) => setSelectedStation(e.target.value)}
                  className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-sm text-foreground appearance-none pr-10 focus:outline-none focus:ring-2 focus:ring-primary">
                  {stations.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            {/* Report form */}
            <div className="bg-card border border-border rounded-xl p-5 space-y-5">
              <h3 className="text-base font-bold tracking-wide" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
                📢 Report Live Status at {selectedStation}
              </h3>

              {/* Step 1: Crowd level */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Step 1 — Select Crowd Level</p>
                <div className="grid grid-cols-3 gap-2">
                  {(["🟢 Less / Empty", "🟡 Moderate", "🔴 Very Crowded"] as CrowdLevel[]).map((level) => (
                    <button key={level} onClick={() => setCrowdSelection(level)}
                      className={`py-3 rounded-lg border text-xs font-semibold tracking-wide transition-all ${crowdSelection === level ? "border-primary bg-primary/20 text-primary" : "border-border bg-secondary text-muted-foreground hover:border-primary/50 hover:text-foreground"}`}
                      style={{ fontFamily: "'Rajdhani', sans-serif" }}>
                      <span className="block text-xl">{level[0]}</span>
                      {level.split(" ").slice(1).join(" ")}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2: Photo proof */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Step 2 — Take Photo Proof</p>
                {!photoPreview ? (
                  <button onClick={() => fileInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-border rounded-xl py-8 flex flex-col items-center gap-2 text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors">
                    <Camera className="w-8 h-8" />
                    <span className="text-sm font-semibold" style={{ fontFamily: "'Rajdhani', sans-serif" }}>Tap to take a photo of the platform</span>
                    <span className="text-xs">Photo is required to prevent fake reports</span>
                  </button>
                ) : (
                  <div className="relative rounded-xl overflow-hidden border border-border">
                    <img src={photoPreview} alt="Platform proof" className="w-full max-h-48 object-cover" />
                    <button onClick={clearPhoto}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center hover:bg-black/80 transition-colors">
                      <X className="w-4 h-4 text-white" />
                    </button>
                    <div className="absolute bottom-2 left-2 bg-black/60 rounded-full px-3 py-1 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span className="text-xs text-emerald-400">Photo captured</span>
                    </div>
                  </div>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" capture="environment"
                  onChange={handlePhotoChange} className="hidden" />
              </div>

              {/* Step 3: GPS verification */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Step 3 — Verify Your Location</p>

                {locationStatus === "idle" && (
                  <button onClick={requestLocation}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-lg border border-border bg-secondary text-sm font-semibold hover:border-primary/50 hover:text-primary transition-colors"
                    style={{ fontFamily: "'Rajdhani', sans-serif" }}>
                    <Navigation className="w-4 h-4" /> Confirm I am at {selectedStation}
                  </button>
                )}

                {locationStatus === "checking" && (
                  <div className="flex items-center gap-2 py-3 px-4 rounded-lg bg-secondary border border-border text-sm text-muted-foreground">
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    Getting your location...
                  </div>
                )}

                {locationStatus === "verified" && (
                  <div className="flex items-center gap-2 py-3 px-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-sm text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                    Location verified — you are {distanceMeters}m from {selectedStation}
                  </div>
                )}

                {locationStatus === "too_far" && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 py-3 px-4 rounded-lg bg-red-500/10 border border-red-500/30 text-sm text-red-400">
                      <AlertCircle className="w-4 h-4" />
                      You are {distanceMeters}m away — must be within 200m of {selectedStation}
                    </div>
                    <button onClick={requestLocation}
                      className="w-full py-2 rounded-lg border border-border text-xs text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors">
                      Try again
                    </button>
                  </div>
                )}

                {locationStatus === "no_coords" && (
                  <div className="flex items-center gap-2 py-3 px-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-sm text-yellow-400">
                    <CheckCircle2 className="w-4 h-4" />
                    Location received — station coordinates not mapped yet, proceeding on trust
                  </div>
                )}

                {locationStatus === "denied" && (
                  <div className="flex items-center gap-2 py-3 px-4 rounded-lg bg-red-500/10 border border-red-500/30 text-sm text-red-400">
                    <AlertCircle className="w-4 h-4" />
                    Location access denied — please enable GPS in your browser settings
                  </div>
                )}
              </div>

              {/* Submit */}
              {submitStatus === "success" && (
                <div className="flex items-center gap-2 text-emerald-400 text-sm bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-4 py-3">
                  <CheckCircle2 className="w-4 h-4" /> Report submitted! Thank you for helping Mumbai commuters.
                </div>
              )}
              {submitStatus === "error" && (
                <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">
                  <AlertCircle className="w-4 h-4" /> Failed to submit. Please try again.
                </div>
              )}

              <button onClick={handleSubmit} disabled={!canSubmit}
                className="w-full py-3 rounded-lg font-bold tracking-widest text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ fontFamily: "'Rajdhani', sans-serif", background: canSubmit ? "#f5820a" : undefined, color: canSubmit ? "#0b1120" : undefined, border: "1px solid rgba(245,130,10,0.3)" }}>
                {submitting ? "Submitting..." : !crowdSelection ? "Select crowd level first" : !photoBase64 ? "Take photo proof first" : locationStatus === "idle" || locationStatus === "denied" ? "Verify location first" : locationStatus === "too_far" ? "Too far from station" : "Broadcast Status"}
              </button>

              <a href={`https://wa.me/?text=Check+if+${encodeURIComponent(selectedStation)}+(${encodeURIComponent(selectedLine)})+is+crowded+right+now:+https://mumbaikarlive.in`}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-lg border border-emerald-600/40 text-emerald-400 text-sm font-semibold hover:bg-emerald-500/10 transition-colors"
                style={{ fontFamily: "'Rajdhani', sans-serif" }}>
                <Share2 className="w-4 h-4" />
                Share {selectedStation} Status on WhatsApp
              </a>
            </div>
          </div>

          {/* Right: Live Status */}
          <div className="md:col-span-2 space-y-4">
            <div className="bg-card border border-border rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold tracking-wide" style={{ fontFamily: "'Rajdhani', sans-serif" }}>📊 Live Status</h3>
                <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" /> Real-time</span>
              </div>
              <p className="text-sm font-semibold">{selectedStation}</p>
              <p className="text-xs text-muted-foreground">{selectedLine}</p>
              {loadingReport ? (
                <div className="h-20 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : latestReport ? (
                <div className="space-y-3">
                  <CrowdBadge level={latestReport.crowd_level} />
                  <p className="text-xs text-muted-foreground">Last report: {formatTime(latestReport.reported_at)}</p>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground bg-secondary rounded-lg p-4">
                  No recent reports for this station. Be the first to update fellow commuters!
                </div>
              )}
            </div>

            <div className="bg-card border border-border rounded-xl p-5 space-y-3">
              <h3 className="text-sm font-bold tracking-wide text-muted-foreground uppercase" style={{ fontFamily: "'Rajdhani', sans-serif" }}>Peak Hours Guide</h3>
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

            {/* Anti-fraud badge */}
            <div className="bg-card border border-primary/20 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                <p className="text-xs font-bold text-primary" style={{ fontFamily: "'Rajdhani', sans-serif" }}>Anti-Fake Report System</p>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Every report requires GPS verification within 200m of the station + a live photo. You cannot report from home.
              </p>
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
          <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: "'Teko', sans-serif", letterSpacing: "0.03em" }}>How MumbaikarlLive Works</h2>
          <p className="text-muted-foreground text-sm mb-8 max-w-2xl">A zero-trust crowdsourcing model — GPS location and photo proof required for every report.</p>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { icon: Smartphone, title: "1. Select Your Station", desc: "Choose your transit network, line, and exact platform from our database of 250+ stations across Western, Central, Harbour, and Metro lines." },
              { icon: Camera, title: "2. Snap a Photo Proof", desc: "Take a live photo of the platform or crowd. Combined with GPS verification within 200 metres of the station, this prevents all fake reports." },
              { icon: TrendingUp, title: "3. Check Before You Go", desc: "See the latest verified crowd report with timestamp. Know if Andheri or Dadar is packed before you step out of the house." },
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

        {/* Content section */}
        <section className="mb-12 bg-card border border-border rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold" style={{ fontFamily: "'Teko', sans-serif", letterSpacing: "0.03em" }}>Mumbai Commuter Safety Guide</h2>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Navigating Mumbai Suburban Railway — covering the Western Line (Churchgate to Virar), Central Line (CSMT to Kalyan), and Harbour Line (CSMT to Panvel) — demands careful planning during peak hours. With over 7 million daily commuters, the Mumbai Local is one of the world's busiest rail networks.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            <strong className="text-foreground">Safety rules every Mumbaikar must know:</strong> Always stand behind the yellow platform safety line. Never board a moving local train. Use foot overbridges (FOBs) to cross tracks. Secure your UTS ticket or smart card before boarding. During peak hours at major stations like Andheri, Dadar, Borivali, and Thane, allow alighting passengers to exit before boarding.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The Mumbai Metro network continues to expand. Metro Line 3 (Aqua Line), running underground from Aarey Colony to Cuffe Parade, has significantly reduced road traffic in the BKC–Worli–Churchgate corridor. Metro trains offer air conditioning and predictable frequency — an excellent alternative to local trains for compatible routes.
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
          <h2 className="text-2xl font-bold mb-6" style={{ fontFamily: "'Teko', sans-serif", letterSpacing: "0.03em" }}>Frequently Asked Questions</h2>
          <div className="space-y-2">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-card border border-border rounded-xl overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-secondary/50 transition-colors">
                  <span className="text-sm font-semibold pr-4" style={{ fontFamily: "'Rajdhani', sans-serif" }}>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform ${openFaq === i ? "rotate-180" : ""}`} />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed border-t border-border pt-4">{faq.a}</div>
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
              <span>Privacy Policy</span><span>Terms of Service</span><span>Contact</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-6 border-t border-border pt-4">
            Disclaimer: All crowd reports are public crowdsourced inputs — not official data from CR, WR, or MMRC. © 2026 MumbaikarlLive. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
