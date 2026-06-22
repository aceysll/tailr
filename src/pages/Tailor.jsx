import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { T, hasUsageLeft, getUsage, FREE_LIMIT, incrementUsage } from '../tokens.js'

export default function Tailor() {
  const navigate = useNavigate()
  const [cv, setCv] = useState("")
  const [job, setJob] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [pdfError, setPdfError] = useState("")
  const fileRef = useRef(null)

  const usage = getUsage()
  const remaining = FREE_LIMIT - usage.count
  const canGenerate = hasUsageLeft()

  const handleFile = async (file) => {
    if (!file) return
    setPdfError("")
    if (file.type === "text/plain") {
      const text = await file.text()
      setCv(text)
      return
    }
    if (file.type === "application/pdf") {
      setPdfError("PDF extraction coming soon. Please paste your CV as text for now.")
      return
    }
    setPdfError("Please upload a .txt file or paste your CV as text.")
  }

  const generate = async () => {
    if (!cv.trim() || !job.trim()) {
      setError("Please add both your CV and the job description.")
      return
    }
    if (!canGenerate) {
      setError("You've used all 3 free tailorings for today. Come back tomorrow.")
      return
    }
    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/tailor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cv: cv.trim(), job: job.trim() }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)

      incrementUsage()

      // Store results in sessionStorage for Results page
      sessionStorage.setItem("tailr_result", JSON.stringify({
        tailoredCv: data.tailoredCv,
        coverLetter: data.coverLetter,
        jobTitle: data.jobTitle,
        company: data.company,
      }))

      navigate('/results')
    } catch (e) {
      setError("Something went wrong. Please try again.")
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.text, fontFamily: T.sans }}>

      {/* Nav */}
      <nav style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "20px 32px",
        borderBottom: `1px solid ${T.border}`,
        position: "sticky", top: 0, zIndex: 10,
        background: T.bg,
        backdropFilter: "blur(12px)",
      }}>
        <button
          onClick={() => navigate('/')}
          style={{
            fontFamily: T.serif, fontSize: 20, fontWeight: 700,
            color: T.amber, background: "none", border: "none",
            cursor: "pointer", letterSpacing: "-0.01em",
          }}
        >
          Tailr
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{
            fontSize: 12, color: remaining > 0 ? T.amber : T.danger,
            fontWeight: 600,
          }}>
            {remaining} free tailoring{remaining !== 1 ? "s" : ""} left today
          </div>
          <button
            onClick={generate}
            disabled={loading || !canGenerate}
            style={{
              padding: "9px 20px", borderRadius: T.md, border: "none",
              background: loading || !canGenerate ? T.surfaceHi : T.amber,
              color: loading || !canGenerate ? T.textMuted : T.bg,
              fontSize: 13, fontWeight: 700, cursor: loading || !canGenerate ? "not-allowed" : "pointer",
              fontFamily: T.sans, transition: "all 0.2s",
            }}
          >
            {loading ? "Tailoring..." : "Tailor my CV →"}
          </button>
        </div>
      </nav>

      {/* Loading overlay */}
      {loading && (
        <div style={{
          position: "fixed", inset: 0,
          background: "rgba(13,13,13,0.92)",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          zIndex: 100,
        }}>
          <div style={{
            fontFamily: T.serif, fontSize: "clamp(32px, 6vw, 52px)",
            fontWeight: 700, fontStyle: "italic",
            color: T.amber, marginBottom: 16,
            animation: "pulse 2s ease infinite",
          }}>
            Tailoring...
          </div>
          <div style={{ fontSize: 14, color: T.textDim, maxWidth: 300, textAlign: "center", lineHeight: 1.7 }}>
            Reading your CV and the job description.
            Writing your tailored bullets and cover letter.
          </div>
          <style>{`
            @keyframes pulse {
              0%, 100% { opacity: 0.7; }
              50% { opacity: 1; }
            }
          `}</style>
        </div>
      )}

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>

        {/* Page title */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{
            fontFamily: T.serif, fontSize: "clamp(22px, 4vw, 32px)",
            fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 6,
          }}>
            Tailor your application
          </h1>
          <p style={{ fontSize: 13, color: T.textDim }}>
            Add your CV and the job you're applying for. We'll do the rest.
          </p>
        </div>

        {error && (
          <div style={{
            padding: "12px 16px", borderRadius: T.md, marginBottom: 20,
            background: "#1a0806", border: `1px solid ${T.danger}40`,
            fontSize: 13, color: T.danger,
          }}>
            {error}
          </div>
        )}

        {/* Two column inputs */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
        }}>

          {/* CV input */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <label style={{
                fontSize: 11, fontWeight: 700, letterSpacing: "0.1em",
                color: T.textMuted, textTransform: "uppercase",
              }}>
                Your CV
              </label>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => fileRef.current?.click()}
                  style={{
                    padding: "4px 10px", borderRadius: T.sm,
                    background: T.surface, border: `1px solid ${T.borderHi}`,
                    color: T.textDim, fontSize: 11, fontWeight: 600, cursor: "pointer",
                  }}
                >
                  Upload file
                </button>
                <button
                  onClick={() => setCv("")}
                  style={{
                    padding: "4px 10px", borderRadius: T.sm,
                    background: "transparent", border: `1px solid ${T.border}`,
                    color: T.textMuted, fontSize: 11, cursor: "pointer",
                  }}
                >
                  Clear
                </button>
              </div>
            </div>
            <input
              ref={fileRef} type="file" accept=".pdf,.txt"
              style={{ display: "none" }}
              onChange={(e) => handleFile(e.target.files[0])}
            />
            {pdfError && (
              <div style={{
                fontSize: 11, color: T.amber,
                padding: "8px 12px", borderRadius: T.sm,
                background: T.amberDim, border: `1px solid ${T.amber}30`,
                lineHeight: 1.5,
              }}>
                ℹ {pdfError}
              </div>
            )}
            <textarea
              value={cv}
              onChange={(e) => setCv(e.target.value)}
              placeholder="Paste your CV here...

