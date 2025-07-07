// OpenAI configuration placeholder
// To be configured with actual API key when ready

export const openaiConfig = {
  apiKey: process.env.VITE_OPENAI_API_KEY || '',
  model: 'gpt-4',
  temperature: 0.7,
};

// Example OpenAI client initialization (commented out until API key is provided)
// import OpenAI from 'openai'
// export const openai = new OpenAI({
//   apiKey: openaiConfig.apiKey,
//   dangerouslyAllowBrowser: true // Only for development
// })