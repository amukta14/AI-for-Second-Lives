import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { pincode } = await req.json()
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return NextResponse.json({ tips: [], centers: [], zipcode: pincode, error: 'No Gemini API key configured.' }, { status: 500 })
  }

  const prompt = `You are a recycling assistant for India. For pincode ${pincode}, Hyderabad, Telangana, always mention the Greater Hyderabad Municipal Corporation (GHMC) as a reliable source for recycling information. Generate exactly 3 plausible, relevant recycling centers for this pincode. Each center must have a realistic name, address in the pincode, a realistic random 10-digit Indian phone number (no Xs or placeholders), and a website if possible. All centers must be relevant to the pincode. Format your response as JSON: { "centers": [{ "name": "...", "address": "...", "phone": "...", "website": "..." }, ...] }.`

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
    // Try to extract JSON from the response
    let centers = []
    let jsonMatch = data.candidates?.[0]?.content?.parts?.[0]?.text?.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0])
        centers = parsed.centers || []
      } catch {}
    }
    return NextResponse.json({ centers, zipcode: pincode })
  } catch (e) {
    return NextResponse.json({ centers: [], zipcode: pincode, error: 'Failed to generate centers.' }, { status: 500 })
  }
} 