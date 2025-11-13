const OPENROUTER_API_KEY = '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'
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'

export async function sendMessage(messages) {
  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'AI Chatbot'
      },
      body: JSON.stringify({
        model: 'openai/gpt-3.5-turbo',
        messages: messages.map(msg => ({
          role: msg.type === 'bot' ? 'assistant' : 'user',
          content: msg.content
        }))
      })
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`)
    }

    const data = await response.json()
    return data.choices[0].message.content
  } catch (error) {
    console.error('Error calling OpenRouter API:', error)
    throw error
  }
}
