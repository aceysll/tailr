import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { T, getUsage, FREE_LIMIT } from '../tokens.js'

function useTypewriter(text, speed = 4) {
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

function parseCvSections(text) {
  if (!text) return null
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0)
  if (lines.length === 0) return null
  const sectionKeywords = [
    'professional summary','summary','objective','profile',
    'work experience','experience','employment','career history',
    'education','academic background','qualifications',
    'skills','additional skills','core competencies','technical skills',
    'certifications','certificates','achievements','awards',
    'projects','languages','references','interests','hobbies'
  ]
  function isSectionHeader(line) {
    const lower = line.toLowerCase().replace(/[:\-_]/g,'').trim()
    return sectionKeywords.some(k => lower === k || lower.startsWith(k))
  }
  const name = lines[0]
  let contactLine = ""
  let startIdx = 1
  for (let i = 1; i < Math.min(5, lines.length); i++) {
    const l = lines[i]
    if (l.includes('@') || l.includes('Phone') || l.includes('+') || l.includes('|') || l.includes('linkedin')) {
      contactLine = l
      startIdx = i + 1
      break
    }
  }
  const sections = []
  let currentSection = null
  let currentLines = []
  for (let i = startIdx; i < lines.length; i++) {
    const line = lines[i]
    if (isSectionHeader(line)) {
      if (currentSection) sections.push({ title: currentSection, lines: currentLines })
      currentSection = line.replace(/[:\-_]$/, '').trim()
      currentLines = []
    } else {
      currentLines.push(line)
    }
  }
  if (currentSection) sections.push({ title: currentSection, lines: currentLines })
  return { name, contactLine, sections }
}

