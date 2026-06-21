import { AsyncLocalStorage } from 'async_hooks'

export type TenantContext = {
  tenantId?: number
  role?: string
  userId?: number
} | null

const tenantStorage = new AsyncLocalStorage<TenantContext>()

export function getTenantContext() {
  return tenantStorage.getStore()
}

export function runWithTenantContext<T>(context: TenantContext, fn: () => T) {
  return tenantStorage.run(context, fn)
}
