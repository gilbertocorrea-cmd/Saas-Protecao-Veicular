export const checkTenant = (req: any, res: any, next: any) => {
  try {
    const tenantId =
      req.tenantId ??
      req.user?.tenantId

    if (!tenantId) {
      return res.status(403).json({
        success: false,
        error: {
          code: "TENANT_REQUIRED",
          message: "Tenant não identificado"
        }
      })
    }

    req.tenantId = Number(tenantId)

    next()
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: {
        code: "TENANT_ERROR",
        message: "Erro ao processar tenant"
      }
    })
  }
}