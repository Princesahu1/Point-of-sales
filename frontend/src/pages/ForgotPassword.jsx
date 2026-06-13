import { useState, useEffect, useRef } from "react";

const STEPS = ["Enter Email", "Verify OTP", "New Password"];

const BoltIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" width="32" height="32">
    <path d="M13 2L4.5 13.5H11L10 22L19.5 10.5H13L13 2Z" fill="white" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
  </svg>
);

const MailIcon = ({ size = 16, color = "currentColor" }) => (
  <svg viewBox="0 0 24 24" fill="none" width={size} height={size} stroke={color} strokeWidth="2">
    <rect x="2" y="4" width="20" height="16" rx="3"/>
    <path d="M2 8l10 6 10-6"/>
  </svg>
);

const ShieldIcon = ({ size = 14 }) => (
  <svg viewBox="0 0 24 24" fill="none" width={size} height={size} stroke="currentColor" strokeWidth="2">
    <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.25C18.25 22.15 22 17.25 22 12V7l-9-5z"/>
    <path d="M9 12l2 2 4-4"/>
  </svg>
);

const KeyIcon = ({ size = 14 }) => (
  <svg viewBox="0 0 24 24" fill="none" width={size} height={size} stroke="currentColor" strokeWidth="2">
    <circle cx="7.5" cy="15.5" r="5.5"/>
    <path d="M21 2l-9.6 9.6M15.5 7.5l3 3"/>
  </svg>
);

const EyeIcon = ({ open }) => (
  <svg viewBox="0 0 24 24" fill="none" width="16" height="16" stroke="currentColor" strokeWidth="2">
    {open ? (
      <>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
        <circle cx="12" cy="12" r="3"/>
      </>
    ) : (
      <>
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
        <line x1="1" y1="1" x2="23" y2="23"/>
      </>
    )}
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" width="48" height="48" stroke="#4ade80" strokeWidth="2.5">
    <circle cx="12" cy="12" r="10"/>
    <path d="M8 12l3 3 5-5"/>
  </svg>
);

const ArrowLeft = () => (
  <svg viewBox="0 0 24 24" fill="none" width="14" height="14" stroke="currentColor" strokeWidth="2">
    <path d="M19 12H5M12 5l-7 7 7 7"/>
  </svg>
);

const Spinner = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="white" strokeWidth="2.5">
    <circle cx="12" cy="12" r="10" strokeOpacity="0.25"/>
    <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round">
      <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.8s" repeatCount="indefinite"/>
    </path>
  </svg>
);

// Step indicator icons
const stepIcons = [MailIcon, ShieldIcon, KeyIcon];

