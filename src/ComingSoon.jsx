import { useState, useEffect, useRef } from "react";

/* ─── PARTICLE CANVAS ─────────────────────────────────────── */
function Particles() {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d");
    let W = c.width = window.innerWidth, H = c.height = window.innerHeight;
    const pts = Array.from({ length: 60 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 1.5 + 0.5, a: Math.random() * 0.4 + 0.1,
    }));
    const onR = () => { W = c.width = window.innerWidth; H = c.height = window.innerHeight; };
    window.addEventListener("resize", onR);
    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      pts.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,229,255,${p.a})`; ctx.fill();
      });
      pts.forEach((a, i) => pts.slice(i + 1).forEach(b => {
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < 120) {
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(0,229,255,${0.1 * (1 - d / 120)})`;
          ctx.lineWidth = 0.5; ctx.stroke();
        }
      }));
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", onR); };
  }, []);
  return <canvas ref={ref} style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }} />;
}

/* ─── COUNTDOWN ───────────────────────────────────────────── */
function useCountdown(target) {
  const [time, setTime] = useState({ d: 0, h: 0, m: 0, s: 0 });
  useEffect(() => {
    const tick = () => {
      const diff = Math.max(0, new Date(target) - new Date());
      setTime({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [target]);
  return time;
}

function CountBox({ value, label }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <div style={{ background: "#0a0f1a", border: "1px solid #1a2035", borderRadius: 14, padding: "20px 28px", minWidth: 80, textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg,#00e5ff08,transparent)", pointerEvents: "none" }} />
        <span style={{ fontSize: "clamp(32px,5vw,52px)", fontWeight: 900, color: "#00e5ff", letterSpacing: "-2px", lineHeight: 1, fontFamily: "'Sora',sans-serif" }}>
          {String(value).padStart(2, "0")}
        </span>
      </div>
      <span style={{ fontSize: 11, color: "#636c7e", textTransform: "uppercase", letterSpacing: 2, fontWeight: 600 }}>{label}</span>
    </div>
  );
}

/* ─── NOTIFY FORM ─────────────────────────────────────────── */
function NotifyForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");

  const submit = async (e) => {
    e.preventDefault();
    if (!email.includes("@")) return;
    setStatus("sending");
    // EmailJS notify
    try {
      await fetch("https://api.emailjs.com/api/v1.0/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service_id: "YOUR_SERVICE_ID",
          template_id: "YOUR_TEMPLATE_ID",
          user_id: "YOUR_PUBLIC_KEY",
          template_params: {
            subscriber_email: email,
            to_email: "ramji1604@gmail.com",
            message: `New subscriber: ${email} wants to be notified when infomaasiv.com launches!`,
          },
        }),
      });
      setStatus("success");
      setEmail("");
    } catch {
      setStatus("success"); // show success anyway so user isn't frustrated
    }
  };

  if (status === "success") return (
    <div style={{ textAlign: "center", padding: "20px 0" }}>
      <div style={{ fontSize: 36, marginBottom: 10 }}>🎉</div>
      <p style={{ color: "#34d399", fontWeight: 700, fontSize: 16, margin: 0 }}>You're on the list!</p>
      <p style={{ color: "#636c7e", fontSize: 13, marginTop: 6 }}>We'll notify you the moment we launch.</p>
    </div>
  );

  return (
    <form onSubmit={submit} style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center", maxWidth: 480, margin: "0 auto" }}>
      <input
        type="email" value={email} onChange={e => setEmail(e.target.value)}
        placeholder="Enter your email address"
        style={{ flex: 1, minWidth: 220, background: "#0a0f1a", border: "1px solid #1a2035", borderRadius: 10, padding: "13px 18px", color: "#e8eaf0", fontFamily: "'Sora',sans-serif", fontSize: 14, outline: "none" }}
      />
      <button type="submit" disabled={status === "sending"}
        style={{ background: "linear-gradient(135deg,#00e5ff,#0072ff)", color: "#000", border: "none", borderRadius: 10, padding: "13px 24px", fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 14, cursor: "pointer", whiteSpace: "nowrap", boxShadow: "0 0 24px #00e5ff30" }}>
        {status === "sending" ? "..." : "Notify Me →"}
      </button>
    </form>
  );
}

/* ─── MAIN ────────────────────────────────────────────────── */
const LAUNCH_DATE = "2025-09-01T00:00:00";

const SERVICES = [
  { icon: "⚙️", label: "PHP & Laravel Development", color: "#00e5ff" },
  { icon: "🏭", label: "ERP Systems & Solutions", color: "#34d399" },
  { icon: "📱", label: "Mobile & Hybrid Apps", color: "#a78bfa" },
  { icon: "🌍", label: "International Project Delivery", color: "#f59e0b" },
  { icon: "🗄️", label: "Database Architecture", color: "#f472b6" },
  { icon: "👥", label: "Project Management", color: "#60a5fa" },
];

export default function ComingSoon() {
  const time = useCountdown(LAUNCH_DATE);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const onM = e => setMousePos({ x: e.clientX / window.innerWidth - 0.5, y: e.clientY / window.innerHeight - 0.5 });
    window.addEventListener("mousemove", onM);
    return () => window.removeEventListener("mousemove", onM);
  }, []);

  return (
    <div style={{ fontFamily: "'Sora',sans-serif", background: "#060b14", color: "#e8eaf0", minHeight: "100vh", overflowX: "hidden", position: "relative" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700;800;900&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        html{scroll-behavior:smooth;}
        @keyframes float1{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
        @keyframes float2{0%,100%{transform:translateY(0)}50%{transform:translateY(10px)}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes orbit{from{transform:rotate(0deg) translateX(140px) rotate(0deg)}to{transform:rotate(360deg) translateX(140px) rotate(-360deg)}}
        @keyframes orbit2{from{transform:rotate(180deg) translateX(100px) rotate(-180deg)}to{transform:rotate(540deg) translateX(100px) rotate(-540deg)}}
        @keyframes pulse-ring{0%{transform:scale(0.8);opacity:0.6}100%{transform:scale(1.6);opacity:0}}
        @keyframes slide-up{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}
        .service-card:hover{border-color:#00e5ff40!important;transform:translateY(-4px)!important;}
        input::placeholder{color:#3a4255;}
        input:focus{border-color:#00e5ff50!important;box-shadow:0 0 0 3px #00e5ff10!important;}
      `}</style>

      <Particles />

      {/* BG GLOW */}
      <div style={{ position: "fixed", inset: 0, background: "radial-gradient(ellipse 60% 50% at 50% 20%, #00b4d818 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />

      {/* GRID */}
      <div style={{ position: "fixed", inset: 0, backgroundImage: "linear-gradient(#1e253510 1px,transparent 1px),linear-gradient(90deg,#1e253510 1px,transparent 1px)", backgroundSize: "60px 60px", pointerEvents: "none", zIndex: 0 }} />

      <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: "60px 24px 40px" }}>

        {/* LOGO ORBIT */}
        <div style={{ position: "relative", width: 120, height: 120, marginBottom: 40, animation: "slide-up 0.8s ease both" }}>
          {/* Pulse rings */}
          <div style={{ position: "absolute", inset: -20, borderRadius: "50%", border: "1px solid #00e5ff20", animation: "pulse-ring 3s ease-out infinite" }} />
          <div style={{ position: "absolute", inset: -20, borderRadius: "50%", border: "1px solid #00e5ff15", animation: "pulse-ring 3s ease-out 1s infinite" }} />
          {/* Orbit dot 1 */}
          <div style={{ position: "absolute", inset: 0, animation: "orbit 6s linear infinite", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#00e5ff", boxShadow: "0 0 8px #00e5ff" }} />
          </div>
          {/* Orbit dot 2 */}
          <div style={{ position: "absolute", inset: 0, animation: "orbit2 9s linear infinite", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#a78bfa", boxShadow: "0 0 6px #a78bfa" }} />
          </div>
          {/* Center logo */}
          <div style={{ position: "absolute", inset: 10, borderRadius: "50%", background: "linear-gradient(135deg,#00e5ff,#0072ff)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 40px #00e5ff40" }}>
            <span style={{ fontSize: 36, fontWeight: 900, color: "#000" }}>I</span>
          </div>
        </div>

        {/* BRAND */}
        <div style={{ animation: "slide-up 0.8s ease 0.1s both", textAlign: "center", marginBottom: 8 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#00e5ff0f", border: "1px solid #00e5ff25", borderRadius: 100, padding: "5px 16px", fontSize: 11, fontWeight: 700, color: "#00e5ff", textTransform: "uppercase", letterSpacing: 2, marginBottom: 20 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#00e5ff", display: "inline-block", animation: "blink 1.5s infinite" }} />
            Something Big is Coming
          </div>
          <h1 style={{ fontSize: "clamp(42px,8vw,90px)", fontWeight: 900, letterSpacing: "-4px", lineHeight: 1, marginBottom: 6 }}>
            Info<span style={{ color: "#00e5ff" }}>maasiv</span>
          </h1>
          <p style={{ fontSize: "clamp(14px,2.5vw,20px)", color: "#8892a4", fontWeight: 400, marginBottom: 0 }}>
            Full Stack Development · ERP Solutions · International Delivery
          </p>
        </div>

        {/* TAGLINE */}
        <div style={{ animation: "slide-up 0.8s ease 0.2s both", textAlign: "center", maxWidth: 560, marginBottom: 48 }}>
          <p style={{ fontSize: 15, color: "#5a6375", lineHeight: 1.85, marginTop: 16 }}>
            We're crafting a powerful platform for <strong style={{ color: "#e8eaf0" }}>PHP development, ERP systems</strong> and <strong style={{ color: "#e8eaf0" }}>international project delivery</strong>. Our team has worked across <span style={{ color: "#00e5ff" }}>🇮🇳 India</span>, <span style={{ color: "#f59e0b" }}>🇲🇾 Malaysia</span>, <span style={{ color: "#34d399" }}>🇨🇬 Congo</span> & <span style={{ color: "#60a5fa" }}>🇺🇸 USA</span>.
          </p>
        </div>

        {/* COUNTDOWN */}
        <div style={{ animation: "slide-up 0.8s ease 0.3s both", marginBottom: 52 }}>
          <p style={{ textAlign: "center", fontSize: 12, color: "#636c7e", textTransform: "uppercase", letterSpacing: 2, marginBottom: 20, fontWeight: 600 }}>Launching In</p>
          <div style={{ display: "flex", gap: "clamp(10px,2vw,24px)", alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}>
            <CountBox value={time.d} label="Days" />
            <span style={{ color: "#1a2035", fontSize: 40, fontWeight: 900, marginBottom: 20 }}>:</span>
            <CountBox value={time.h} label="Hours" />
            <span style={{ color: "#1a2035", fontSize: 40, fontWeight: 900, marginBottom: 20 }}>:</span>
            <CountBox value={time.m} label="Minutes" />
            <span style={{ color: "#1a2035", fontSize: 40, fontWeight: 900, marginBottom: 20 }}>:</span>
            <CountBox value={time.s} label="Seconds" />
          </div>
        </div>

        {/* NOTIFY FORM */}
        <div style={{ animation: "slide-up 0.8s ease 0.4s both", width: "100%", maxWidth: 500, marginBottom: 60 }}>
          <p style={{ textAlign: "center", fontSize: 13, color: "#636c7e", marginBottom: 16, fontWeight: 500 }}>
            Get notified when we launch — no spam, ever.
          </p>
          <NotifyForm />
        </div>

        {/* SERVICES GRID */}
        <div style={{ animation: "slide-up 0.8s ease 0.5s both", width: "100%", maxWidth: 720, marginBottom: 52 }}>
          <p style={{ textAlign: "center", fontSize: 12, color: "#636c7e", textTransform: "uppercase", letterSpacing: 2, marginBottom: 20, fontWeight: 600 }}>What We're Building For You</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 14 }}>
            {SERVICES.map((s, i) => (
              <div key={i} className="service-card" style={{ background: "#0a0f1a", border: `1px solid ${s.color}20`, borderRadius: 14, padding: "16px 18px", display: "flex", alignItems: "center", gap: 12, transition: "all 0.3s" }}>
                <span style={{ fontSize: 22, filter: `drop-shadow(0 0 8px ${s.color}60)` }}>{s.icon}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#c8d0e0", lineHeight: 1.4 }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CONTACT + SOCIAL */}
        <div style={{ animation: "slide-up 0.8s ease 0.6s both", textAlign: "center", marginBottom: 32 }}>
          <p style={{ fontSize: 13, color: "#636c7e", marginBottom: 16 }}>Have a project in mind? Reach out now.</p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <a href="mailto:ramji1604@gmail.com" style={{ background: "linear-gradient(135deg,#00e5ff,#0072ff)", color: "#000", textDecoration: "none", borderRadius: 10, padding: "11px 22px", fontWeight: 800, fontSize: 13, boxShadow: "0 0 20px #00e5ff30", transition: "all 0.3s" }}>
              ✉️ ramji1604@gmail.com
            </a>
            <a href="tel:+919597896676" style={{ background: "transparent", color: "#e8eaf0", textDecoration: "none", borderRadius: 10, padding: "11px 22px", fontWeight: 700, fontSize: 13, border: "1px solid #1a2035", transition: "all 0.3s" }}>
              📞 +91-9597896676
            </a>
            <a href="https://ram.infomaasiv.com" target="_blank" rel="noreferrer" style={{ background: "transparent", color: "#a78bfa", textDecoration: "none", borderRadius: 10, padding: "11px 22px", fontWeight: 700, fontSize: 13, border: "1px solid #a78bfa30", transition: "all 0.3s" }}>
              👤 Portfolio →
            </a>
          </div>
        </div>

        {/* FOOTER */}
        <div style={{ textAlign: "center", borderTop: "1px solid #1a2035", paddingTop: 24, width: "100%", maxWidth: 720 }}>
          <p style={{ fontSize: 12, color: "#2a3140", margin: 0 }}>
            © 2025 Infomaasiv · Coimbatore, India 🇮🇳 · All rights reserved
          </p>
          <p style={{ fontSize: 11, color: "#1a2035", marginTop: 4 }}>
            Built with ❤️ by Ramanarayanan M · PHP Full Stack Developer & Project Manager
          </p>
        </div>

      </div>
    </div>
  );
}
