import { adapterManager } from "@adapters/core";

export async function GET() {
  const startTime = Date.now();

  try {
    const [opportunities, stats, healthStatus, cacheStats] = await Promise.all([
      adapterManager.getAllOpportunities(),
      adapterManager.getAdapterStats(),
      adapterManager.healthCheck(),
      Promise.resolve(adapterManager.getCacheStats()),
    ]);

    const endTime = Date.now();
    const responseTime = endTime - startTime;

    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
      data: {
        totalOpportunities: opportunities.length,
        stats: {
          totalTvl: stats.totalTvl,
          avgApy: stats.avgApy,
          bySource: stats.bySource,
          byProtocol: stats.byProtocol,
          lastUpdate: new Date(stats.lastUpdate).toISOString(),
        },
        adapters: Object.fromEntries(
          Array.from(healthStatus.entries()).map(([name, status]) => [
            name,
            {
              healthy: status,
              opportunities: opportunities.filter(opp =>
                opp.id.startsWith(name) || opp.protocol.toLowerCase() === name
              ).length,
            }
          ])
        ),
        cache: {
          ...cacheStats,
          oldestEntry: cacheStats.oldestEntry ? new Date(cacheStats.oldestEntry).toISOString() : null,
          newestEntry: cacheStats.newestEntry ? new Date(cacheStats.newestEntry).toISOString() : null,
        },
      },
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
    };

    // Determine overall status
    const unhealthyAdapters = Array.from(healthStatus.values()).filter(status => !status).length;
    if (unhealthyAdapters > 0) {
      health.status = opportunities.length === 0 ? 'unhealthy' : 'degraded';
    }

    const statusCode = health.status === 'healthy' ? 200 : health.status === 'degraded' ? 207 : 503;

    return Response.json(health, { status: statusCode });
  } catch (error) {
    const errorResponse = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      responseTime: `${Date.now() - startTime}ms`,
    };

    return Response.json(errorResponse, { status: 503 });
  }
}

export async function POST() {
  try {
    // Force refresh all data
    console.log('Manual data refresh requested via API');
    const results = await adapterManager.refreshAllData();

    const refreshedData = Array.from(results.entries()).map(([protocol, opportunities]) => ({
      protocol,
      opportunities: opportunities.length,
      success: opportunities.length > 0
    }));

    return Response.json({
      status: 'success',
      timestamp: new Date().toISOString(),
      message: 'Data refreshed successfully',
      results: refreshedData,
    });
  } catch (error) {
    return Response.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}