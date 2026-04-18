import Anthropic from '@anthropic-ai/sdk';
import { env } from '@/lib/env';

let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (client) return client;
  client = new Anthropic({ apiKey: env().ANTHROPIC_API_KEY });
  return client;
}

export interface ImageInput {
  /** base64 image data (no "data:image/...;base64," prefix) */
  data: string;
  mediaType: 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';
}

/** Strip the "data:image/xyz;base64," prefix from a data URL. */
export function parseDataUrl(dataUrl: string): ImageInput | null {
  const match = dataUrl.match(/^data:(image\/(?:jpeg|jpg|png|gif|webp));base64,(.+)$/);
  if (!match) return null;
  const mediaType = match[1] === 'image/jpg' ? 'image/jpeg' : match[1];
  return {
    mediaType: mediaType as ImageInput['mediaType'],
    data: match[2]!,
  };
}

/**
 * Call the model with a tool-use schema and return the parsed JSON tool input.
 * Optionally accepts a vision image + adaptive thinking for harder tasks.
 *
 * `thinking` enables the model's adaptive extended thinking — the model auto-
 * adjusts depth based on task complexity (no budget tuning needed).
 */
export async function claudeJson<T>(args: {
  system: string;
  user: string;
  toolName: string;
  toolDescription: string;
  schema: Record<string, unknown>;
  image?: ImageInput;
  thinking?: boolean;
  maxTokens?: number;
}): Promise<T> {
  const c = getClient();
  const userContent = args.image
    ? ([
        {
          type: 'image' as const,
          source: {
            type: 'base64' as const,
            media_type: args.image.mediaType,
            data: args.image.data,
          },
        },
        { type: 'text' as const, text: args.user },
      ])
    : args.user;

  const request: Anthropic.MessageCreateParamsNonStreaming = {
    model: env().ANTHROPIC_MODEL,
    max_tokens: args.maxTokens ?? 4096,
    system: args.system,
    tools: [
      {
        name: args.toolName,
        description: args.toolDescription,
        input_schema: args.schema as Anthropic.Tool.InputSchema,
      },
    ],
    tool_choice: { type: 'tool', name: args.toolName },
    messages: [{ role: 'user', content: userContent }],
  };

  if (args.thinking) {
    // Adaptive thinking — the model picks depth per turn. Compatible with
    // tool_choice: 'tool' on 4.7+.
    (request as Anthropic.MessageCreateParamsNonStreaming & {
      thinking?: { type: 'enabled' };
    }).thinking = { type: 'enabled' };
  }

  const response = await c.messages.create(request);

  const toolUse = response.content.find((block) => block.type === 'tool_use');
  if (!toolUse || toolUse.type !== 'tool_use') {
    throw new Error(`the model  return a ${args.toolName} tool_use block`);
  }
  return toolUse.input as T;
}
