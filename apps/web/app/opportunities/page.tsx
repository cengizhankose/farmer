import { mockAdapter } from "@adapters/core";

export default async function OpportunitiesPage() {
  const items = await mockAdapter.list();

  return (
    <div>
      <h1>Yield Opportunities</h1>
      <p>Discover DeFi yield farming opportunities across multiple chains.</p>

      <div style={{ marginTop: '2rem', display: 'grid', gap: '1rem' }}>
        {items.map(item => (
          <div key={item.id} style={{
            border: '1px solid #ccc',
            padding: '1rem',
            borderRadius: '8px'
          }}>
            <h3>{item.protocol} - {item.pool}</h3>
            <p>APR: {(item.apr * 100).toFixed(2)}% → APY: {(item.apy * 100).toFixed(2)}%</p>
            <p>Risk: <span style={{
              color: item.risk === 'low' ? 'green' : item.risk === 'med' ? 'orange' : 'red'
            }}>{item.risk}</span></p>
            {item.tvlUsd && <p>TVL: ${item.tvlUsd.toLocaleString()}</p>}
            <a href={`/opportunities/${item.id}`} style={{
              display: 'inline-block',
              marginTop: '0.5rem',
              padding: '0.25rem 0.5rem',
              backgroundColor: '#0070f3',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '4px',
              fontSize: '0.875rem'
            }}>
              View Details
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}