Name
Contact details

Experience
Job title — Company (dates)
• What you did
• What you achieved

Education
Degree — University (year)

Skills
..."
              style={{
                flex: 1, minHeight: "calc(100vh - 280px)",
                padding: "16px", borderRadius: T.md,
                background: T.bgLight, border: `1px solid ${T.border}`,
                color: T.text, fontSize: 13, lineHeight: 1.7,
                resize: "vertical", outline: "none",
                fontFamily: T.mono,
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => e.target.style.borderColor = T.amber + "60"}
              onBlur={(e) => e.target.style.borderColor = T.border}
            />
            <div style={{ fontSize: 11, color: T.textMuted, textAlign: "right" }}>
              {cv.length > 0 && `${cv.split(/\s+/).filter(Boolean).length} words`}
            </div>
          </div>

          {/* Job description input */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <label style={{
                fontSize: 11, fontWeight: 700, letterSpacing: "0.1em",
                color: T.textMuted, textTransform: "uppercase",
              }}>
                Job Description
              </label>
              <button
                onClick={() => setJob("")}
                style={{
                  padding: "4px 10px", borderRadius: T.sm,
                  background: "transparent", border: `1px solid ${T.border}`,
                  color: T.textMuted, fontSize: 11, cursor: "pointer",
                }}
              >
                Clear
              </button>
            </div>
            <textarea
              value={job}
              onChange={(e) => setJob(e.target.value)}
              placeholder="Paste the full job description here...

Job Title
Company Name

About the role...
What you'll do...
What we're looking for...
..."
              style={{
                flex: 1, minHeight: "calc(100vh - 280px)",
                padding: "16px", borderRadius: T.md,
                background: T.bgLight, border: `1px solid ${T.border}`,
                color: T.text, fontSize: 13, lineHeight: 1.7,
                resize: "vertical", outline: "none",
                fontFamily: T.mono,
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => e.target.style.borderColor = T.amber + "60"}
              onBlur={(e) => e.target.style.borderColor = T.border}
            />
            <div style={{ fontSize: 11, color: T.textMuted, textAlign: "right" }}>
              {job.length > 0 && `${job.split(/\s+/).filter(Boolean).length} words`}
            </div>
          </div>
        </div>

        {/* Mobile generate button */}
        <button
          onClick={generate}
          disabled={loading || !canGenerate}
          style={{
            width: "100%", marginTop: 20,
            padding: "14px", borderRadius: T.md, border: "none",
            background: loading || !canGenerate ? T.surfaceHi : T.amber,
            color: loading || !canGenerate ? T.textMuted : T.bg,
            fontSize: 15, fontWeight: 700,
            cursor: loading || !canGenerate ? "not-allowed" : "pointer",
            fontFamily: T.sans,
            display: "none",
          }}
        >
          {loading ? "Tailoring..." : "Tailor my CV →"}
        </button>

      </div>

      <style>{`
        @media (max-width: 640px) {
          .two-col { grid-template-columns: 1fr !important; }
          .mobile-btn { display: block !important; }
        }
      `}</style>
    </div>
  )
}
