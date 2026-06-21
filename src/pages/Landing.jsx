import { useNavigate } from 'react-router-dom'
import { T, getUsage, FREE_LIMIT } from '../tokens.js'

export default function Landing() {
  const navigate = useNavigate()
  const usage = getUsage()
  const remaining = FREE_LIMIT - usage.count

  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.text, fontFamily: T.sans }}>

      {/* Nav */}
      <nav style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "24px 32px",
        borderBottom: `1px solid ${T.border}`,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{
            fontFamily: T.serif, fontSize: 20, fontWeight: 700,
            color: T.amber, letterSpacing: "-0.01em",
          }}>Tailr</span>
          <span style={{
            fontSize: 10, fontWeight: 600, letterSpacing: "0.1em",
            color: T.textMuted, textTransform: "uppercase", marginTop: 2,
          }}>beta</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <a href="https://buildbyace.vercel.app" target="_blank" rel="noopener noreferrer"
            style={{ fontSize: 12, color: T.textMuted }}>
            by ace ↗
          </a>
          <button
            onClick={() => navigate('/tailor')}
            style={{
              padding: "8px 18px", borderRadius: T.md, border: "none",
              background: T.amber, color: T.bg,
              fontSize: 13, fontWeight: 700, cursor: "pointer",
              fontFamily: T.sans,
            }}
          >
            Start free
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "80px 32px 60px" }}>

        {/* Eyebrow */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "6px 14px", borderRadius: 20,
          border: `1px solid ${T.amberDim}`,
          background: T.amberDim,
          marginBottom: 32,
        }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: T.amber }} />
          <span style={{
            fontSize: 11, fontWeight: 600, color: T.amber,
            letterSpacing: "0.08em", textTransform: "uppercase",
          }}>
            Free · {remaining} tailoring{remaining !== 1 ? "s" : ""} left today
          </span>
        </div>

        {/* Headline */}
        <h1 style={{
          fontFamily: T.serif,
          fontSize: "clamp(40px, 8vw, 76px)",
          fontWeight: 900,
          lineHeight: 1.05,
          letterSpacing: "-0.02em",
          marginBottom: 24,
          maxWidth: 700,
        }}>
          Your CV,<br />
          <span style={{ fontStyle: "italic", color: T.amber }}>tailored</span>{" "}
          for every role.
        </h1>

        <p style={{
          fontSize: 18, color: T.textDim, lineHeight: 1.8,
          maxWidth: 500, marginBottom: 40, fontWeight: 400,
        }}>
          Paste your CV and a job description.
          Tailr rewrites your bullets to match the role and writes a
          cover letter that sounds like you, not a template.
        </p>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <button
            onClick={() => navigate('/tailor')}
            style={{
              padding: "14px 28px", borderRadius: T.md, border: "none",
              background: T.amber, color: T.bg,
              fontSize: 15, fontWeight: 700, cursor: "pointer",
              fontFamily: T.sans, letterSpacing: "-0.01em",
              boxShadow: `0 0 32px ${T.amber}33`,
            }}
          >
            Tailor my CV →
          </button>
          <span style={{ fontSize: 13, color: T.textMuted }}>
            No account needed · 3 free per day
          </span>
        </div>
      </div>

      {/* Divider */}
      <div style={{ maxWidth: 900, margin: "0 auto 0", padding: "0 32px" }}>
        <div style={{ height: 1, background: T.border }} />
      </div>

      {/* How it works */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "64px 32px" }}>
        <div style={{
          fontSize: 11, fontWeight: 600, letterSpacing: "0.12em",
          color: T.textMuted, textTransform: "uppercase", marginBottom: 40,
        }}>
          How it works
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 2,
        }}>
          {[
            {
              n: "01",
              title: "Paste your CV",
              desc: "Drop in plain text or upload a PDF. Tailr reads your experience as-is.",
            },
            {
              n: "02",
              title: "Add the job description",
              desc: "Paste the full job posting. The more detail, the sharper the result.",
            },
            {
              n: "03",
              title: "Get your tailored pack",
              desc: "Rewritten CV bullets and a cover letter, ready to copy or download as PDF.",
            },
          ].map(({ n, title, desc }) => (
            <div key={n} style={{
              padding: "32px 28px",
              background: T.bgLight,
              border: `1px solid ${T.border}`,
            }}>
              <div style={{
                fontFamily: T.serif, fontSize: 48, fontWeight: 900,
                color: T.amberDim, lineHeight: 1, marginBottom: 20,
                letterSpacing: "-0.03em",
              }}>
                {n}
              </div>
              <div style={{
                fontSize: 16, fontWeight: 600, marginBottom: 8,
                letterSpacing: "-0.01em",
              }}>
                {title}
              </div>
              <div style={{ fontSize: 13, color: T.textDim, lineHeight: 1.7 }}>
                {desc}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* What you get */}
      <div style={{
        maxWidth: 900, margin: "0 auto",
        padding: "0 32px 64px",
      }}>
        <div style={{ height: 1, background: T.border, marginBottom: 64 }} />
        <div style={{
          fontSize: 11, fontWeight: 600, letterSpacing: "0.12em",
          color: T.textMuted, textTransform: "uppercase", marginBottom: 32,
        }}>
          What you get
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {[
            {
              icon: "✦",
              title: "Tailored CV bullets",
              desc: "Your experience rewritten to mirror the language and priorities of the job description. ATS-friendly, human-readable.",
            },
            {
              icon: "✦",
              title: "A cover letter that fits",
              desc: "Not a generic template. A letter built from your actual background, matched to the role's specific asks.",
            },
            {
              icon: "✦",
              title: "PDF download",
              desc: "Download your tailored CV and cover letter as clean, formatted PDFs ready to attach to any application.",
            },
            {
              icon: "✦",
              title: "3 free tailorings per day",
              desc: "Apply to multiple roles daily. Each tailoring is a fresh take, not a copy-paste of the last one.",
            },
          ].map(({ icon, title, desc }) => (
            <div key={title} style={{
              padding: "24px",
              background: T.bgLight,
              border: `1px solid ${T.border}`,
              borderRadius: T.md,
            }}>
              <div style={{ color: T.amber, fontSize: 14, marginBottom: 10 }}>{icon}</div>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>{title}</div>
              <div style={{ fontSize: 12, color: T.textDim, lineHeight: 1.7 }}>{desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{
        textAlign: "center",
        padding: "64px 32px 80px",
        borderTop: `1px solid ${T.border}`,
      }}>
        <div style={{
          fontFamily: T.serif, fontSize: "clamp(28px, 5vw, 44px)",
          fontWeight: 700, fontStyle: "italic",
          marginBottom: 24, color: T.text,
        }}>
          Ready to apply smarter?
        </div>
        <button
          onClick={() => navigate('/tailor')}
          style={{
            padding: "14px 32px", borderRadius: T.md, border: "none",
            background: T.amber, color: T.bg,
            fontSize: 15, fontWeight: 700, cursor: "pointer",
            fontFamily: T.sans,
          }}
        >
          Tailor my CV →
        </button>
      </div>

      {/* Footer */}
      <div style={{
        padding: "20px 32px",
        borderTop: `1px solid ${T.border}`,
        display: "flex", justifyContent: "space-between", alignItems: "center",
        flexWrap: "wrap", gap: 10,
      }}>
        <span style={{ fontFamily: T.serif, fontSize: 14, color: T.amber, fontWeight: 700 }}>
          Tailr
        </span>
        <span style={{ fontSize: 12, color: T.textMuted }}>
          Built by{" "}
          <a href="https://buildbyace.vercel.app" target="_blank" rel="noopener noreferrer"
            style={{ color: T.textDim }}>ace</a>
        </span>
      </div>
    </div>
  )
}
