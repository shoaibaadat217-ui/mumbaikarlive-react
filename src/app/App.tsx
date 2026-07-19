import { useState, useEffect, useRef } from "react";
import { Train, MapPin, Clock, Share2, ChevronDown, AlertCircle, CheckCircle2, TrendingUp, Shield, Smartphone, Camera, X, Navigation, History, Phone, MessageSquare, Trophy, Star, Award } from "lucide-react";

const SUPABASE_URL = "https://loblkqxsxlcmmamwjibp.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvYmxrcXhzeGxjbW1hbXdqaWJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQyMTE4NDQsImV4cCI6MjA5OTc4Nzg0NH0.Vi7nYkCBUCnZvpNviQ8Ps__RHp5_BlIMx6lCWVmx-QE";
const STALE_MINUTES = 45;

const HELPLINES = [
  { name: "Western Railway Helpline", number: "139", desc: "Enquiry, complaints, lost & found" },
  { name: "Central Railway Helpline", number: "139", desc: "Enquiry, complaints, lost & found" },
  { name: "Mumbai Metro Line 1", number: "1800-120-3999", desc: "Versova–Ghatkopar metro helpline" },
  { name: "Mumbai Metro Line 3 (Aqua)", number: "1800-266-0000", desc: "Aarey–Cuffe Parade metro helpline" },
  { name: "Railway Police (RPF)", number: "1800-111-322", desc: "Security & safety emergencies" },
  { name: "Mumbai Police", number: "100", desc: "Emergency police assistance" },
  { name: "Railway Medical Emergency", number: "138", desc: "Medical help at stations" },
  { name: "Anti-Corruption Helpline", number: "155210", desc: "Report bribery at stations" },
];

const STATION_COORDS: Record<string, [number, number]> = {
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
  "CSMT": [18.9401, 72.8356], "Masjid": [18.9469, 72.8386], "Sandhurst Road": [18.9536, 72.8422],
  "Byculla": [18.9756, 72.8356], "Chinchpokli": [18.9822, 72.8356], "Currey Road": [18.9922, 72.8356],
  "Parel": [19.0011, 72.8419], "Matunga": [19.0256, 72.8578], "Sion": [19.0436, 72.8644],
  "Kurla": [19.0656, 72.8797], "Vidyavihar": [19.0756, 72.8911], "Ghatkopar": [19.0864, 72.9081],
  "Vikhroli": [19.1011, 72.9211], "Kanjurmarg": [19.1136, 72.9353], "Bhandup": [19.1328, 72.9422],
  "Nahur": [19.1494, 72.9456], "Mulund": [19.1711, 72.9578], "Thane": [19.1819, 72.9750],
  "Kalyan": [19.2403, 73.1305], "Dombivli": [19.2167, 73.0867],
  "BKC": [19.0658, 72.8697], "Worli": [19.0128, 72.8175], "Siddhivinayak": [19.0161, 72.8314],
  "Dharavi": [19.0406, 72.8519], "Mahalaxmi": [18.9828, 72.8194], "Cuffe Parade": [18.9056, 72.8194],
  "Hutatma Chowk": [18.9322, 72.8353], "Girgaon": [18.9528, 72.8139], "Kalbadevi": [18.9461, 72.8278],
  "Science Museum": [18.9761, 72.8047], "Acharya Atre Chowk": [18.9961, 72.8111],
  "Sahar Road": [19.0994, 72.8711], "Vidyanagari": [19.0728, 72.8719],
  "SEEPZ": [19.1136, 72.8686], "MIDC": [19.1097, 72.8753], "Marol Naka": [19.1158, 72.8797],
  "Saki Naka": [19.1028, 72.8936], "Asalpha": [19.0928, 72.9003], "Jagruti Nagar": [19.0886, 72.9036],
  "Versova": [19.1328, 72.8197], "D.N. Nagar": [19.1258, 72.8297], "Azad Nagar": [19.1194, 72.8378],
  "Western Express Highway (WEH)": [19.1136, 72.8594], "Chakala (JB Nagar)": [19.1092, 72.8678],
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
type Tab = "check" | "report" | "history" | "community" | "helpline";
interface Report { crowd_level: string; reported_at: string; proof_photo?: string; }
interface LeaderboardEntry { station_name: string; report_count: number; }

function getDistanceMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function isStale(iso: string): boolean {
  try {
    const diff = (Date.now() - new Date(iso).getTime()) / 60000;
    return diff > STALE_MINUTES;
  } catch { return true; }
}

function timeAgo(iso: string) {
  try {
    const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
    if (diff < 1) return "Just now";
    if (diff < 60) return `${diff} min ago`;
    return `${Math.floor(diff / 60)}h ago`;
  } catch { return ""; }
}

function formatTime(iso: string) {
  try { return new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }); }
  catch { return ""; }
}