export default function ForgotPassword() {
  const [step, setStep] = useState(0);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [status, setStatus] = useState("idle"); // idle | sending | error_not_found | error_server | success
  const [countdown, setCountdown] = useState(0);
  const [done, setDone] = useState(false);
  const otpRefs = useRef([]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [countdown]);

  const simulateSendOtp = () => {
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setStatus("error_not_found");
      return;
    }
    setStatus("sending");
    setTimeout(() => {
      // Simulate: emails with "error" → server error, "notfound" → not found
      if (email.toLowerCase().includes("error")) {
        setStatus("error_server");
      } else if (email.toLowerCase().includes("notfound")) {
        setStatus("error_not_found");
      } else {
        setStatus("idle");
        setStep(1);
        setCountdown(30);
      }
    }, 1800);
  };

  const simulateVerifyOtp = () => {
    setStatus("sending");
    setTimeout(() => {
      const code = otp.join("");
      if (code === "000000") {
        setStatus("error_server");
      } else if (code.length < 6) {
        setStatus("error_not_found");
      } else {
        setStatus("idle");
        setStep(2);
      }
    }, 1500);
  };

  const simulateReset = () => {
    if (password !== confirm || password.length < 6) {
      setStatus("error_not_found");
      return;
    }
    setStatus("sending");
    setTimeout(() => {
      setStatus("idle");
      setDone(true);
    }, 1500);
  };

  const handleOtpChange = (i, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[i] = val;
    setOtp(next);
    if (val && i < 5) otpRefs.current[i + 1]?.focus();
  };

  const handleOtpKey = (i, e) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) {
      otpRefs.current[i - 1]?.focus();
    }
  };

  const resend = () => {
    if (countdown > 0) return;
    setStatus("sending");
    setTimeout(() => {
      setStatus("idle");
      setCountdown(30);
    }, 1200);
  };

  const resetError = () => setStatus("idle");

  const errorMsg = {
    error_not_found: step === 0
      ? "No account found with this Gmail address."
      : step === 1
      ? "Invalid OTP. Please check and try again."
      : "Passwords don't match or are too short (min 6 chars).",
    error_server: "Server error. Please try again later.",
  }[status] || "";

  if (done) {
    return (
      <div style={styles.page}>
        <div style={styles.successCard}>
          <div style={{ marginBottom: 16 }}><CheckIcon /></div>
          <h2 style={styles.successTitle}>Password Reset!</h2>
          <p style={styles.successSub}>Your password has been successfully updated. You can now log in.</p>
          <button style={styles.primaryBtn} onClick={() => { setDone(false); setStep(0); setEmail(""); setStatus("idle"); }}>
            ← Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {/* Ambient blobs */}
      <div style={styles.blob1} />
      <div style={styles.blob2} />

      <div style={styles.container}>
        {/* Logo */}
        <div style={styles.logo}><BoltIcon /></div>

        {/* Title */}
        <h1 style={styles.title}>Forgot Password</h1>
        <p style={styles.subtitle}>Reset your password via Gmail OTP</p>

        {/* Step Bar */}
        <div style={styles.stepBar}>
          {STEPS.map((label, i) => {
            const Icon = stepIcons[i];
            const active = i === step;
            const done = i < step;
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ ...styles.stepChip, ...(active ? styles.stepActive : done ? styles.stepDone : styles.stepInactive) }}>
                    <Icon size={13} color={active ? "white" : done ? "#4ade80" : "#6b7280"} />
                    <span style={{ fontSize: 12, fontWeight: 600 }}>{label}</span>
                  </div>
                </div>
                {i < STEPS.length - 1 && <div style={{ ...styles.stepLine, ...(done ? styles.stepLineDone : {}) }} />}
              </div>
            );
          })}
        </div>

        {/* Card */}
        <div style={styles.card}>
          {/* Step 0 — Email */}
          {step === 0 && (
            <>
              <h3 style={styles.cardTitle}>Enter your Gmail address</h3>
              <p style={styles.cardSub}>We'll send a 6-digit OTP to this email.</p>

              <label style={styles.label}>Email Address</label>
              <div style={{ ...styles.inputWrap, ...(status === "error_not_found" || status === "error_server" ? styles.inputError : {}) }}>
                <MailIcon size={16} color="#9ca3af" />
                <input
                  style={styles.input}
                  type="email"
                  placeholder="you@gmail.com"
                  value={email}
                  onChange={e => { setEmail(e.target.value); resetError(); }}
                  onKeyDown={e => e.key === "Enter" && simulateSendOtp()}
                />
              </div>

              {errorMsg && <ErrorBanner msg={errorMsg} />}

              <button
                style={{ ...styles.primaryBtn, ...(status === "sending" ? styles.btnDisabled : {}) }}
                onClick={simulateSendOtp}
                disabled={status === "sending"}
              >
                {status === "sending" ? <><Spinner /> Sending…</> : "Send OTP"}
              </button>
            </>
          )}

          {/* Step 1 — OTP */}
          {step === 1 && (
            <>
              <h3 style={styles.cardTitle}>Verify OTP</h3>
              <p style={styles.cardSub}>Enter the 6-digit code sent to <strong style={{ color: "#e2e8f0" }}>{email}</strong></p>

              <div style={styles.otpRow}>
                {otp.map((v, i) => (
                  <input
                    key={i}
                    ref={el => (otpRefs.current[i] = el)}
                    style={{ ...styles.otpBox, ...(status === "error_not_found" || status === "error_server" ? styles.otpError : v ? styles.otpFilled : {}) }}
                    maxLength={1}
                    value={v}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    onKeyDown={e => handleOtpKey(i, e)}
                    inputMode="numeric"
                    autoFocus={i === 0}
                  />
                ))}
              </div>

              {errorMsg && <ErrorBanner msg={errorMsg} />}

              <button
                style={{ ...styles.primaryBtn, ...(status === "sending" ? styles.btnDisabled : {}) }}
                onClick={simulateVerifyOtp}
                disabled={status === "sending"}
              >
                {status === "sending" ? <><Spinner /> Verifying…</> : "Verify OTP"}
              </button>

              <p style={styles.resendRow}>
                Didn't receive it?{" "}
                <button
                  style={{ ...styles.linkBtn, ...(countdown > 0 ? { opacity: 0.4, cursor: "default" } : {}) }}
                  onClick={resend}
                  disabled={countdown > 0 || status === "sending"}
                >
                  {countdown > 0 ? `Resend in ${countdown}s` : status === "sending" ? "Sending…" : "Resend OTP"}
                </button>
              </p>
            </>
          )}

          {/* Step 2 — New Password */}
          {step === 2 && (
            <>
              <h3 style={styles.cardTitle}>Create New Password</h3>
              <p style={styles.cardSub}>Choose a strong password for your account.</p>

              <label style={styles.label}>New Password</label>
              <div style={{ ...styles.inputWrap, ...(status === "error_not_found" ? styles.inputError : {}) }}>
                <KeyIcon size={16} />
                <input
                  style={{ ...styles.input, color: "#e2e8f0" }}
                  type={showPw ? "text" : "password"}
                  placeholder="Min. 6 characters"
                  value={password}
                  onChange={e => { setPassword(e.target.value); resetError(); }}
                />
                <button style={styles.eyeBtn} onClick={() => setShowPw(p => !p)}><EyeIcon open={showPw} /></button>
              </div>

              <label style={{ ...styles.label, marginTop: 12 }}>Confirm Password</label>
              <div style={{ ...styles.inputWrap, ...(status === "error_not_found" ? styles.inputError : {}) }}>
                <KeyIcon size={16} />
                <input
                  style={{ ...styles.input, color: "#e2e8f0" }}
                  type={showConfirm ? "text" : "password"}
                  placeholder="Repeat password"
                  value={confirm}
                  onChange={e => { setConfirm(e.target.value); resetError(); }}
                  onKeyDown={e => e.key === "Enter" && simulateReset()}
                />
                <button style={styles.eyeBtn} onClick={() => setShowConfirm(p => !p)}><EyeIcon open={showConfirm} /></button>
              </div>

              {/* Strength meter */}
              {password && (
                <div style={{ marginTop: 8 }}>
                  <div style={styles.strengthBar}>
                    {[1,2,3,4].map(n => (
                      <div key={n} style={{ ...styles.strengthSeg, backgroundColor: strengthColor(password, n) }} />
                    ))}
                  </div>
                  <p style={{ ...styles.cardSub, marginTop: 4, color: strengthColor(password, strengthScore(password)) }}>
                    {["", "Weak", "Fair", "Good", "Strong"][strengthScore(password)]}
                  </p>
                </div>
              )}

              {errorMsg && <ErrorBanner msg={errorMsg} />}

              <button
                style={{ ...styles.primaryBtn, marginTop: 20, ...(status === "sending" ? styles.btnDisabled : {}) }}
                onClick={simulateReset}
                disabled={status === "sending"}
              >
                {status === "sending" ? <><Spinner /> Resetting…</> : "Reset Password"}
              </button>
            </>
          )}
        </div>

        {/* Back link */}
        <button style={styles.backLink} onClick={() => { if (step > 0) { setStep(s => s - 1); setStatus("idle"); } }}>
          <ArrowLeft /> {step === 0 ? "Back to Login" : "Go Back"}
        </button>

        {/* Demo hint */}
        <p style={styles.hint}>
          Demo: use <code style={styles.code}>notfound@...</code> or <code style={styles.code}>error@...</code> to trigger error states
        </p>
      </div>
    </div>
  );
}

