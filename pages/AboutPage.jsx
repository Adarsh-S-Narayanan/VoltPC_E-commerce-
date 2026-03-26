import React, { useEffect, useRef, useState } from "react";
import PageHeader from "../components/PageHeader";

/* ─── Dark Leaflet map (OpenStreetMap, no API key needed) ─────────── */
const STORE_LAT  = 9.5516;   // Kanjirappally, Kerala
const STORE_LNG  = 76.7782;
const STORE_ZOOM = 15;

const DarkMap = () => {
  const containerRef = useRef(null);
  const mapRef       = useRef(null);

  useEffect(() => {
    // Dynamically load Leaflet CSS + JS only once
    const loadLeaflet = () =>
      new Promise((resolve) => {
        if (window.L) { resolve(window.L); return; }
        const link = document.createElement("link");
        link.rel   = "stylesheet";
        link.href  = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);

        const script    = document.createElement("script");
        script.src      = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
        script.onload   = () => resolve(window.L);
        document.head.appendChild(script);
      });

    loadLeaflet().then((L) => {
      if (mapRef.current) return; // already initialised

      const map = L.map(containerRef.current, {
        center: [STORE_LAT, STORE_LNG],
        zoom:   STORE_ZOOM,
        zoomControl: false,
        scrollWheelZoom: false,
      });

      mapRef.current = map;

      // Dark tile layer (CartoDB Dark Matter – no API key)
      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
          subdomains: "abcd",
          maxZoom: 20,
        }
      ).addTo(map);

      // Custom glow marker
      const glowIcon = L.divIcon({
        html: `
          <div style="position:relative;display:flex;align-items:center;justify-content:center;">
            <div style="
              width:48px;height:48px;
              background:rgba(123,29,205,0.25);
              border:2px solid rgba(123,29,205,0.8);
              border-radius:50%;
              display:flex;align-items:center;justify-content:center;
              box-shadow:0 0 20px rgba(123,29,205,0.6),0 0 40px rgba(123,29,205,0.3);
              animation:ping 2s cubic-bezier(0,0,0.2,1) infinite;
            ">
              <img src="/logofinal.svg" style="width:22px;height:22px;object-fit:contain;filter:drop-shadow(0 0 8px rgba(123,29,205,0.8));" />
            </div>
            <div style="
              position:absolute;
              width:72px;height:72px;
              background:rgba(123,29,205,0.12);
              border-radius:50%;
              top:50%;left:50%;
              transform:translate(-50%,-50%);
              animation:pulse-ring 2s ease-out infinite;
            "></div>
          </div>
          <style>
            @keyframes pulse-ring{0%{transform:translate(-50%,-50%) scale(0.8);opacity:0.6}100%{transform:translate(-50%,-50%) scale(1.8);opacity:0}}
          </style>`,
        className: "",
        iconSize:   [72, 72],
        iconAnchor: [36, 36],
        popupAnchor:[0, -40],
      });

      L.marker([STORE_LAT, STORE_LNG], { icon: glowIcon })
        .addTo(map)
        .bindPopup(
          `<div style="
            background:#1a0a2e;
            border:1px solid rgba(123,29,205,0.5);
            border-radius:12px;
            color:#e2e8f0;
            padding:14px 18px;
            font-family:inherit;
            min-width:200px;
            box-shadow:0 0 24px rgba(123,29,205,0.3);
          ">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
              <img src="/logofinal.svg" style="width:20px;height:20px;object-fit:contain;" />
              <span style="font-weight:900;font-size:14px;text-transform:uppercase;letter-spacing:0.1em;">VoltPC Engineering</span>
            </div>
            <div style="color:#a78bfa;font-size:12px;line-height:1.6;">
              Kanjirappally, Kottayam<br/>Kerala, India — 686507
            </div>
            <div style="margin-top:10px;font-size:11px;color:#7b1dcd;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;">
              Get Directions ↗
            </div>
          </div>`,
          {
            className: "volt-popup",
          }
        )
        .openPopup();

      // Zoom control in bottom-right
      L.control.zoom({ position: "bottomright" }).addTo(map);
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ height: "100%", width: "100%", borderRadius: "inherit" }}
    />
  );
};