function crowdStyle(level: string) {
  if (level.startsWith("🟢")) return { dot: "bg-emerald-500", text: "text-emerald-400", label: "Less / Empty", bar: "bg-emerald-500" };
  if (level.startsWith("🟡")) return { dot: "bg-yellow-500", text: "text-yellow-400", label: "Moderate", bar: "bg-yellow-500" };
  return { dot: "bg-red-500", text: "text-red-400", label: "Very Crowded", bar: "bg-red-500" };
}

function getBadge(count: number): { label: string; icon: React.ReactNode; color: string } | null {
  if (count >= 50) return { label: "Mumbai Local Legend", icon: <Award className="w-4 h-4" />, color: "text-yellow-400 border-yellow-400/30 bg-yellow-400/10" };
  if (count >= 20) return { label: "Commuter Hero", icon: <Trophy className="w-4 h-4" />, color: "text-orange-400 border-orange-400/30 bg-orange-400/10" };
  if (count >= 5) return { label: "Station Reporter", icon: <Star className="w-4 h-4" />, color: "text-blue-400 border-blue-400/30 bg-blue-400/10" };
  if (count >= 1) return { label: "New Reporter", icon: <Star className="w-4 h-4" />, color: "text-muted-foreground border-border bg-secondary" };
  return null;
}

async function apiFetch(fn: string, body: object) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fn}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
    body: JSON.stringify(body),
  });
  return res.json();
}

function FreshReports({ reports, onReport, station }: { reports: Report[]; onReport: () => void; station: string }) {
  const fresh = reports.filter(r => !isStale(r.reported_at));
  if (fresh.length === 0) {
    return (
      <div className="text-sm text-muted-foreground bg-secondary rounded-xl p-6 text-center">
        No fresh reports for {station} in the last 45 minutes.<br />
        <button onClick={onReport} className="text-primary font-semibold mt-2 inline-block">Be the first to report →</button>
      </div>
    );
  }
  return (
    <div className="space-y-1">
      {fresh.map((r, i) => {
        const { dot, text, label } = crowdStyle(r.crowd_level);
        return (
          <div key={i} className="py-3 border-b border-border last:border-0 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className={`w-3 h-3 rounded-full ${dot} shrink-0`} />
                <span className={`text-sm font-semibold ${text}`}>{label}</span>
              </div>
              <div className="text-right">
                <p className="text-xs text-foreground">{formatTime(r.reported_at)}</p>
                <p className="text-xs text-muted-foreground">{timeAgo(r.reported_at)}</p>
              </div>
            </div>
            {r.proof_photo && (
              <img
                src={`data:image/jpeg;base64,${r.proof_photo}`}
                alt="Platform proof"
                className="w-full max-h-32 object-cover rounded-lg border border-border"
              />
            )}
          </div>
        );
      })}
      <p className="text-xs text-muted-foreground text-center pt-2">{fresh.length} fresh report{fresh.length !== 1 ? "s" : ""} in last 45 min</p>
    </div>
  );
}

