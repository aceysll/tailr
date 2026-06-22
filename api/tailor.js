const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function clean(text) {
  return text
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, " ")
    .replace(/\u2022/g, "-")
    .replace(/\u2013|\u2014/g, "-")
    .replace(/\u201C|\u201D/g, '"')
    .replace(/\u2018|\u2019/g, "'")
    .replace(/\t/g, " ")
    .trim()
}

function trimToWords(text, maxWords) {
  const words = clean(text).split(/\s+/)
  if (words.length <= maxWords) return words.join(" ")
  return words.slice(0, maxWords).join(" ")
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
    const cleanCv = trimToWords(cv, 1200)
    const cleanJob = trimToWords(job, 800)
    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${GROQ_API_KEY}` },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        max_tokens: 4000,
        messages: [
          { role: "system", content: "You are an expert CV writer. Return ONLY valid JSON with these exact keys: jobTitle, company, tailoredCv, coverLetter. Use only standard ASCII characters. No bullet symbols, no special quotes, no em dashes. Use regular hyphens for bullets. Keep actual job titles and dates. Rewrite experience bullets to match the job. No invented experience. No placeholder text in cover letter." },
          { role: "user", content: "CV:\n" + cleanCv + "\n\nJob Description:\n" + cleanJob },
        ],
      }),
    })
    const groqData = await groqRes.json()
    if (groqData.error) return res.status(500).json({ error: "Groq: " + groqData.error.message })
    const raw = groqData.choices?.[0]?.message?.content?.trim()
    if (!raw) return res.status(500).json({ error: "No response from AI" })
    const cleaned = raw
      .replace(/```json|```/g, "")
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, " ")
      .replace(/\u2022/g, "-")
      .replace(/\u2013|\u2014/g, "-")
      .replace(/\u201C|\u201D/g, '\\"')
      .replace(/\u2018|\u2019/g, "'")
      .trim()
    const result = JSON.parse(cleaned)
    return res.status(200).json(result)
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
}