/* ─── Animated count-up for stats ──────────────────────────────────── */
const StatCard = ({ value, label }) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.3 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`text-center transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
    >
      <div className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400 mb-2">
        {value}
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-[0.2em]">
        {label}
      </div>
    </div>
  );
};

/* ─── Value card ────────────────────────────────────────────────────── */
const ValueCard = ({ icon, title, desc }) => (
  <div className="group bg-white dark:bg-surface-dark border border-black/5 dark:border-white/5 rounded-2xl p-8 hover:border-primary dark:hover:border-primary/50 shadow-light-card dark:shadow-none transition-all duration-300 hover:-translate-y-1">
    <span className="material-symbols-outlined text-4xl text-primary mb-5 group-hover:scale-110 transition-transform inline-block">
      {icon}
    </span>
    <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight mb-3">
      {title}
    </h3>
    <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{desc}</p>
  </div>
);

/* ─── Team card ─────────────────────────────────────────────────────── */
const TeamCard = ({ name, role, avatar, bio }) => (
  <div className="group flex flex-col items-center text-center bg-white dark:bg-surface-dark border border-black/5 dark:border-white/5 rounded-2xl p-8 hover:border-primary dark:hover:border-primary/50 shadow-light-card dark:shadow-none transition-all duration-300 hover:-translate-y-1">
    <div className="relative mb-6">
      <img
        src={avatar}
        alt={name}
        className="w-24 h-24 rounded-full object-cover ring-2 ring-primary/30 group-hover:ring-primary transition-all duration-300"
      />
      <div className="absolute inset-0 rounded-full bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </div>
    <h3 className="font-black text-gray-900 dark:text-white text-lg tracking-tight">{name}</h3>
    <span className="text-primary text-xs font-bold uppercase tracking-[0.2em] mt-1 mb-4">{role}</span>
    <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{bio}</p>
  </div>
);

/* ─── Main page ─────────────────────────────────────────────────────── */
const AboutPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // XMLHttpRequest for AJAX data loading
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "/data/aboutData.json", true);
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          try {
            const jsonData = JSON.parse(xhr.responseText);
            setData(jsonData);
            setLoading(false);
          } catch (e) {
            console.error("Error parsing JSON:", e);
            setError("Failed to parse page data.");
            setLoading(false);
          }
        } else {
          console.error("AJAX Error:", xhr.statusText);
          setError("Failed to load page content.");
          setLoading(false);
        }
      }
    };
    xhr.send();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <span className="text-primary font-black uppercase tracking-widest text-xs">Loading Story...</span>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center p-6 text-center">
        <div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-4">OOPS! SOMETHING WENT WRONG.</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8">{error || "Could not load the page content."}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-8 py-3 bg-primary text-white font-black uppercase tracking-widest text-sm rounded-xl shadow-glow"
          >
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 bg-background-light dark:bg-background-dark min-h-screen transition-colors duration-300">
      {/* ── Hero ── */}
      <div className="relative overflow-hidden border-b border-black/5 dark:border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(123,29,205,0.12)_0%,transparent_60%)] pointer-events-none" />
        <div className="max-w-[1440px] mx-auto px-6 py-20 md:py-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-black tracking-[0.2em] uppercase mb-8">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              {data.hero.badge}
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-gray-900 dark:text-white leading-[0.9] tracking-tighter mb-8">
              {data.hero.titleLine1}{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">
                {data.hero.titleHighlight1}
              </span>
              <br />
              {data.hero.titleLine2}{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">
                {data.hero.titleHighlight2}
              </span>
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg md:text-xl leading-relaxed max-w-2xl">
              {data.hero.description}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 py-16 space-y-24">

        {/* ── Stats ── */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {data.stats.map((s) => (
            <StatCard key={s.label} value={s.value} label={s.label} />
          ))}
        </section>

        {/* ── Mission ── */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-primary text-xs font-black uppercase tracking-[0.3em] block mb-4">
              {data.mission.badge}
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight leading-tight mb-6">
              {data.mission.title.split('APEX')[0]}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">
                APEX
              </span>{" "}
              {data.mission.title.split('APEX')[1]}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed mb-6">
              {data.mission.description1}
            </p>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              {data.mission.description2}
            </p>
          </div>
          <div className="relative aspect-video rounded-3xl overflow-hidden bg-surface-dark border border-white/5 shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-purple-900/10 to-transparent pointer-events-none z-10 rounded-3xl" />
            <span className="material-symbols-outlined absolute bottom-6 right-6 text-[160px] opacity-10 text-primary select-none z-0">
              memory
            </span>
            <div className="relative z-10 flex flex-col items-start justify-end h-full p-10">
              <div className="text-white font-black text-2xl leading-tight whitespace-pre-line">
                "{data.mission.quote}"
              </div>
              <div className="text-primary text-xs font-bold uppercase tracking-[0.2em] mt-3">
                {data.mission.quoteAuthor}
              </div>
            </div>
          </div>
        </section>

        {/* ── Values ── */}
        <section>
          <div className="flex items-center gap-4 mb-12">
            <span className="text-primary text-xs font-black uppercase tracking-[0.3em]">
              What We Stand For
            </span>
            <div className="h-px flex-1 bg-primary/10" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {data.values.map((v) => (
              <ValueCard key={v.title} {...v} />
            ))}
          </div>
        </section>

        {/* ── Team ── */}
        <section>
          <div className="flex items-center gap-4 mb-12">
            <span className="text-primary text-xs font-black uppercase tracking-[0.3em]">
              The Engineers
            </span>
            <div className="h-px flex-1 bg-primary/10" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.team.map((t) => (
              <TeamCard key={t.name} {...t} />
            ))}
          </div>
        </section>

        {/* ── Store Location ── */}
        <section>
          <div className="flex items-center gap-4 mb-12">
            <span className="text-primary text-xs font-black uppercase tracking-[0.3em]">
              {data.location.badge}
            </span>
            <div className="h-px flex-1 bg-primary/10" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
            {/* Info panel */}
            <div className="lg:col-span-1 flex flex-col gap-6">
              <div className="bg-white dark:bg-surface-dark border border-black/5 dark:border-white/5 rounded-2xl p-8 shadow-light-card dark:shadow-none">
                <div className="flex items-center gap-3 mb-6">
                  <span className="material-symbols-outlined text-primary text-3xl">store</span>
                  <h3 className="font-black text-gray-900 dark:text-white text-xl uppercase tracking-tight">
                    {data.location.title}
                  </h3>
                </div>

                <InfoRow icon="location_on" label="Address">
                  {data.location.addressLines.map((line, i) => (
                    <React.Fragment key={i}>
                      {line}{i < data.location.addressLines.length - 1 && <br />}
                    </React.Fragment>
                  ))}
                </InfoRow>
                <InfoRow icon="schedule" label="Hours">
                  {data.location.hoursLines.map((line, i) => (
                    <React.Fragment key={i}>
                      {line}{i < data.location.hoursLines.length - 1 && <br />}
                    </React.Fragment>
                  ))}
                </InfoRow>
                <InfoRow icon="call" label="Phone">
                  {data.location.phone}
                </InfoRow>
                <InfoRow icon="mail" label="Email">
                  {data.location.email}
                </InfoRow>

                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${STORE_LAT},${STORE_LNG}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-8 w-full flex items-center justify-center gap-2 bg-primary hover:bg-[#6a19b0] text-white py-3 px-6 rounded-xl font-black uppercase tracking-widest text-sm shadow-glow hover:shadow-glow-hover transition-all duration-300 active:scale-95"
                >
                  <span className="material-symbols-outlined text-sm">directions</span>
                  Open in Google Maps
                </a>
              </div>

              {/* Badge */}
              <div className="bg-gradient-to-br from-primary/10 to-purple-900/10 border border-primary/20 rounded-2xl p-6 flex items-center gap-4">
                <span className="material-symbols-outlined text-primary text-4xl">verified</span>
                <div>
                  <div className="font-black text-gray-900 dark:text-white text-sm uppercase tracking-wide">
                    {data.location.mapBadgeTitle}
                  </div>
                  <div className="text-gray-500 dark:text-gray-400 text-xs mt-1 leading-relaxed">
                    {data.location.mapBadgeDesc}
                  </div>
                </div>
              </div>
            </div>

            {/* Dark Map */}
            <div className="lg:col-span-2 rounded-2xl overflow-hidden border border-black/5 dark:border-white/5 shadow-light-card dark:shadow-none"
              style={{ minHeight: "420px" }}>
              {/* Inline popup styles so Leaflet's popup looks correct */}
              <style>{`
                .volt-popup .leaflet-popup-content-wrapper {
                  background: transparent;
                  border: none;
                  box-shadow: none;
                  padding: 0;
                }
                .volt-popup .leaflet-popup-content {
                  margin: 0;
                }
                .volt-popup .leaflet-popup-tip-container {
                  display: none;
                }
                .leaflet-control-zoom a {
                  background: #1a0a2e !important;
                  color: #a78bfa !important;
                  border-color: rgba(123,29,205,0.4) !important;
                }
                .leaflet-control-zoom a:hover {
                  background: rgba(123,29,205,0.3) !important;
                  color: #fff !important;
                }
                .leaflet-control-attribution {
                  background: rgba(10,0,20,0.7) !important;
                  color: #666 !important;
                  font-size: 9px !important;
                }
                .leaflet-control-attribution a { color: #7b1dcd !important; }
              `}</style>
              <DarkMap />
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

/* ─── Info row helper ───────────────────────────────────────────────── */
const InfoRow = ({ icon, label, children }) => (
  <div className="flex gap-4 mb-5">
    <span className="material-symbols-outlined text-primary text-xl mt-0.5 shrink-0">{icon}</span>
    <div>
      <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-0.5">
        {label}
      </div>
      <div className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">{children}</div>
    </div>
  </div>
);

export default AboutPage;
