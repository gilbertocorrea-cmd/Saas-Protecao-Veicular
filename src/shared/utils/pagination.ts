export function paginate(page = 1, pageSize = 20) {
  const currentPage = Math.max(1, page)
  const limit = Math.max(1, pageSize)
  const skip = (currentPage - 1) * limit
  return { skip, take: limit }
}
