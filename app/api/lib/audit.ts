import { getDb } from "../queries/connection";
import { auditLogs } from "@db/schema";

interface AuditParams {
  userId?: number;
  userEmail?: string;
  action: string;
  entity?: string;
  entityId?: number;
  detail?: string;
  ip?: string;
}

/** Fire-and-forget audit log — nunca bloqueia a operação principal. */
export function audit(params: AuditParams): void {
  getDb()
    .insert(auditLogs)
    .values({
      userId: params.userId ?? null,
      userEmail: params.userEmail ?? null,
      action: params.action,
      entity: params.entity ?? null,
      entityId: params.entityId ?? null,
      detail: params.detail ?? null,
      ip: params.ip ?? null,
    })
    .catch((err) => {
      console.error("[audit] Falha ao gravar log:", err?.message);
    });
}
