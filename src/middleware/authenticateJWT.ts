import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";

const publicKey = fs.readFileSync(
  path.resolve(process.cwd(), "public.pem"),
  "utf-8"
);

export const authenticateJWT = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: { code: "AUTH_UNAUTHORIZED", message: "Token ausente" }
    });
  }

  try {
    const decoded: any = jwt.verify(token, publicKey, {
      algorithms: ["RS256"]
    });

    req.user = {
      ...decoded,
      tenantId: decoded.tenantId ?? decoded.tenant_id,
    }

    next();
  } catch {
    return res.status(401).json({
      success: false,
      error: { code: "AUTH_INVALID_TOKEN", message: "Token inválido" }
    });
  }
};