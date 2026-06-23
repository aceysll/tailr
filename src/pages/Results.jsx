import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { T, getUsage, FREE_LIMIT } from '../tokens.js'

function useTypewriter(text, speed = 8) {
  const [displayed, setDisplayed] = useState("")
  const [done, setDone] = useState(false)
  useEffect(() => {
    if (!text) return
    setDisplayed("")
    setDone(false)
    let i = 0
    const interval = setInterval(() => {
      if (i >= text.length) { setDone(true); clearInterval(interval); return }
      setDisplayed(text.slice(0, i + 1))
      i++
    }, speed)
    return () => clearInterval(interval)
  }, [text, speed])
  return { displayed, done }
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard?.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button onClick={copy} style={{
      padding: "6px 14px", borderRadius: T.sm,
      background: copied ? T.success + "22" : T.surface,
      border: `1px solid ${copied ? T.success + "44" : T.borderHi}`,
      color: copied ? T.success : T.textDim,
      fontSize: 11, fontWeight: 600, cursor: "pointer", transition: "all 0.2s",
    }}>
      {copied ? "Copied!" : "Copy"}
    </button>
  )
}

function downloadAsPDF(content, filename) {
  const printWindow = window.open('', '_blank')
  printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
  <title>${filename}</title>
  <style>
    body { font-family: 'Georgia', serif; font-size: 11pt; line-height: 1.6; color: #111; max-width: 680px; margin: 40px auto; padding: 0 20px; }
    pre { white-space: pre-wrap; word-wrap: break-word; font-family: inherit; font-size: inherit; line-height: inherit; }
    @media print { body { margin: 0; } @page { margin: 2cm; } }
  </style>
</head>
<body>
  <pre>${content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
  <script>window.onload = function() { window.print(); }<\/script>
</body>
</html>`)
  printWindow.document.close()
}

export default function Results() {
  const navigate = useNavigate()
  const [result, setResult] = useState(null)
  const [activeTab, setActiveTab] = useState("cv")
  const [cvDone, setCvDone] = useState(false)

  const usage = getUsage()
  const remaining = FREE_LIMIT - usage.count

  useEffect(() => {
    const raw = sessionStorage.getItem("tailr_result")
    if (!raw) { navigate('/tailor'); return }
    const parts = raw.split("\n|||TAILR|||\n")
    if (parts.length >= 4) {
      setResult({ jobTitle: parts[0], company: parts[1], tailoredCv: parts[2], coverLetter: parts[3] })
    } else {
      try { setResult(JSON.parse(raw)) } catch { navigate('/tailor') }
    }
  }, [])

  const { displayed: cvDisplayed, done: cvTypewriterDone } = useTypewriter(result?.tailoredCv || "", 4)

  useEffect(() => { if (cvTypewriterDone) setCvDone(true) }, [cvTypewriterDone])

  if (!result) return null

  const currentContent = activeTab === "cv" ? result.tailoredCv : result.coverLetter
  const currentDisplayed = activeTab === "cv" ? cvDisplayed : result.coverLetter

  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.text, fontFamily: T.sans }}>
      <nav style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "20px 32px", borderBottom: `1px solid ${T.border}`,
        position: "sticky", top: 0, zIndex: 10, background: T.bg,
      }}>
        <button onClick={() => navigate('/')} style={{ fontFamily: T.serif, fontSize: 20, fontWeight: 700, color: T.amber, background: "none", border: "none", cursor: "pointer" }}>Tailr</button>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 12, color: T.textMuted }}>{remaining} tailoring{remaining !== 1 ? "s" : ""} left today</span>
          <button onClick={() => navigate('/tailor')} style={{ padding: "8px 16px", borderRadius: T.md, border: `1px solid ${T.border}`, background: "transparent", color: T.textDim, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Tailor another</button>
          <button onClick={() => downloadAsPDF(currentContent, activeTab === "cv" ? "tailored-cv.pdf" : "cover-letter.pdf")} style={{ padding: "8px 16px", borderRadius: T.md, border: "none", background: T.amber, color: T.bg, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Download PDF</button>
        </div>
      </nav>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 24px 80px" }}>
        {(result.jobTitle || result.company) && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28, flexWrap: "wrap" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 20, background: T.amberDim, border: `1px solid ${T.amber}33` }}>
              <span style={{ fontSize: 11, color: T.amber, fontWeight: 600 }}>Tailored for</span>
            </div>
            <span style={{ fontSize: 14, fontWeight: 600 }}>{result.jobTitle}{result.company ? ` at ${result.company}` : ""}</span>
          </div>
        )}

        <div style={{ display: "flex", gap: 2, marginBottom: 24, background: T.bgLight, borderRadius: T.md, padding: 4, width: "fit-content", border: `1px solid ${T.border}` }}>
          {[{ id: "cv", label: "Tailored CV" }, { id: "cover", label: "Cover Letter" }].map(({ id, label }) => (
            <button key={id} onClick={() => setActiveTab(id)} style={{ padding: "8px 20px", borderRadius: T.sm - 2, background: activeTab === id ? T.amber : "transparent", color: activeTab === id ? T.bg : T.textDim, border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.15s" }}>{label}</button>
          ))}
        </div>

        <div style={{ background: T.paper, borderRadius: T.lg, padding: "48px 56px", boxShadow: "0 4px 40px rgba(0,0,0,0.4)", position: "relative", minHeight: 600 }}>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 24 }}>
            <CopyButton text={currentContent} />
          </div>
          <pre style={{ fontFamily: activeTab === "cv" ? T.mono : T.sans, fontSize: activeTab === "cv" ? 12 : 14, lineHeight: 1.8, color: "#1a1a1a", whiteSpace: "pre-wrap", wordBreak: "break-word", margin: 0 }}>
            {currentDisplayed}
            {activeTab === "cv" && !cvTypewriterDone && (
              <span style={{ display: "inline-block", width: 2, height: "1.2em", background: T.amber, marginLeft: 1, verticalAlign: "middle", animation: "blink 0.8s step-end infinite" }} />
            )}
          </pre>
          <style>{`@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }`}</style>
        </div>

        {remaining <= 1 && (
          <div style={{ marginTop: 20, padding: "12px 16px", borderRadius: T.md, background: T.amberDim, border: `1px solid ${T.amber}33`, fontSize: 12, color: T.amber }}>
            {remaining === 0 ? "You've used all 3 free tailorings for today. Come back tomorrow for more." : "1 free tailoring left today. Make it count."}
          </div>
        )}

        <div style={{ marginTop: 40, textAlign: "center" }}>
          <a href="https://buildbyace.vercel.app" target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: T.textMuted, textDecoration: "none" }}>by ace ↗</a>
        </div>
      </div>
    </div>
  )
}