function HelplinesBar() {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-full border border-red-500/40 bg-red-500/10 text-red-400 font-semibold hover:bg-red-500/20 transition-colors">
        <Phone className="w-3 h-3" /> 139 Helpline
      </button>
      {open && (
        <div className="absolute right-0 top-9 w-72 bg-card border border-border rounded-xl shadow-2xl z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <p className="text-sm font-bold" style={{ fontFamily: "'Rajdhani', sans-serif" }}>📞 Railway Helplines</p>
            <button onClick={() => setOpen(false)}><X className="w-4 h-4 text-muted-foreground" /></button>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {HELPLINES.map((h) => (
              <a key={h.name} href={`tel:${h.number}`} onClick={() => setOpen(false)}
                className="flex items-center justify-between px-4 py-3 border-b border-border last:border-0 hover:bg-secondary transition-colors">
                <div>
                  <p className="text-xs font-semibold">{h.name}</p>
                  <p className="text-xs text-muted-foreground">{h.desc}</p>
                </div>
                <span className="text-base font-bold text-primary ml-3 shrink-0" style={{ fontFamily: "'Teko', sans-serif" }}>{h.number}</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [network, setNetwork] = useState("Mumbai Local");
  const [selectedLine, setSelectedLine] = useState("Western Line");
  const [selectedStation, setSelectedStation] = useState("Andheri");
  const [activeTab, setActiveTab] = useState<Tab>("check");
  const [crowdSelection, setCrowdSelection] = useState<CrowdLevel | null>(null);
  const [latestReport, setLatestReport] = useState<Report | null>(null);
  const [recentReports, setRecentReports] = useState<Report[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loadingReport, setLoadingReport] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"success" | "error" | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<"idle" | "checking" | "verified" | "too_far" | "no_coords" | "denied">("idle");
  const [distanceMeters, setDistanceMeters] = useState<number | null>(null);
  const [myReportCount, setMyReportCount] = useState(0);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackSent, setFeedbackSent] = useState(false);

  const lines = Object.keys(STATION_DATABASE[network]);
  const stations = STATION_DATABASE[network][selectedLine] ?? [];

  useEffect(() => {
    const count = parseInt(localStorage.getItem("ml_report_count") || "0");
    setMyReportCount(count);
  }, []);

  useEffect(() => {
    const firstLine = Object.keys(STATION_DATABASE[network])[0];
    setSelectedLine(firstLine);
    setSelectedStation(STATION_DATABASE[network][firstLine][0]);
  }, [network]);

  useEffect(() => { setSelectedStation(stations[0]); }, [selectedLine]);

  useEffect(() => {
    if (!selectedStation) return;
    setLoadingReport(true);
    apiFetch("fetch_latest_report", { p_station_name: selectedStation }).then((data) => {
      setLatestReport(data?.[0] ?? null);
      setLoadingReport(false);
    });
    setLocationStatus("idle");
    setDistanceMeters(null);
    if (userLocation) checkDistance(userLocation.lat, userLocation.lng, selectedStation);
  }, [selectedStation]);

  useEffect(() => {
    if (activeTab !== "history" || !selectedStation) return;
    setLoadingHistory(true);
    apiFetch("fetch_recent_reports", { p_station_name: selectedStation }).then((data) => {
      setRecentReports(Array.isArray(data) ? data : []);
      setLoadingHistory(false);
    });
  }, [activeTab, selectedStation]);

  useEffect(() => {
    if (activeTab !== "community") return;
    setLoadingLeaderboard(true);
    apiFetch("fetch_leaderboard", {}).then((data) => {
      setLeaderboard(Array.isArray(data) ? data : []);
      setLoadingLeaderboard(false);
    });
  }, [activeTab]);

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

  const canSubmit = !!crowdSelection && !!photoBase64 && (locationStatus === "verified" || locationStatus === "no_coords") && !submitting;

  async function handleSubmit() {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/accept_commuter_report`, {
        method: "POST",
        headers: { "Content-Type": "application/json", apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
        body: JSON.stringify({ p_transit_type: network, p_station_name: selectedStation, p_crowd_level: crowdSelection, p_proof_photo: photoBase64 }),
      });
      if (res.ok) {
        const newCount = myReportCount + 1;
        localStorage.setItem("ml_report_count", String(newCount));
        setMyReportCount(newCount);
        setSubmitStatus("success");
        setCrowdSelection(null);
        clearPhoto();
        setLocationStatus("idle");
        setUserLocation(null);
        setTimeout(() => {
          setSubmitStatus(null);
          apiFetch("fetch_latest_report", { p_station_name: selectedStation }).then((data) => setLatestReport(data?.[0] ?? null));
        }, 2500);
      } else {
        setSubmitStatus("error");
      }
    } catch { setSubmitStatus("error"); }
    setSubmitting(false);
  }

  function handleFeedback() {
    if (!feedbackText.trim()) return;
    const msg = encodeURIComponent(`MumbaikarlLive Feedback:\n${feedbackText}`);
    window.open(`https://wa.me/919999999999?text=${msg}`, "_blank");
    setFeedbackSent(true);
    setFeedbackText("");
  }

  const badge = getBadge(myReportCount);
  const stale = latestReport ? isStale(latestReport.reported_at) : false;

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "check", label: "Live", icon: <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" /> },
    { id: "report", label: "Report", icon: <Camera className="w-3.5 h-3.5" /> },
    { id: "history", label: "History", icon: <History className="w-3.5 h-3.5" /> },
    { id: "community", label: "Community", icon: <Trophy className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <header className="border-b border-border sticky top-0 z-50 bg-background/95 backdrop-blur">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-primary flex items-center justify-center shrink-0">
              <Train className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-base font-bold leading-none" style={{ fontFamily: "'Rajdhani', sans-serif", color: "#f5820a" }}>MumbaikarlLive</h1>
              <p className="text-xs text-muted-foreground">mumbaikarlive.in</p>
            </div>
          </div>
          <HelplinesBar />
        </div>
      </header>

      {/* Hero */}
      <section className="border-b border-border py-7 md:py-12" style={{ background: "linear-gradient(135deg, #0b1120 0%, #131d30 60%, #1a2234 100%)" }}>
        <div className="max-w-2xl mx-auto px-4">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-4 h-4 text-primary shrink-0" />
            <p className="text-xs font-semibold tracking-widest text-primary uppercase">Mumbai, Maharashtra</p>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold leading-tight mb-2" style={{ fontFamily: "'Teko', sans-serif", letterSpacing: "0.02em" }}>
            Real-Time Crowd Tracker<br />
            <span style={{ color: "#f5820a" }}>for Every Mumbai Station</span>
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed mb-4">GPS + photo verified crowd reports. Western, Central, Harbour, and Metro lines.</p>
          <div className="flex flex-wrap gap-2">
            {["250+ Stations", "GPS Verified", "Auto-Expires in 45min", "Community Powered"].map((t) => (
              <span key={t} className="text-xs border border-border px-2.5 py-1 rounded-full text-muted-foreground">{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Ad Slot 1 */}
      <div className="max-w-2xl mx-auto px-4 my-3">
        <div className="border border-dashed border-border rounded-lg p-2.5 text-center text-xs text-muted-foreground bg-card">Advertisement</div>
      </div>

      <main className="max-w-2xl mx-auto px-4 pb-12">
        {/* Station Selector */}
        <div className="bg-card border border-border rounded-xl p-4 mb-3 space-y-3">
          <div className="flex rounded-lg overflow-hidden border border-border">
            {Object.keys(STATION_DATABASE).map((n) => (
              <button key={n} onClick={() => setNetwork(n)}
                className={`flex-1 py-2 text-xs font-semibold tracking-wide transition-colors ${network === n ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground"}`}
                style={{ fontFamily: "'Rajdhani', sans-serif" }}>{n}</button>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="relative">
              <select value={selectedLine} onChange={(e) => setSelectedLine(e.target.value)}
                className="w-full bg-secondary border border-border rounded-lg px-3 py-2.5 text-sm text-foreground appearance-none pr-8 focus:outline-none focus:ring-2 focus:ring-primary">
                {lines.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
            <div className="relative">
              <select value={selectedStation} onChange={(e) => setSelectedStation(e.target.value)}
                className="w-full bg-secondary border border-border rounded-lg px-3 py-2.5 text-sm text-foreground appearance-none pr-8 focus:outline-none focus:ring-2 focus:ring-primary">
                {stations.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Tab Bar */}
        <div className="flex rounded-xl overflow-hidden border border-border mb-4 bg-card">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1 py-2.5 text-xs font-semibold transition-colors ${activeTab === tab.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
              style={{ fontFamily: "'Rajdhani', sans-serif" }}>
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* TAB: Live Status */}
        {activeTab === "check" && (
          <div className="space-y-3">
            <div className="bg-card border border-border rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold" style={{ fontFamily: "'Rajdhani', sans-serif" }}>📊 Live Status</h3>
                <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" /> Auto-expires in 45min</span>
              </div>
              <div>
                <p className="text-lg font-bold">{selectedStation}</p>
                <p className="text-xs text-muted-foreground">{selectedLine}</p>
              </div>

              {loadingReport ? (
                <div className="h-20 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : latestReport && !stale ? (
                <div className="space-y-3">
                  <div className={`rounded-xl p-4 border ${crowdStyle(latestReport.crowd_level).text} ${latestReport.crowd_level.startsWith("🟢") ? "bg-emerald-500/10 border-emerald-500/20" : latestReport.crowd_level.startsWith("🟡") ? "bg-yellow-500/10 border-yellow-500/20" : "bg-red-500/10 border-red-500/20"}`}>
                    <p className="text-2xl font-bold" style={{ fontFamily: "'Teko', sans-serif" }}>{crowdStyle(latestReport.crowd_level).label}</p>
                    <p className="text-xs opacity-75 mt-1">Reported {timeAgo(latestReport.reported_at)} · {formatTime(latestReport.reported_at)}</p>
                  </div>
                  {latestReport.proof_photo && (
                    <div className="rounded-xl overflow-hidden border border-border">
                      <img
                        src={`data:image/jpeg;base64,${latestReport.proof_photo}`}
                        alt={`Live platform photo at ${selectedStation}`}
                        className="w-full max-h-52 object-cover"
                      />
                      <div className="px-3 py-2 bg-secondary flex items-center gap-2">
                        <Camera className="w-3 h-3 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">Live photo proof from commuter · {formatTime(latestReport.reported_at)}</p>
                      </div>
                    </div>
                  )}
                  <button onClick={() => setActiveTab("report")}
                    className="w-full py-2.5 rounded-lg border border-primary/30 text-primary text-sm font-semibold hover:bg-primary/10 transition-colors"
                    style={{ fontFamily: "'Rajdhani', sans-serif" }}>
                    Update This Status
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="rounded-xl p-4 border border-border bg-secondary text-center">
                    <p className="text-lg font-bold text-muted-foreground" style={{ fontFamily: "'Teko', sans-serif" }}>
                      {stale && latestReport ? "⚠️ Status Expired" : "❓ No Data Yet"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stale && latestReport
                        ? `Last report was ${timeAgo(latestReport.reported_at)} — too old to trust`
                        : "No recent reports for this station"}
                    </p>
                  </div>
                  <button onClick={() => setActiveTab("report")}
                    className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 transition-opacity"
                    style={{ fontFamily: "'Rajdhani', sans-serif" }}>
                    Be First to Report
                  </button>
                </div>
              )}
            </div>

            {/* Peak Hours */}
            <div className="bg-card border border-border rounded-xl p-4">
              <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3" style={{ fontFamily: "'Rajdhani', sans-serif" }}>Peak Hours Guide</h3>
              {[
                { label: "Morning Peak", time: "8:30 AM – 11:00 AM", color: "text-red-400" },
                { label: "Afternoon Calm", time: "11:30 AM – 5:00 PM", color: "text-emerald-400" },
                { label: "Evening Peak", time: "5:30 PM – 9:00 PM", color: "text-red-400" },
              ].map(({ label, time, color }) => (
                <div key={label} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                  <span className="text-muted-foreground text-xs">{label}</span>
                  <span className={`font-semibold text-xs ${color}`}>{time}</span>
                </div>
              ))}
            </div>

            <a href={`https://wa.me/?text=Check+if+${encodeURIComponent(selectedStation)}+(${encodeURIComponent(selectedLine)})+is+crowded+right+now:+https://mumbaikarlive.in`}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-emerald-600/40 text-emerald-400 text-sm font-semibold hover:bg-emerald-500/10 transition-colors"
              style={{ fontFamily: "'Rajdhani', sans-serif" }}>
              <Share2 className="w-4 h-4" /> Share on WhatsApp
            </a>
          </div>
        )}

        {/* TAB: Report */}
        {activeTab === "report" && (
          <div className="space-y-3">
            {/* My badge */}
            {badge && (
              <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${badge.color}`}>
                {badge.icon}
                <div>
                  <p className="text-xs font-bold">{badge.label}</p>
                  <p className="text-xs opacity-75">You have submitted {myReportCount} report{myReportCount !== 1 ? "s" : ""}</p>
                </div>
              </div>
            )}

            <div className="bg-card border border-border rounded-xl p-5 space-y-5">
              <h3 className="text-base font-bold" style={{ fontFamily: "'Rajdhani', sans-serif" }}>📢 Report at {selectedStation}</h3>

              {/* Step 1 */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Step 1 — Crowd Level</p>
                <div className="grid grid-cols-3 gap-2">
                  {(["🟢 Less / Empty", "🟡 Moderate", "🔴 Very Crowded"] as CrowdLevel[]).map((level) => {
                    const { dot, label } = crowdStyle(level);
                    return (
                      <button key={level} onClick={() => setCrowdSelection(level)}
                        className={`py-4 rounded-xl border text-xs font-semibold tracking-wide transition-all flex flex-col items-center gap-1.5 ${crowdSelection === level ? "border-primary bg-primary/20 text-primary" : "border-border bg-secondary text-muted-foreground"}`}
                        style={{ fontFamily: "'Rajdhani', sans-serif" }}>
                        <span className={`w-3 h-3 rounded-full ${dot}`} />
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Photo */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Step 2 — Photo Proof</p>
                {!photoPreview ? (
                  <button onClick={() => fileInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-border rounded-xl py-7 flex flex-col items-center gap-2 text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors">
                    <Camera className="w-7 h-7" />
                    <span className="text-sm font-semibold" style={{ fontFamily: "'Rajdhani', sans-serif" }}>Tap to photograph platform</span>
                    <span className="text-xs">Required — prevents fake reports</span>
                  </button>
                ) : (
                  <div className="relative rounded-xl overflow-hidden border border-border">
                    <img src={photoPreview} alt="Platform proof" className="w-full max-h-44 object-cover" />
                    <button onClick={clearPhoto} className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/70 flex items-center justify-center">
                      <X className="w-4 h-4 text-white" />
                    </button>
                    <div className="absolute bottom-2 left-2 bg-black/60 rounded-full px-3 py-1 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span className="text-xs text-emerald-400">Photo ready</span>
                    </div>
                  </div>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={handlePhotoChange} className="hidden" />
              </div>

              {/* Step 3: GPS */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Step 3 — Verify Location</p>
                {locationStatus === "idle" && (
                  <button onClick={requestLocation}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-border bg-secondary text-sm font-semibold hover:border-primary/50 hover:text-primary transition-colors"
                    style={{ fontFamily: "'Rajdhani', sans-serif" }}>
                    <Navigation className="w-4 h-4" /> Confirm I am at {selectedStation}
                  </button>
                )}
                {locationStatus === "checking" && (
                  <div className="flex items-center gap-2 py-3 px-4 rounded-xl bg-secondary border border-border text-sm text-muted-foreground">
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" /> Getting location...
                  </div>
                )}
                {locationStatus === "verified" && (
                  <div className="flex items-center gap-2 py-3 px-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-sm text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" /> Verified — {distanceMeters}m from {selectedStation}
                  </div>
                )}
                {locationStatus === "too_far" && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 py-3 px-4 rounded-xl bg-red-500/10 border border-red-500/30 text-sm text-red-400">
                      <AlertCircle className="w-4 h-4" /> {distanceMeters}m away — must be within 200m
                    </div>
                    <button onClick={requestLocation} className="w-full py-2 rounded-xl border border-border text-xs text-muted-foreground hover:border-primary/50 transition-colors">Try again</button>
                  </div>
                )}
                {locationStatus === "no_coords" && (
                  <div className="flex items-center gap-2 py-3 px-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-sm text-yellow-400">
                    <CheckCircle2 className="w-4 h-4" /> Location received — proceeding
                  </div>
                )}
                {locationStatus === "denied" && (
                  <div className="flex items-center gap-2 py-3 px-4 rounded-xl bg-red-500/10 border border-red-500/30 text-sm text-red-400">
                    <AlertCircle className="w-4 h-4" /> Enable GPS in browser settings
                  </div>
                )}
              </div>

              {submitStatus === "success" && (
                <div className="flex items-center gap-2 text-emerald-400 text-sm bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-3">
                  <CheckCircle2 className="w-4 h-4" /> Submitted! You are helping Mumbai commuters 🙏
                </div>
              )}
              {submitStatus === "error" && (
                <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
                  <AlertCircle className="w-4 h-4" /> Failed. Please try again.
                </div>
              )}

              <button onClick={handleSubmit} disabled={!canSubmit}
                className="w-full py-4 rounded-xl font-bold tracking-widest text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ fontFamily: "'Rajdhani', sans-serif", background: canSubmit ? "#f5820a" : undefined, color: canSubmit ? "#0b1120" : undefined, border: "1px solid rgba(245,130,10,0.3)" }}>
                {submitting ? "Submitting..." : !crowdSelection ? "Select crowd level first" : !photoBase64 ? "Take photo first" : locationStatus === "idle" || locationStatus === "denied" ? "Verify location first" : locationStatus === "too_far" ? "Too far from station" : "Broadcast Status"}
              </button>
            </div>
          </div>
        )}

        {/* TAB: History */}
        {activeTab === "history" && (
          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold" style={{ fontFamily: "'Rajdhani', sans-serif" }}>📋 Report History</h3>
              <p className="text-xs text-muted-foreground">{selectedStation}</p>
            </div>
            {loadingHistory ? (
              <div className="h-32 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : recentReports.length === 0 ? (
              <div className="text-sm text-muted-foreground bg-secondary rounded-xl p-6 text-center">
                No reports yet for {selectedStation}.<br />
                <button onClick={() => setActiveTab("report")} className="text-primary font-semibold mt-2 inline-block">Be the first →</button>
              </div>
            ) : (
              <FreshReports reports={recentReports} onReport={() => setActiveTab("report")} station={selectedStation} />
            )}
          </div>
        )}

        {/* TAB: Community */}
        {activeTab === "community" && (
          <div className="space-y-3">
            {/* My Stats */}
            <div className="bg-card border border-border rounded-xl p-5 space-y-3">
              <h3 className="text-base font-bold" style={{ fontFamily: "'Rajdhani', sans-serif" }}>🏅 Your Reporter Profile</h3>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-primary/20 border-2 border-primary/30 flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary" style={{ fontFamily: "'Teko', sans-serif" }}>{myReportCount}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold">Total Reports Submitted</p>
                  {badge ? (
                    <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border font-semibold mt-1 ${badge.color}`}>
                      {badge.icon} {badge.label}
                    </span>
                  ) : (
                    <p className="text-xs text-muted-foreground mt-1">Submit 1 report to earn your first badge!</p>
                  )}
                </div>
              </div>
              {/* Badge ladder */}
              <div className="space-y-2 pt-2 border-t border-border">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Badge Ladder</p>
                {[
                  { min: 1, label: "New Reporter", icon: <Star className="w-3 h-3" />, color: "text-muted-foreground" },
                  { min: 5, label: "Station Reporter", icon: <Star className="w-3 h-3" />, color: "text-blue-400" },
                  { min: 20, label: "Commuter Hero", icon: <Trophy className="w-3 h-3" />, color: "text-orange-400" },
                  { min: 50, label: "Mumbai Local Legend", icon: <Award className="w-3 h-3" />, color: "text-yellow-400" },
                ].map(({ min, label, icon, color }) => (
                  <div key={label} className={`flex items-center gap-3 py-2 px-3 rounded-lg ${myReportCount >= min ? "bg-primary/10 border border-primary/20" : "bg-secondary border border-transparent opacity-50"}`}>
                    <span className={color}>{icon}</span>
                    <span className="text-xs font-semibold flex-1">{label}</span>
                    <span className="text-xs text-muted-foreground">{min}+ reports</span>
                    {myReportCount >= min && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                  </div>
                ))}
              </div>
            </div>

            {/* Leaderboard */}
            <div className="bg-card border border-border rounded-xl p-5 space-y-3">
              <h3 className="text-base font-bold" style={{ fontFamily: "'Rajdhani', sans-serif" }}>🔥 Most Active Stations Today</h3>
              {loadingLeaderboard ? (
                <div className="h-24 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : leaderboard.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No reports today yet — be the first!</p>
              ) : (
                <div className="space-y-2">
                  {leaderboard.map((entry, i) => (
                    <div key={entry.station_name} className="flex items-center gap-3">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${i === 0 ? "bg-yellow-400/20 text-yellow-400" : i === 1 ? "bg-gray-400/20 text-gray-400" : i === 2 ? "bg-orange-400/20 text-orange-400" : "bg-secondary text-muted-foreground"}`}>
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{entry.station_name}</p>
                        <div className="w-full bg-secondary rounded-full h-1 mt-1">
                          <div className="bg-primary h-1 rounded-full" style={{ width: `${Math.min(100, (entry.report_count / (leaderboard[0]?.report_count || 1)) * 100)}%` }} />
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0">{entry.report_count} reports</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB: Helpline */}
        {activeTab === "helpline" && (
          <div className="space-y-3">
            {/* About Us */}
            <div className="bg-card border border-border rounded-xl p-5 space-y-3">
              <h3 className="text-base font-bold" style={{ fontFamily: "'Rajdhani', sans-serif" }}>🚇 About MumbaikarlLive</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                MumbaikarlLive is a free, community-powered crowd tracking platform built for Mumbai's 7 million daily train commuters. We cover all Western Line, Central Line, Harbour Line, Trans-Harbour, and Metro stations across Mumbai.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Every crowd report on MumbaikarlLive is verified with GPS location (within 200 metres of the station) and a live photo — making it impossible to submit fake data. Reports automatically expire after 45 minutes so you always see fresh, trustworthy information.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Our mission is simple: help every Mumbaikar plan their commute smarter, avoid overcrowded platforms, and travel safely.
              </p>
            </div>

            {/* Contact Us */}
            <div className="bg-card border border-border rounded-xl p-5 space-y-3">
              <h3 className="text-base font-bold" style={{ fontFamily: "'Rajdhani', sans-serif" }}>📬 Contact Us</h3>
              <p className="text-sm text-muted-foreground">Have a suggestion, found a bug, or want to partner with us? We'd love to hear from you.</p>
              <div className="space-y-2">
                <a href="mailto:contact@mumbaikarlive.in"
                  className="flex items-center gap-3 p-3 rounded-xl bg-secondary border border-border hover:border-primary/40 transition-colors">
                  <MessageSquare className="w-4 h-4 text-primary shrink-0" />
                  <div>
                    <p className="text-sm font-semibold">Email Us</p>
                    <p className="text-xs text-muted-foreground">contact@mumbaikarlive.in</p>
                  </div>
                </a>
                <a href="https://wa.me/919999999999?text=Hi%20MumbaikarlLive%20Team" target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-xl bg-secondary border border-border hover:border-emerald-500/40 transition-colors">
                  <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold">WhatsApp</p>
                    <p className="text-xs text-muted-foreground">Message us on WhatsApp</p>
                  </div>
                </a>
              </div>
            </div>

            {/* Helpline numbers */}
            <div className="bg-card border border-border rounded-xl p-5 space-y-3">
              <h3 className="text-base font-bold" style={{ fontFamily: "'Rajdhani', sans-serif" }}>📞 Railway Helpline Numbers</h3>
              <p className="text-xs text-muted-foreground">Tap any number to call directly</p>
              <div className="space-y-2">
                {HELPLINES.map((h) => (
                  <a key={h.name} href={`tel:${h.number}`}
                    className="flex items-center justify-between p-3 rounded-xl bg-secondary border border-border hover:border-primary/40 hover:bg-primary/5 transition-colors group">
                    <div>
                      <p className="text-sm font-semibold group-hover:text-primary transition-colors">{h.name}</p>
                      <p className="text-xs text-muted-foreground">{h.desc}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-primary" style={{ fontFamily: "'Teko', sans-serif" }}>{h.number}</span>
                      <Phone className="w-4 h-4 text-primary" />
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Feedback Form */}
            <div className="bg-card border border-border rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-primary" />
                <h3 className="text-base font-bold" style={{ fontFamily: "'Rajdhani', sans-serif" }}>Send Feedback</h3>
              </div>
              <p className="text-xs text-muted-foreground">Help us improve MumbaikarlLive — report bugs, suggest features, or share your experience.</p>

              {feedbackSent ? (
                <div className="flex items-center gap-2 text-emerald-400 text-sm bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-3">
                  <CheckCircle2 className="w-4 h-4" /> Thank you for your feedback!
                </div>
              ) : (
                <>
                  <textarea
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder="Type your feedback here... (e.g. 'GPS verification not working at Andheri station')"
                    rows={4}
                    className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  />
                  <button onClick={handleFeedback} disabled={!feedbackText.trim()}
                    className="w-full py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{ fontFamily: "'Rajdhani', sans-serif", background: feedbackText.trim() ? "#f5820a" : undefined, color: feedbackText.trim() ? "#0b1120" : undefined, border: "1px solid rgba(245,130,10,0.3)" }}>
                    Send via WhatsApp
                  </button>
                </>
              )}
            </div>

            {/* Safety Guide */}
            <div className="bg-card border border-border rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-bold" style={{ fontFamily: "'Rajdhani', sans-serif" }}>Mumbai Commuter Safety Rules</h3>
              </div>
              <ul className="space-y-2 text-xs text-muted-foreground">
                {[
                  "Always stand behind the yellow safety line on platforms",
                  "Never board a moving local train — wait for the next one",
                  "Use foot overbridges (FOBs) to cross tracks, never walk across",
                  "Secure your UTS ticket or smart card before boarding",
                  "Allow alighting passengers to exit before boarding",
                  "Keep valuables secure in crowded trains — beware of pickpockets",
                  "In emergency, pull the chain and alert RPF (Railway Police)",
                ].map((rule) => (
                  <li key={rule} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                    {rule}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Ad Slot 2 */}
        <div className="my-6">
          <div className="border border-dashed border-border rounded-lg p-2.5 text-center text-xs text-muted-foreground bg-card">Advertisement</div>
        </div>

        {/* How It Works */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: "'Teko', sans-serif" }}>How It Works</h2>
          <div className="grid sm:grid-cols-3 gap-3">
            {[
              { icon: Smartphone, title: "1. Select Station", desc: "Pick your line and platform from 250+ stations across all Mumbai train networks." },
              { icon: Camera, title: "2. Photo + GPS", desc: "Snap a photo and confirm you are within 200m of the station. Status expires in 45 minutes automatically." },
              { icon: TrendingUp, title: "3. Check & Plan", desc: "See live crowd level and history. Earn badges for helping fellow commuters." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-card border border-border rounded-xl p-4 space-y-2">
                <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <h3 className="font-bold text-sm" style={{ fontFamily: "'Rajdhani', sans-serif" }}>{title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Ad Slot 3 */}
        <div className="mb-8">
          <div className="border border-dashed border-border rounded-lg p-2.5 text-center text-xs text-muted-foreground bg-card">Advertisement</div>
        </div>

        {/* FAQ */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: "'Teko', sans-serif" }}>FAQs</h2>
          <div className="space-y-2">
            {[
              { q: "Why does the status expire after 45 minutes?", a: "To keep data trustworthy. A report from 2 hours ago is useless for your commute right now. If status is older than 45 minutes, we automatically show 'Status Expired' so you always know if the data is fresh." },
              { q: "How do I earn badges?", a: "Submit verified crowd reports from actual stations. Your report count is saved on your device. Earn 'New Reporter' at 1 report, 'Station Reporter' at 5, 'Commuter Hero' at 20, and 'Mumbai Local Legend' at 50 reports." },
              { q: "How does GPS verification work?", a: "Your browser checks your current location. You must be within 200 metres of the selected station to submit a report. This prevents people from submitting fake reports from home." },
              { q: "Which lines are covered?", a: "Western Line (Churchgate–Virar), Central Line (CSMT–Kalyan), Harbour Line (CSMT–Panvel), Trans-Harbour Line, Metro Line 1, 2A & 7, and Metro Line 3 Aqua Line." },
              { q: "Is MumbaikarlLive free?", a: "Yes, completely free. No registration required. Built for Mumbai commuters by a Mumbaikar." },
            ].map((faq, i) => (
              <div key={i} className="bg-card border border-border rounded-xl overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-secondary/50 transition-colors">
                  <span className="text-sm font-semibold pr-4" style={{ fontFamily: "'Rajdhani', sans-serif" }}>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform ${openFaq === i ? "rotate-180" : ""}`} />
                </button>
                {openFaq === i && (
                  <div className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed border-t border-border pt-3">{faq.a}</div>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <p className="font-bold text-sm" style={{ fontFamily: "'Rajdhani', sans-serif", color: "#f5820a" }}>MumbaikarlLive</p>
              <p className="text-xs text-muted-foreground">Real-time crowd tracking for Mumbai commuters</p>
            </div>
            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
              <span>Privacy Policy</span>
              <span>Terms of Service</span>
              <button onClick={() => setActiveTab("helpline")} className="text-primary">About Us</button>
              <button onClick={() => setActiveTab("helpline")} className="text-primary">Contact Us</button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-4 border-t border-border pt-4">
            Disclaimer: All reports are crowdsourced — not official data from CR, WR, or MMRC. © 2026 MumbaikarlLive. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
