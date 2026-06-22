import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { T, hasUsageLeft, getUsage, FREE_LIMIT, incrementUsage } from '../tokens.js'

export default function Tailor() {
  const navigate = useNavigate()
  const [cv, setCv] = useState("")
  const [job, setJob] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [pdfMsg, setPdfMsg] = useState("")
  const fileRef = useRef(null)
  const usage = getUsage()
  const remaining = FREE_LIMIT - usage.count
  const canGenerate = hasUsageLeft()

  const handleFile = async (file) => {
    if (!file) return
    setPdfMsg("")
    if (file.type === "text/plain") {
      const text = await file.text()
      setCv(text)
      return
    }
    if (file.type === "application/pdf") {
      try {
        setPdfMsg("Reading PDF...")
        if (!window.pdfjsLib) {
          await new Promise((resolve, reject) => {
            const script = document.createElement("script")
            script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"
            script.onload = resolve
            script.onerror = reject
            document.head.appendChild(script)
          })
          window.pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js"
        }
        const arrayBuffer = await file.arrayBuffer()
        const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise
        let fullText = ""
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i)
          const content = await page.getTextContent()
          fullText += content.items.map((item) => item.str).join(" ") + "\n"
        }
        if (!fullText.trim()) {
          setPdfMsg("Could not extract text. Please paste your CV as text instead.")
          return
        }
        setCv(fullText.trim())
        setPdfMsg("PDF loaded successfully.")
      } catch (e) {
        setPdfMsg("Could not read this PDF. Please paste your CV as text instead.")
      }
      return
    }
    setPdfMsg("Please upload a PDF or .txt file.")
  }

  const generate = async () => {
    if (!cv.trim() || !job.trim()) { setError("Please add both your CV and the job description."); return }
    if (!canGenerate) { setError("You have used all 3 free tailorings for today. Come back tomorrow."); return }
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
      sessionStorage.setItem("tailr_result", JSON.stringify({ tailoredCv: data.tailoredCv, coverLetter: data.coverLetter, jobTitle: data.jobTitle, company: data.company }))
      navigate('/results')
    } catch (e) {
      setError(e.message || "Something went wrong. Please try again.")
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.text, fontFamily: T.sans }}>
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 32px", borderBottom: `1px solid ${T.border}`, position: "sticky", top: 0, zIndex: 10, background: T.bg }}>
        <button onClick={() => navigate('/')} style={{ fontFamily: T.serif, fontSize: 20, fontWeight: 700, color: T.amber, background: "none", border: "none", cursor: "pointer" }}>Tailr</button>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ fontSize: 12, color: remaining > 0 ? T.amber : T.danger, fontWeight: 600 }}>{remaining} free tailoring{remaining !== 1 ? "s" : ""} left today</div>
          <button onClick={generate} disabled={loading || !canGenerate} style={{ padding: "9px 20px", borderRadius: T.md, border: "none", background: loading || !canGenerate ? T.surfaceHi : T.amber, color: loading || !canGenerate ? T.textMuted : T.bg, fontSize: 13, fontWeight: 700, cursor: loading || !canGenerate ? "not-allowed" : "pointer", fontFamily: T.sans }}>
            {loading ? "Tailoring..." : "Tailor my CV →"}
          </button>
        </div>
      </nav>

      {loading && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(13,13,13,0.92)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div style={{ fontFamily: T.serif, fontSize: 48, fontWeight: 700, fontStyle: "italic", color: T.amber, marginBottom: 16 }}>Tailoring...</div>
          <div style={{ fontSize: 14, color: T.textDim, maxWidth: 300, textAlign: "center", lineHeight: 1.7 }}>Reading your CV and the job description. Writing your tailored bullets and cover letter.</div>
        </div>
      )}

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontFamily: T.serif, fontSize: 32, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 6 }}>Tailor your application</h1>
          <p style={{ fontSize: 13, color: T.textDim }}>Add your CV and the job you are applying for. We will do the rest.</p>
        </div>

        {error && <div style={{ padding: "12px 16px", borderRadius: T.md, marginBottom: 20, background: "#1a0806", border: `1px solid ${T.danger}40`, fontSize: 13, color: T.danger }}>{error}</div>}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: T.textMuted, textTransform: "uppercase" }}>Your CV</label>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => fileRef.current?.click()} style={{ padding: "4px 10px", borderRadius: T.sm, background: T.surface, border: `1px solid ${T.borderHi}`, color: T.textDim, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>Upload PDF or TXT</button>
                <button onClick={() => { setCv(""); setPdfMsg("") }} style={{ padding: "4px 10px", borderRadius: T.sm, background: "transparent", border: `1px solid ${T.border}`, color: T.textMuted, fontSize: 11, cursor: "pointer" }}>Clear</button>
              </div>
            </div>
            <input ref={fileRef} type="file" accept=".pdf,.txt" style={{ display: "none" }} onChange={(e) => handleFile(e.target.files[0])} />
            {pdfMsg && (
              <div style={{ fontSize: 11, color: pdfMsg.includes("success") ? T.success : T.amber, padding: "8px 12px", borderRadius: T.sm, background: pdfMsg.includes("success") ? T.success + "15" : T.amberDim, border: `1px solid ${pdfMsg.includes("success") ? T.success + "40" : T.amber + "30"}`, lineHeight: 1.5 }}>
                {pdfMsg}
              </div>
            )}
            <textarea value={cv} onChange={(e) => setCv(e.target.value)} placeholder="Paste your CV here or upload a file above..."
              style={{ flex: 1, minHeight: "calc(100vh - 300px)", padding: "16px", borderRadius: T.md, background: T.bgLight, border: `1px solid ${T.border}`, color: T.text, fontSize: 13, lineHeight: 1.7, resize: "vertical", outline: "none", fontFamily: T.mono }}
              onFocus={(e) => e.target.style.borderColor = T.amber + "60"}
              onBlur={(e) => e.target.style.borderColor = T.border}
            />
            {cv.length > 0 && <div style={{ fontSize: 11, color: T.textMuted, textAlign: "right" }}>{cv.split(/\s+/).filter(Boolean).length} words</div>}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: T.textMuted, textTransform: "uppercase" }}>Job Description</label>
              <button onClick={() => setJob("")} style={{ padding: "4px 10px", borderRadius: T.sm, background: "transparent", border: `1px solid ${T.border}`, color: T.textMuted, fontSize: 11, cursor: "pointer" }}>Clear</button>
            </div>
            <textarea value={job} onChange={(e) => setJob(e.target.value)} placeholder="Paste the full job description here..."
              style={{ flex: 1, minHeight: "calc(100vh - 300px)", padding: "16px", borderRadius: T.md, background: T.bgLight, border: `1px solid ${T.border}`, color: T.text, fontSize: 13, lineHeight: 1.7, resize: "vertical", outline: "none", fontFamily: T.mono }}
              onFocus={(e) => e.target.style.borderColor = T.amber + "60"}
              onBlur={(e) => e.target.style.borderColor = T.border}
            />
            {job.length > 0 && <div style={{ fontSize: 11, color: T.textMuted, textAlign: "right" }}>{job.split(/\s+/).filter(Boolean).length} words</div>}
          </div>
        </div>
      </div>
    </div>
  )
}