function CvPreview({ text, displayed }) {
  const parsed = parseCvSections(displayed || text)
  if (!parsed) return (
    <pre style={{ fontFamily: T.mono, fontSize: 12, lineHeight: 1.8, color: "#1a1a1a", whiteSpace: "pre-wrap", margin: 0 }}>
      {displayed}
    </pre>
  )
  const { name, contactLine, sections } = parsed
  return (
    <div style={{ fontFamily: "'Georgia', 'Times New Roman', serif", color: "#1a1a1a" }}>
      {name && (
        <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.01em", margin: "0 0 4px", color: "#111", fontFamily: "'Georgia', serif" }}>
          {name}
        </h1>
      )}
      {contactLine && (
        <div style={{ fontSize: 11, color: "#555", marginBottom: 20, lineHeight: 1.6, fontFamily: "system-ui, sans-serif" }}>
          {contactLine}
        </div>
      )}
      {(name || contactLine) && (
        <div style={{ height: 2, background: "linear-gradient(to right, #b8860b, #d4a017, transparent)", marginBottom: 20, borderRadius: 1 }} />
      )}
      {sections.map((section, i) => (
        <div key={i} style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <h2 style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#8a6a00", margin: 0, fontFamily: "system-ui, sans-serif", whiteSpace: "nowrap" }}>
              {section.title}
            </h2>
            <div style={{ flex: 1, height: 1, background: "#d4a01744" }} />
          </div>
          <div>
            {section.lines.map((line, j) => {
              const isBullet = line.startsWith('-') || line.startsWith('*') || line.startsWith('•')
              const isDate = /^\d{2}\/\d{4}|^\d{4}|^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i.test(line)
              if (isBullet) return (
                <div key={j} style={{ display: "flex", gap: 8, marginBottom: 3, paddingLeft: 4 }}>
                  <span style={{ color: "#b8860b", fontWeight: 700, flexShrink: 0 }}>-</span>
                  <span style={{ fontSize: 12, lineHeight: 1.65, color: "#2a2a2a" }}>{line.replace(/^[-*•]\s*/,'')}</span>
                </div>
              )
              if (isDate) return (
                <div key={j} style={{ fontSize: 11, color: "#777", marginBottom: 2, fontFamily: "system-ui, sans-serif", fontStyle: "italic" }}>{line}</div>
              )
              return (
                <div key={j} style={{ fontSize: 12, color: "#333", lineHeight: 1.65, marginBottom: 3 }}>{line}</div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

function downloadAsPDF(cvText, coverLetterText, filename, jobTitle, company) {
  const isCv = filename.includes('cv')
  const content = isCv ? cvText : coverLetterText
  const parsed = isCv ? parseCvSections(content) : null

  const cvHtml = parsed ? `
    <div class="name">${parsed.name || ''}</div>
    ${parsed.contactLine ? `<div class="contact">${parsed.contactLine}</div>` : ''}
    <div class="divider"></div>
    ${parsed.sections.map(section => `
      <div class="section">
        <div class="section-header">
          <span class="section-title">${section.title}</span>
          <div class="section-line"></div>
        </div>
        <div class="section-body">
          ${section.lines.map(line => {
            const isBullet = line.startsWith('-') || line.startsWith('*') || line.startsWith('•')
            const isDate = /^\d{2}\/\d{4}|^\d{4}|^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i.test(line)
            if (isBullet) return `<div class="bullet"><span class="bullet-dot">-</span><span>${line.replace(/^[-*•]\s*/,'')}</span></div>`
            if (isDate) return `<div class="date">${line}</div>`
            return `<div class="body-line">${line}</div>`
          }).join('')}
        </div>
      </div>
    `).join('')}
  ` : `<pre class="letter">${content.replace(/</g,'&lt;').replace(/>/g,'&gt;')}</pre>`

  const printWindow = window.open('','_blank')
  printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>${filename}</title>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Inter',system-ui,sans-serif;font-size:10.5pt;line-height:1.6;color:#1a1a1a;max-width:720px;margin:0 auto;padding:48px 52px;background:#fff}
.name{font-family:'Playfair Display',Georgia,serif;font-size:28pt;font-weight:700;color:#111;letter-spacing:-0.01em;margin-bottom:4px}
.contact{font-size:9pt;color:#555;margin-bottom:16px;line-height:1.5}
.divider{height:2px;background:linear-gradient(to right,#b8860b,#d4a017,transparent);margin-bottom:20px;border-radius:1px}
.section{margin-bottom:18px}
.section-header{display:flex;align-items:center;gap:10px;margin-bottom:7px}
.section-title{font-size:8pt;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#8a6a00;white-space:nowrap}
.section-line{flex:1;height:1px;background:#d4a01744}
.bullet{display:flex;gap:7px;margin-bottom:3px;padding-left:2px}
.bullet-dot{color:#b8860b;font-weight:700;flex-shrink:0}
.date{font-size:9pt;color:#777;font-style:italic;margin-bottom:2px}
.body-line{font-size:10pt;color:#2a2a2a;margin-bottom:3px;line-height:1.6}
.letter{white-space:pre-wrap;word-wrap:break-word;font-family:'Inter',sans-serif;font-size:10.5pt;line-height:1.7;color:#1a1a1a}
.footer{margin-top:32px;padding-top:12px;border-top:1px solid #eee;font-size:8pt;color:#aaa;text-align:right}
@media print{body{padding:0}@page{margin:2cm 2.2cm;size:A4}}
</style>
</head>
<body>
${cvHtml}
<div class="footer">Tailored by Tailr - usetailr.vercel.app${jobTitle ? ` | ${jobTitle}${company ? ` at ${company}` : ''}` : ''}</div>
<script>document.fonts.ready.then(function(){window.print()})<\/script>
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

  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.text, fontFamily: T.sans }}>
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 32px", borderBottom: `1px solid ${T.border}`, position: "sticky", top: 0, zIndex: 10, background: T.bg }}>
        <button onClick={() => navigate('/')} style={{ fontFamily: T.serif, fontSize: 20, fontWeight: 700, color: T.amber, background: "none", border: "none", cursor: "pointer" }}>Tailr</button>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 12, color: T.textMuted }}>{remaining} tailoring{remaining !== 1 ? "s" : ""} left today</span>
          <button onClick={() => navigate('/tailor')} style={{ padding: "8px 16px", borderRadius: T.md, border: `1px solid ${T.border}`, background: "transparent", color: T.textDim, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Tailor another</button>
          <button onClick={() => downloadAsPDF(result.tailoredCv, result.coverLetter, activeTab === "cv" ? "tailored-cv.pdf" : "cover-letter.pdf", result.jobTitle, result.company)} style={{ padding: "8px 16px", borderRadius: T.md, border: "none", background: T.amber, color: T.bg, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Download PDF</button>
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
          {activeTab === "cv" ? (
            <CvPreview text={result.tailoredCv} displayed={cvTypewriterDone ? result.tailoredCv : cvDisplayed} />
          ) : (
            <div style={{ fontFamily: T.sans, fontSize: 14, lineHeight: 1.8, color: "#1a1a1a", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
              {result.coverLetter}
            </div>
          )}
          {activeTab === "cv" && !cvTypewriterDone && (
            <span style={{ display: "inline-block", width: 2, height: "1.2em", background: T.amber, marginLeft: 1, verticalAlign: "middle", animation: "blink 0.8s step-end infinite" }} />
          )}
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
