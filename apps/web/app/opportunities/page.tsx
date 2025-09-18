import { adapterManager } from "@adapters/core";
import { OpportunityFilters } from "../components/OpportunityFilters";

export default async function OpportunitiesPage() {
  // Now fetches real data from multiple sources with caching
  const opportunities = await adapterManager.getAllOpportunities();
  const stats = await adapterManager.getAdapterStats();

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '1rem' }}>
          Yield Opportunities
        </h1>
        <p style={{ fontSize: '1.125rem', color: '#6b7280', marginBottom: '2rem' }}>
          Live data from DefiLlama and Arkadiko APIs. Discover the best DeFi yield farming opportunities across the Stacks ecosystem.
        </p>

        {/* Stats Overview */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <div style={{
            padding: '1.5rem',
            backgroundColor: '#f8fafc',
            borderRadius: '12px',
            border: '1px solid #e2e8f0'
          }}>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', color: '#64748b' }}>Total Opportunities</h3>
            <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: '#1e293b' }}>
              {stats.totalOpportunities}
            </p>
          </div>

          <div style={{
            padding: '1.5rem',
            backgroundColor: '#f0fdf4',
            borderRadius: '12px',
            border: '1px solid #bbf7d0'
          }}>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', color: '#15803d' }}>Total TVL</h3>
            <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: '#166534' }}>
              ${(stats.totalTvl / 1e6).toFixed(1)}M
            </p>
          </div>

          <div style={{
            padding: '1.5rem',
            backgroundColor: '#fef7ff',
            borderRadius: '12px',
            border: '1px solid #f3e8ff'
          }}>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', color: '#7c3aed' }}>Average APY</h3>
            <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: '#6b21a8' }}>
              {(stats.avgApy * 100).toFixed(1)}%
            </p>
          </div>

          <div style={{
            padding: '1.5rem',
            backgroundColor: '#fffbeb',
            borderRadius: '12px',
            border: '1px solid #fed7aa'
          }}>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', color: '#c2410c' }}>Data Sources</h3>
            <p style={{ margin: 0, fontSize: '1rem', fontWeight: '600', color: '#9a3412' }}>
              {Object.keys(stats.bySource).join(', ')}
            </p>
          </div>
        </div>

      </div>

      {/* Opportunities with Filters */}
      <OpportunityFilters opportunities={opportunities} stats={stats} />

      {/* Footer Info */}
      <div style={{
        marginTop: '4rem',
        padding: '2rem',
        backgroundColor: '#f8fafc',
        borderRadius: '12px',
        border: '1px solid #e2e8f0'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
          <div>
            <h4 style={{ margin: '0 0 1rem 0', fontSize: '1.125rem', color: '#1f2937' }}>Data Sources</h4>
            <ul style={{ margin: 0, padding: '0 0 0 1rem', color: '#6b7280' }}>
              <li>DefiLlama API - Cross-chain yield data</li>
              <li>Arkadiko API - Native Stacks AMM data</li>
              <li>Real-time updates every 5 minutes</li>
            </ul>
          </div>
          <div>
            <h4 style={{ margin: '0 0 1rem 0', fontSize: '1.125rem', color: '#1f2937' }}>Risk Information</h4>
            <ul style={{ margin: 0, padding: '0 0 0 1rem', color: '#6b7280' }}>
              <li><strong>Low:</strong> Stable pools, low volatility</li>
              <li><strong>Medium:</strong> Mixed assets, moderate risk</li>
              <li><strong>High:</strong> Volatile assets, high yield potential</li>
            </ul>
          </div>
        </div>
        <p style={{
          margin: '2rem 0 0 0',
          padding: '1rem',
          backgroundColor: '#fef3c7',
          borderRadius: '8px',
          fontSize: '0.875rem',
          color: '#92400e'
        }}>
          <strong>⚠️ BETA:</strong> This is experimental software. Always DYOR (Do Your Own Research) before investing.
          Last updated: {new Date(stats.lastUpdate).toLocaleString()}
        </p>
      </div>
    </div>
  );
}