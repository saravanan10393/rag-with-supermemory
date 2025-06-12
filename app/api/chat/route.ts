import { openai } from "@ai-sdk/openai";
import { streamText, tool } from "ai";
import { z } from "zod";

import { queryDB } from "@/lib/vector.ts";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, userId = "" } = await req.json();

  const result = streamText({
    model: openai("o4-mini"),
    system: `
    You are Product Q/A Master.
    You will answer to the user query based on the product details provided by you.
    You can use the get_product_details_for_user_query tool to get the product details.
    You will answer to the user by interpretting product details and provide them with crips, minimal, easy to read and visually pleasing manner. If you can't find any product details
    then you will politly say you dont have the product details as of now.

    ---------
    Guidelines to Q/A
    1. If you can't find any product details then you will politly say you dont have the product details as of now.
    2. Dont overwhelm user with too much information.
    3. Use Tables If you have more than 1 product details then use tables to show them.
    4. If the user greets you then greet them back with your purpose and tell them how you can help them.
    `,
    maxSteps: 10,
    messages,
    tools: {
      get_product_details_for_user_query: tool({
        description: "Get the Product details to provide answers to user query",
        parameters: z.object({
          user_query: z.string().describe("Product details user asked"),
        }),
        execute: async ({ user_query }) => {
          console.log("requested user query ", user_query);
          const result = await queryDB(user_query, userId);
          console.log("vector result ", result);
          return {
            productInformation: result,
          };
        },
      }),
    },
  });

  return result.toDataStreamResponse();
}
