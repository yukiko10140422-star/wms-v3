import { vi } from 'vitest'

type QueryBuilder = {
  select: ReturnType<typeof vi.fn>
  insert: ReturnType<typeof vi.fn>
  update: ReturnType<typeof vi.fn>
  delete: ReturnType<typeof vi.fn>
  upsert: ReturnType<typeof vi.fn>
  eq: ReturnType<typeof vi.fn>
  in: ReturnType<typeof vi.fn>
  gte: ReturnType<typeof vi.fn>
  limit: ReturnType<typeof vi.fn>
  order: ReturnType<typeof vi.fn>
  single: ReturnType<typeof vi.fn>
}

function createQueryBuilder(): QueryBuilder {
  const builder: QueryBuilder = {} as QueryBuilder
  const methods = ['select', 'insert', 'update', 'delete', 'upsert', 'eq', 'in', 'gte', 'limit', 'order', 'single'] as const
  for (const m of methods) {
    builder[m] = vi.fn().mockReturnValue(builder)
  }
  // select/single resolve with empty by default
  builder.select.mockImplementation(() => {
    const p = Promise.resolve({ data: [] as unknown[], error: null }) as unknown as Promise<{ data: unknown[]; error: null }> & QueryBuilder
    Object.assign(p, builder)
    return p
  })
  builder.single.mockResolvedValue({ data: null, error: null })
  return builder
}

export function createMockSupabase() {
  const queryBuilder = createQueryBuilder()

  const rpc = vi.fn().mockResolvedValue({ data: false, error: null })

  const channel = {
    on: vi.fn().mockReturnThis(),
    subscribe: vi.fn().mockReturnThis(),
  }

  const supabase = {
    from: vi.fn().mockReturnValue(queryBuilder),
    rpc,
    channel: vi.fn().mockReturnValue(channel),
    removeChannel: vi.fn(),
  }

  return { supabase, queryBuilder, rpc, channel }
}
