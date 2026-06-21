import { redis } from '../../config/redis'

const FIPE_API_BASE = 'https://parallelum.com.br/fipe/api/v2'
const CACHE_TTL = 24 * 60 * 60 // 24 hours

async function fetchWithCache(url: string, cacheKey: string) {
  try {
    // Try Redis first
    const cached = await redis.get(cacheKey)
    if (cached) {
      return JSON.parse(cached)
    }
  } catch (err) {
    console.warn('Redis not available, using direct fetch')
  }

  // Fetch from API
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`FIPE API error: ${response.status}`)
  }
  const data = await response.json()

  // Cache if Redis available
  try {
    await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(data))
  } catch (err) {
    // Ignore cache errors
  }

  return data
}

export async function getBrands() {
  const url = `${FIPE_API_BASE}/cars/brands`
  return fetchWithCache(url, 'fipe:brands')
}

export async function getModels(brandId: string) {
  const url = `${FIPE_API_BASE}/cars/brands/${brandId}/models`
  return fetchWithCache(url, `fipe:models:${brandId}`)
}

export async function getYears(brandId: string, modelId: string) {
  const url = `${FIPE_API_BASE}/cars/brands/${brandId}/models/${modelId}/years`
  return fetchWithCache(url, `fipe:years:${brandId}:${modelId}`)
}

export async function getPrice(brandId: string, modelId: string, yearId: string) {
  const url = `${FIPE_API_BASE}/cars/brands/${brandId}/models/${modelId}/years/${yearId}`
  return fetchWithCache(url, `fipe:price:${brandId}:${modelId}:${yearId}`)
}

// Legacy functions for compatibility
export async function getFipeData(placa: string) {
  // This would require a different API, but for now return null
  return null
}

export async function getFipeValue(marca: string, modelo: string, ano: number) {
  // Simplified, would need to find codes first
  return null
}
