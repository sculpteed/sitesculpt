import Anthropic from '@anthropic-ai/sdk';
import { env } from '@/lib/env';

let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (client) return client;
  client = new Anthropic({ apiKey: env().ANTHROPIC_API_KEY });
  return client;
}

/**
 * Call Claude with a tool-use schema and return the parsed JSON tool input.
 * This is our "structured output" primitive — every step that needs JSON uses this.
 */
export async function claudeJson<T>(args: {
  system: string;
  user: string;
  toolName: string;
  toolDescription: string;
  schema: Record<string, unknown>;
}): Promise<T> {
  const c = getClient();
  const response = await c.messages.create({
    model: env().ANTHROPIC_MODEL,
    max_tokens: 4096,
    system: args.system,
    tools: [
      {
        name: args.toolName,
        description: args.toolDescription,
        input_schema: args.schema as Anthropic.Tool.InputSchema,
      },
    ],
    tool_choice: { type: 'tool', name: args.toolName },
    messages: [{ role: 'user', content: args.user }],
  });

  const toolUse = response.content.find((block) => block.type === 'tool_use');
  if (!toolUse || toolUse.type !== 'tool_use') {
    throw new Error(`Claude did not return a ${args.toolName} tool_use block`);
  }
  return toolUse.input as T;
}
