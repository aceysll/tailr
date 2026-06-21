export const config = { runtime: "edge" };

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export default async function handler(request) {
  if (request.method === "OPTIONS") return new Response(null, { headers: CORS });
  if (request.method !== "POST") return new Response("Method not allowed", { status: 405 });

  try {
    const { cv, job } = await request.json();
    if (!cv || !job) {
      return new Response(JSON.stringify({ error: "Missing CV or job description" }), {
        status: 400, headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        max_tokens: 4000,
        messages: [
          {
            role: "system",
            content: `You are an expert CV writer and career coach with 15 years of experience helping candidates land jobs at competitive companies. You write with precision, specificity, and impact. You never use hollow phrases like "proven track record", "results-driven", or "passionate about". You use strong action verbs, quantify achievements where possible, and mirror the language of the job description naturally without keyword stuffing.

Your task is to:
1. Extract the job title and company name from the job description
2. Rewrite the CV's experience bullets to be tailored for this specific role, keeping the candidate's actual experience intact but reframing and emphasising the most relevant parts
3. Write a cover letter that sounds human, confident, and specific to this role

Return ONLY valid JSON with this exact structure:
{
  "jobTitle": "extracted job title or empty string",
  "company": "extracted company name or empty string",
  "tailoredCv": "the full rewritten CV as plain text, preserving the original structure but with tailored bullet points",
  "coverLetter": "the full cover letter as plain text, 3-4 paragraphs, no placeholder text, signed off naturally"
}

Rules for the CV rewrite:
- Keep the candidate's actual job titles, companies, and dates exactly as provided
- Rewrite bullet points to emphasise skills and achievements most relevant to the target role
- Use language and keywords from the job description naturally
- Keep achievements quantified where the original had numbers, add estimates where plausible
- Do not invent experience the candidate does not have
- Keep the same overall structure (contact, experience, education, skills)

Rules for the cover letter:
- Address it to the hiring team if no specific name is available
- First paragraph: why this specific role at this specific company
- Second paragraph: most relevant experience, with specific examples
- Third paragraph: what you bring that goes beyond the CV
- Closing: confident, not desperate
- No "I am writing to apply for" openers
- No placeholder text like [Your Name] - use the name from the CV if available`,
          },
          {
            role: "user",
            content: `CV:\n${cv}\n\nJob Description:\n${job}`,
          },
        ],
      }),
    });

    const groqData = await groqRes.json();
    const raw = groqData.choices?.[0]?.message?.content?.trim();
    if (!raw) throw new Error("No response from AI");

    const clean = raw.replace(/```json|```/g, "").trim();
    const result = JSON.parse(clean);

    return new Response(JSON.stringify(result), {
      headers: { ...CORS, "Content-Type": "application/json" },
    });

  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...CORS, "Content-Type": "application/json" },
    });
  }
}