function ErrorBanner({ msg }) {
  return (
    <div style={styles.errorBanner}>
      <svg viewBox="0 0 24 24" fill="none" width="15" height="15" stroke="#f87171" strokeWidth="2" style={{ flexShrink: 0 }}>
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <span>{msg}</span>
    </div>
  );
}

function strengthScore(pw) {
  let s = 0;
  if (pw.length >= 6) s++;
  if (pw.length >= 10) s++;
  if (/[A-Z]/.test(pw) && /[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return Math.max(1, s);
}

function strengthColor(pw, n) {
  const score = strengthScore(pw);
  if (n > score) return "#374151";
  return ["", "#ef4444", "#f59e0b", "#84cc16", "#22c55e"][score] || "#374151";
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0f111a 0%, #131629 50%, #0d0f1c 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    position: "relative",
    overflow: "hidden",
    padding: "20px",
  },
  blob1: {
    position: "absolute", bottom: "5%", left: "5%",
    width: 300, height: 300, borderRadius: "50%",
    background: "radial-gradient(circle, rgba(99,51,255,0.18) 0%, transparent 70%)",
    filter: "blur(40px)", pointerEvents: "none",
  },
  blob2: {
    position: "absolute", top: "10%", right: "8%",
    width: 200, height: 200, borderRadius: "50%",
    background: "radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)",
    filter: "blur(40px)", pointerEvents: "none",
  },
  container: {
    display: "flex", flexDirection: "column", alignItems: "center",
    width: "100%", maxWidth: 480, position: "relative", zIndex: 1,
  },
  logo: {
    width: 64, height: 64, borderRadius: 18,
    background: "linear-gradient(135deg, #3b82f6, #2563eb)",
    display: "flex", alignItems: "center", justifyContent: "center",
    marginBottom: 20,
    boxShadow: "0 8px 32px rgba(59,130,246,0.4)",
  },
  title: {
    color: "#f1f5f9", fontSize: 26, fontWeight: 700,
    margin: "0 0 6px", letterSpacing: "-0.5px",
  },
  subtitle: {
    color: "#94a3b8", fontSize: 14, margin: "0 0 24px",
  },
  stepBar: {
    display: "flex", alignItems: "center",
    gap: 4, marginBottom: 24, flexWrap: "wrap", justifyContent: "center",
  },
  stepChip: {
    display: "flex", alignItems: "center", gap: 5,
    padding: "6px 12px", borderRadius: 999, border: "1px solid",
    transition: "all 0.3s ease",
  },
  stepActive: {
    background: "rgba(59,130,246,0.2)", borderColor: "#3b82f6", color: "white",
  },
  stepDone: {
    background: "rgba(74,222,128,0.1)", borderColor: "rgba(74,222,128,0.3)", color: "#4ade80",
  },
  stepInactive: {
    background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)", color: "#6b7280",
  },
  stepLine: {
    width: 28, height: 1.5, background: "rgba(255,255,255,0.1)", borderRadius: 2,
    transition: "background 0.3s",
  },
  stepLineDone: { background: "rgba(74,222,128,0.4)" },
  card: {
    width: "100%", background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 16, padding: "28px 32px",
    backdropFilter: "blur(12px)",
    boxShadow: "0 24px 64px rgba(0,0,0,0.4)",
  },
  cardTitle: {
    color: "#f1f5f9", fontSize: 17, fontWeight: 700, margin: "0 0 6px",
  },
  cardSub: {
    color: "#94a3b8", fontSize: 13, margin: "0 0 20px", lineHeight: 1.5,
  },
  label: {
    display: "block", color: "#cbd5e1", fontSize: 13, fontWeight: 500,
    marginBottom: 8,
  },
  inputWrap: {
    display: "flex", alignItems: "center", gap: 10,
    background: "rgba(255,255,255,0.07)",
    border: "1.5px solid rgba(255,255,255,0.1)",
    borderRadius: 10, padding: "10px 14px",
    transition: "border-color 0.2s",
    marginBottom: 4,
  },
  inputError: { borderColor: "rgba(248,113,113,0.6)" },
  input: {
    flex: 1, background: "transparent", border: "none", outline: "none",
    color: "#e2e8f0", fontSize: 14,
  },
  eyeBtn: {
    background: "none", border: "none", cursor: "pointer",
    color: "#6b7280", display: "flex", alignItems: "center", padding: 0,
  },
  errorBanner: {
    display: "flex", alignItems: "center", gap: 8,
    background: "rgba(248,113,113,0.1)",
    border: "1px solid rgba(248,113,113,0.3)",
    borderRadius: 8, padding: "9px 12px",
    color: "#fca5a5", fontSize: 13, marginTop: 10,
  },
  primaryBtn: {
    width: "100%", marginTop: 18,
    background: "linear-gradient(135deg, #3b82f6, #2563eb)",
    color: "white", border: "none", borderRadius: 10,
    padding: "13px 0", fontSize: 15, fontWeight: 600,
    cursor: "pointer", display: "flex", alignItems: "center",
    justifyContent: "center", gap: 8,
    boxShadow: "0 4px 16px rgba(59,130,246,0.35)",
    transition: "opacity 0.2s, transform 0.1s",
  },
  btnDisabled: { opacity: 0.65, cursor: "not-allowed" },
  otpRow: {
    display: "flex", gap: 10, justifyContent: "center",
    marginBottom: 4,
  },
  otpBox: {
    width: 48, height: 54, textAlign: "center",
    fontSize: 20, fontWeight: 700, color: "#f1f5f9",
    background: "rgba(255,255,255,0.06)",
    border: "1.5px solid rgba(255,255,255,0.12)",
    borderRadius: 10, outline: "none",
    transition: "border-color 0.2s, background 0.2s",
  },
  otpFilled: {
    background: "rgba(59,130,246,0.15)",
    borderColor: "rgba(59,130,246,0.5)",
  },
  otpError: { borderColor: "rgba(248,113,113,0.6)" },
  resendRow: {
    textAlign: "center", color: "#6b7280", fontSize: 13, marginTop: 14,
  },
  linkBtn: {
    background: "none", border: "none", color: "#3b82f6",
    cursor: "pointer", fontSize: 13, fontWeight: 600, padding: 0,
  },
  backLink: {
    marginTop: 20, background: "none", border: "none",
    color: "#3b82f6", cursor: "pointer", fontSize: 13,
    fontWeight: 600, display: "flex", alignItems: "center", gap: 6,
  },
  strengthBar: {
    display: "flex", gap: 4, marginTop: 8,
  },
  strengthSeg: {
    flex: 1, height: 4, borderRadius: 2,
    transition: "background-color 0.3s",
  },
  hint: {
    marginTop: 16, color: "#4b5563", fontSize: 11.5,
    textAlign: "center", lineHeight: 1.6,
  },
  code: {
    background: "rgba(255,255,255,0.06)", borderRadius: 4,
    padding: "1px 5px", fontFamily: "monospace", color: "#9ca3af",
  },
  successCard: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(74,222,128,0.2)",
    borderRadius: 16, padding: "40px 32px",
    textAlign: "center", maxWidth: 400, width: "100%",
    backdropFilter: "blur(12px)",
  },
  successTitle: {
    color: "#f1f5f9", fontSize: 22, fontWeight: 700, margin: "0 0 10px",
  },
  successSub: {
    color: "#94a3b8", fontSize: 14, marginBottom: 24, lineHeight: 1.6,
  },
};