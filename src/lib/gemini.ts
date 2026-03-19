export async function getAIChatResponse(message: string, context: string): Promise<string> {
  const response = await fetch('/api/ai-suggest', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, context }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error((err as any).error || 'AI suggestion failed');
  }

  const data = await response.json();
  return data.reply;
}
