export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*")
  if (req.method !== "POST") return res.status(405).end()

  const GROQ_API_KEY = process.env.GROQ_API_KEY
  if (!GROQ_API_KEY) return res.status(500).send("No API key")

  const { cv, job } = req.body

  const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      max_tokens: 6000,
      messages: [
        {
          role: "system",
          content: `You are an expert CV writer. You MUST respond using ONLY these exact XML tags with no other text before or after:
<jobTitle>job title here</jobTitle>
<company>company name here</company>
<tailoredCv>full rewritten CV here</tailoredCv>
<coverLetter>full cover letter here</coverLetter>`,
        },
        { role: "user", content: "CV:\n" + cv + "\n\nJob Description:\n" + job },
      ],
    }),
  })

  const data = await groqRes.json()
  return res.status(200).json(data)
}
