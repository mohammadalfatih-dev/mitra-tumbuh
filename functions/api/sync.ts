// Cloudflare Pages Functions - /api/sync
// Handles syncing data to Cloudflare D1 when deployed to Cloudflare Pages

export interface D1Result<T = unknown> {
  results: T[];
  success?: boolean;
}

export interface D1PreparedStatement {
  all<T = unknown>(): Promise<D1Result<T>>;
}

export interface D1Database {
  prepare(query: string): D1PreparedStatement;
}

export interface Env {
  DB?: D1Database;
}

export interface PagesContext<TEnv = Env> {
  env: TEnv;
  request: Request;
}

export type PagesFunction<TEnv = Env> = (context: PagesContext<TEnv>) => Promise<Response> | Response;

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const { env } = context;
    if (!env || !env.DB) {
      return new Response(
        JSON.stringify({
          status: 'ok',
          mode: 'preview_standalone',
          message: 'Cloudflare D1 binding (env.DB) is not attached. Running in client storage mode.',
        }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Example query from D1
    const { results: units } = await env.DB.prepare('SELECT * FROM cultivation_units ORDER BY created_at DESC').all();
    const { results: batches } = await env.DB.prepare('SELECT * FROM fish_batches ORDER BY created_at DESC').all();

    return new Response(
      JSON.stringify({
        status: 'ok',
        mode: 'cloudflare_d1_connected',
        units,
        batches,
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to fetch from D1' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
