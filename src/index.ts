import { GoogleGenerativeAI } from '@google/generative-ai';

export default {
	async fetch(request, env, ctx): Promise<Response> {
		const { searchParams } = new URL(request.url);
		const prompt = searchParams.get('prompt');

		if (!prompt) {
			return Response.json(
				{ 
					success: false, 
					error: 'Prompt missing! Add a prompt to the URL using ?prompt=', 
					response: null 
				},
				{ status: 400 }
			);
		}

		const genAI = new GoogleGenerativeAI(env.GOOGLE_GEMINI_API_KEY);

		try {
			// Use Gemini 2.0 Flash model
			const model = genAI.getGenerativeModel(
				{ model: 'gemini-2.0-flash-exp' },
				{
					baseUrl: `https://gateway.ai.cloudflare.com/v1/${env.CLOUDFLARE_ACCOUNT_ID}/${env.CLOUDFLARE_AI_GATEWAY_NAME}/google-ai-studio`,
				}
			);
			
			const result = await model.generateContent(prompt);
			const response = await result.response;
			const text = response.text();
			
			return Response.json({ 
				success: true, 
				response: text 
			}, { status: 200 });
			
		} catch (error) {
			console.error('Error details:', error);
			
			// Better error handling
			const errorMessage = error instanceof Error ? error.message : 'Unknown error';
			const errorDetails = {
				message: errorMessage,
				...(error && typeof error === 'object' ? error : {})
			};
			
			return Response.json({ 
				success: false, 
				error: errorDetails, 
				response: null 
			}, { status: 500 });
		}
	},
} satisfies ExportedHandler<Env>;
