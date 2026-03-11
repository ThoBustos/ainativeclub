/**
 * Rate limiting for server actions.
 *
 * TODO: Configure Upstash Redis to enable production rate limiting:
 * 1. Create a Redis database at https://console.upstash.com
 * 2. Add UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN to your .env.local
 * 3. Install packages: pnpm add @upstash/ratelimit @upstash/redis
 * 4. Replace the stubs below with the Upstash implementation:
 *
 * import { Ratelimit } from "@upstash/ratelimit";
 * import { Redis } from "@upstash/redis";
 *
 * export const applicationRatelimit = new Ratelimit({
 *   redis: Redis.fromEnv(),
 *   limiter: Ratelimit.slidingWindow(3, "1 h"),
 *   analytics: true,
 *   prefix: "anc:application",
 * });
 *
 * export const waitlistRatelimit = new Ratelimit({
 *   redis: Redis.fromEnv(),
 *   limiter: Ratelimit.slidingWindow(5, "1 h"),
 *   prefix: "anc:waitlist",
 * });
 */

type RatelimitResult = { success: boolean };

// Stubs: always allow — replace with Upstash when configured
export const applicationRatelimit = {
  limit: async (_identifier: string): Promise<RatelimitResult> => ({ success: true }),
};

export const waitlistRatelimit = {
  limit: async (_identifier: string): Promise<RatelimitResult> => ({ success: true }),
};
