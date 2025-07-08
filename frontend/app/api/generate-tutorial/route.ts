import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { title, description } = await req.json()
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return NextResponse.json({ tutorial: 'No Gemini API key configured.' }, { status: 500 })
  }

  const prompt = `Give me a clear, step-by-step DIY tutorial for this project. Format as a numbered list.\nTitle: ${title}\nDescription: ${description}`

  try {
    const geminiRes = await fetch(
      'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=' + apiKey,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    )
    const data = await geminiRes.json()
    const tutorial = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No tutorial generated.'
    return NextResponse.json({ tutorial })
  } catch (e) {
    return NextResponse.json({ tutorial: 'Failed to generate tutorial.' }, { status: 500 })
  }
} 