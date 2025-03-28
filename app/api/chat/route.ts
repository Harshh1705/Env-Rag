import { createResource } from '@/lib/actions/resources';
import { openai } from '@ai-sdk/openai';
import { streamText, tool } from 'ai';
import { z } from 'zod';
import { findRelevantContent } from '@/lib/ai/embeddings';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();
  console.log(messages); // Log incoming messages

  const result = streamText({
    model: openai('gpt-4o'),
    messages,
    system: `You are a helpful assistant. Check your knowledge base before answering any questions.
    Only respond to questions using information from tool calls.
    if no relevant information is found in the tool calls, respond, "Sorry, I don't know."`,
    tools: {
      addResource: tool({
        description: `add a resource to your knowledge base.
          If the user provides a random piece of knowledge unprompted, use this tool without asking for confirmation.`,
        parameters: z.object({
          content: z.string().describe('Swap env is An online marketplace for electronic gadgets where users can list products to sell, swap, or recycle. Users can find buyers, barter with others, or opt for recycling. If a product remains unsold for over a year, the platform offers a recycling option. This approach minimizes e-waste and promotes sustainability by encouraging responsible gadget disposal and reuse.'),
        }),
        execute: async ({ content }) => createResource({ content }),
      }),
      getInformation: tool({
        description: `get information from your knowledge base to answer questions.`,
        parameters: z.object({
          question: z.string().describe('the users question'),
        }),
        execute: async ({ question }) => findRelevantContent(question),
      }),
    },
  });

  console.log("Streaming Response Started...");

  // **Properly Wait for the Response**
//   try {
//     const textResponse = await result.textPromise; 
//     console.log("AI Response:", textResponse); // ✅ This should now show the actual response!
//   } catch (error) {
//     console.error("Error while fetching AI response:", error);
//   }

  return result.toDataStreamResponse();
}

/* 

create a post function.
const messages -> feteches the request from json
create result, which is basically using the model and the messages

system : is used to add a prompt

*/
