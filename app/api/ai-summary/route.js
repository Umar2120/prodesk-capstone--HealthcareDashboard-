import { NextResponse } from 'next/server';

function formatMedicalEvents(medicalEvents = []) {
  return medicalEvents
    .map((event) => {
      const date = event.date || 'Unknown date';
      const type = event.type || 'medical';
      const title = event.title || 'Untitled';
      const description = event.description || 'No description';
      const severity = event.severity || 'not specified';
      return `- ${date}: ${type.toUpperCase()} - "${title}" (${severity} severity): ${description}`;
    })
    .join('\n');
}

export async function POST(request) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: 'OpenAI API key not configured. Please set OPENAI_API_KEY on the server.' },
      { status: 500 }
    );
  }

  try {
    const { medicalEvents = [], patientInfo = {} } = await request.json();
    const patientName = patientInfo?.name || 'Patient';
    const conditions = patientInfo?.conditions?.join(', ') || 'None on file';
    const allergies = patientInfo?.allergies?.join(', ') || 'None on file';
    const eventsSummary = formatMedicalEvents(medicalEvents);

    const prompt = `You are a medical AI assistant providing a concise summary of a patient's medical history for healthcare professionals.

PATIENT INFORMATION:
- Name: ${patientName}
- Known Conditions: ${conditions}
- Known Allergies: ${allergies}

MEDICAL EVENTS (chronological from most recent):
${eventsSummary}

Please provide a structured summary that includes:
1. **Overview**: Brief 2-3 sentence summary of the patient's health journey
2. **Key Conditions**: Main health issues identified from the history
3. **Recent Activity**: Most significant recent medical events (last 3)
4. **Trends**: Any patterns or concerning trends
5. **Recommendations**: Brief suggestions for follow-up care

Keep the summary professional, concise, and clinically relevant. Use bullet points for clarity.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content:
              'You are a medical AI assistant specializing in summarizing patient medical histories for healthcare professionals. Be concise, clinically accurate, and professional.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.error?.message || `OpenAI API error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ summary: data.choices[0]?.message?.content || 'No summary generated.' });
  } catch (error) {
    console.error('AI summarization error:', error);
    return NextResponse.json({ error: 'Unable to generate the AI summary right now.' }, { status: 500 });
  }
}
