import { streamText } from 'ai'

const gatewayProviderOptions = process.env.OPENAI_API_KEY
  ? {
      gateway: {
        byok: {
          openai: [{ apiKey: process.env.OPENAI_API_KEY }]
        }
      }
    }
  : undefined

const result = streamText({
  model: 'openai/gpt-5.5',
  prompt: 'Explain quantum computing in simple terms.',
  providerOptions: gatewayProviderOptions
})

for await (const chunk of result.textStream) {
  process.stdout.write(chunk)
}
