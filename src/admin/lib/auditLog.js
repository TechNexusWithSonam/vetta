import { api } from '../../api';

/**
 * Fire-and-forget audit trail for admin mutations. Called right after the
 * triggering `api.admin.*` write resolves. Best-effort: a failure here must
 * never surface as if the (already-successful) mutation itself failed.
 * @param {{action:string, entityType:string, entityId?:string, organizationId?:string, summary:string, metadata?:object, actor?:{id?:string,email?:string}}} entry
 */
export async function logAdminAction({ action, entityType, entityId, organizationId, summary, metadata, actor }) {
  try {
    await api.admin.auditLogs.create({
      action,
      entityType,
      entityId,
      organizationId,
      summary,
      metadata: metadata || {},
      actorId: actor?.id,
      actorEmail: actor?.email,
    });
  } catch {
    /* best-effort only — never block on audit logging */
  }
}

export default logAdminAction;
