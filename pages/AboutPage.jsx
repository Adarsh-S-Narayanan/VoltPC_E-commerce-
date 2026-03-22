import React, { useEffect, useRef, useState } from "react";
import PageHeader from "../components/PageHeader";

/* ─── Static data ──────────────────────────────────────────────────── */
const STATS = [
  { value: "2019", label: "Founded" },
  { value: "500+", label: "Rigs Built" },
  { value: "98%", label: "Satisfaction" },
  { value: "24/7", label: "Support" },
];

const VALUES = [
  {
    icon: "precision_manufacturing",
    title: "Precision Craft",
    desc: "Every build is hand-assembled, cable-managed, and stress tested for 72 hours before it leaves our workshop.",
  },
  {
    icon: "bolt",
    title: "Performance First",
    desc: "We source only top-tier components and validate thermal performance at every voltage level.",
  },
  {
    icon: "support_agent",
    title: "Lifetime Support",
    desc: "Our engineers are reachable 24/7. We stand behind every rig with a 3-year warranty and free tune-ups.",
  },
  {
    icon: "eco",
    title: "Sustainable Tech",
    desc: "Responsible sourcing, eco packaging, and a recycling programme for old components – tech without guilt.",
  },
];

const TEAM = [
  {
    name: "Adarsh S. Narayanan",
    role: "Founder & Lead Engineer",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
    bio: "10+ years building extreme performance rigs for gamers and creators across South India.",
  },
  {
    name: "Rhea Menon",
    role: "Hardware Architect",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
    bio: "Specialises in thermal dynamics and custom water-cooling loop design.",
  },
  {
    name: "Kiran Dev",
    role: "BIOS & Overclocking",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200",
    bio: "Certfied AMD & Intel partner engineer. Benchmarks on weekends for fun.",
  },
];

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
              <img src="/logo.png" style="width:22px;height:22px;object-fit:contain;filter:drop-shadow(0 0 8px rgba(123,29,205,0.8));" />
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
              <img src="/logo.png" style="width:20px;height:20px;object-fit:contain;" />
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
  return (
    <div className="pt-20 bg-background-light dark:bg-background-dark min-h-screen transition-colors duration-300">
      {/* ── Hero ── */}
      <div className="relative overflow-hidden border-b border-black/5 dark:border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(123,29,205,0.12)_0%,transparent_60%)] pointer-events-none" />
        <div className="max-w-[1440px] mx-auto px-6 py-20 md:py-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-black tracking-[0.2em] uppercase mb-8">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Our Story
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-gray-900 dark:text-white leading-[0.9] tracking-tighter mb-8">
              BUILT IN{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">
                KERALA.
              </span>
              <br />
              BUILT FOR THE{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">
                WORLD.
              </span>
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg md:text-xl leading-relaxed max-w-2xl">
              VoltPC Engineering was born in Kanjirappally, Kerala — a small town with
              a massive passion for technology. We set out to prove that world-class
              custom PCs don't have to come from a big city.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 py-16 space-y-24">

        {/* ── Stats ── */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((s) => (
            <StatCard key={s.label} value={s.value} label={s.label} />
          ))}
        </section>

        {/* ── Mission ── */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-primary text-xs font-black uppercase tracking-[0.3em] block mb-4">
              Our Mission
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight leading-tight mb-6">
              ENGINEERING THE{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">
                APEX
              </span>{" "}
              OF PERSONAL COMPUTING
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed mb-6">
              Every VoltPC is a precision instrument — hand-assembled, individually
              stress-tested, and shipped with a configuration report. We believe gaming
              and creative power should be accessible to everyone, not just those in
              metro cities.
            </p>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              From our workshop in Kanjirappally, we ship to customers across India.
              Each rig carries a slice of Kerala's innovation spirit inside its chassis.
            </p>
          </div>
          <div className="relative aspect-video rounded-3xl overflow-hidden bg-surface-dark border border-white/5 shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-purple-900/10 to-transparent pointer-events-none z-10 rounded-3xl" />
            <span className="material-symbols-outlined absolute bottom-6 right-6 text-[160px] opacity-10 text-primary select-none z-0">
              memory
            </span>
            <div className="relative z-10 flex flex-col items-start justify-end h-full p-10">
              <div className="text-white font-black text-2xl leading-tight">
                "Every component has a purpose.<br />
                Every build tells a story."
              </div>
              <div className="text-primary text-xs font-bold uppercase tracking-[0.2em] mt-3">
                — Adarsh, Founder
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
            {VALUES.map((v) => (
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
            {TEAM.map((t) => (
              <TeamCard key={t.name} {...t} />
            ))}
          </div>
        </section>

        {/* ── Store Location ── */}
        <section>
          <div className="flex items-center gap-4 mb-12">
            <span className="text-primary text-xs font-black uppercase tracking-[0.3em]">
              Find Us
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
                    VoltPC Workshop
                  </h3>
                </div>

                <InfoRow icon="location_on" label="Address">
                  Kanjirappally, Kottayam<br />
                  Kerala, India — 686507
                </InfoRow>
                <InfoRow icon="schedule" label="Hours">
                  Mon – Sat: 10 AM – 7 PM<br />
                  Sunday: 11 AM – 4 PM
                </InfoRow>
                <InfoRow icon="call" label="Phone">
                  +91 98765 43210
                </InfoRow>
                <InfoRow icon="mail" label="Email">
                  vaultpcgo@gmail.com
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
                    Authorised Service Centre
                  </div>
                  <div className="text-gray-500 dark:text-gray-400 text-xs mt-1 leading-relaxed">
                    Certified AMD & Intel partner workshop
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
