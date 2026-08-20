import { createAdminClient } from "@/app/lib/supabaseServer";
import { apiSuccess, apiError } from "@/app/lib/apiResponse";

/**
 * Production System Health Check & Observability Endpoint.
 * Used by Uptime Monitoring tools (Datadog, Better Stack, UptimeRobot)
 * to verify database latency, system uptime, and API health.
 */
export async function GET() {
  const startTime = Date.now();
  try {
    const supabaseAdmin = createAdminClient();
    const { error } = await supabaseAdmin.from("profiles").select("id").limit(1);

    const latencyMs = Date.now() - startTime;

    if (error) {
      return apiError(`Database connection check failed: ${error.message}`, 503, "SERVICE_UNAVAILABLE");
    }

    return apiSuccess({
      status: "healthy",
      database: "connected",
      latencyMs: `${latencyMs}ms`,
      uptimeSeconds: Math.floor(process.uptime()),
      environment: process.env.NODE_ENV || "development",
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    return apiError(err.message || "Health check failed", 500);
  }
}
