export default function HomePage() {
  return (
    <div>
      <h1>Stacks Yield Aggregator</h1>
      <p>Discover and manage DeFi yield opportunities across multiple chains.</p>
      <div style={{ marginTop: '2rem' }}>
        <a href="/opportunities" style={{
          display: 'inline-block',
          padding: '0.5rem 1rem',
          backgroundColor: '#0070f3',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '4px',
          marginRight: '1rem'
        }}>
          Explore Opportunities
        </a>
        <a href="/portfolio" style={{
          display: 'inline-block',
          padding: '0.5rem 1rem',
          border: '1px solid #0070f3',
          color: '#0070f3',
          textDecoration: 'none',
          borderRadius: '4px'
        }}>
          View Portfolio
        </a>
      </div>
    </div>
  )
}