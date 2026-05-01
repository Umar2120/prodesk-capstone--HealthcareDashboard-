export async function summarizePatientHistory(medicalEvents, patientInfo) {
  const response = await fetch('/api/ai-summary', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ medicalEvents, patientInfo }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `AI summary request failed: ${response.status}`);
  }

  return data.summary || 'No summary generated.';
}
