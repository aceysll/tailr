export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Content-Type", "text/plain")

  const GROQ_API_KEY = process.env.GROQ_API_KEY
  if (!GROQ_API_KEY) return res.status(500).send("No API key")

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
          content: `Respond using ONLY these XML tags:\n<jobTitle>title</jobTitle>\n<company>company</company>\n<tailoredCv>cv here</tailoredCv>\n<coverLetter>letter here</coverLetter>`,
        },
        { role: "user", content: "CV:\nSoftware developer, 2 years experience\n\nJob Description:\nJunior developer at Acme Corp" },
      ],
    }),
  })

  const data = await groqRes.json()
  const raw = data.choices?.[0]?.message?.content || JSON.stringify(data)
  return res.status(200).send(raw)
}
