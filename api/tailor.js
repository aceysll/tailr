const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function trimToWords(text, maxWords) {
  const words = text.trim().split(/\s+/)
  if (words.length <= maxWords) return text.trim()
  return words.slice(0, maxWords).join(" ") + "..."
}

function cleanText(text) {
  return text
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, " ")
    .replace(/\u2022/g, "-")
    .replace(/\u2013|\u2014/g, "-")
    .replace(/\u201C|\u201D/g, '"')
    .replace(/\u2018|\u2019/g, "'")
    .replace(/\s+/g, " ")
    .trim()
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type")
  if (req.method === "OPTIONS") return res.status(200).end()
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" })
  const GROQ_API_KEY = process.env.GROQ_API_KEY
  if (!GROQ_API_KEY) return res.status(500).json({ error: "GROQ_API_KEY not configured" })
  try {
    const { cv, job } = req.body
    if (!cv || !job) return res.status(400).json({ error: "Missing CV or job description" })
    const cleanCv = cleanText(trimToWords(cv, 1200))
    const cleanJob = cleanText(trimToWords(job, 800))
    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${GROQ_API_KEY}` },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        max_tokens: 4000,
        messages: [
          { role: "system", content: `You are an expert CV writer. Return ONLY valid JSON: {"jobTitle":"","company":"","tailoredCv":"full rewritten CV as plain text","coverLetter":"full cover letter 3-4 paragraphs"}. Keep actual job titles and dates. Rewrite bullets to match the job. No invented experience. No placeholder text.` },
          { role: "user", content: `CV:\n${cleanCv}\n\nJob Description:\n${cleanJob}` },
        ],
      }),
    })
    const groqData = await groqRes.json()
    if (groqData.error) return res.status(500).json({ error: `Groq: ${groqData.error.message}` })
    const raw = groqData.choices?.[0]?.message?.content?.trim()
    if (!raw) return res.status(500).json({ error: "No response from AI" })
    const clean = raw.replace(/```json|```/g, "").trim()
    const result = JSON.parse(clean)
    return res.status(200).json(result)
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
}
