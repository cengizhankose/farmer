export default function PortfolioPage() {
  return (
    <div>
      <h1>Portfolio</h1>
      <p>Track your DeFi investments and performance.</p>

      <div style={{
        marginTop: '2rem',
        padding: '2rem',
        border: '1px solid #ccc',
        borderRadius: '8px',
        textAlign: 'center'
      }}>
        <h2>Coming Soon (Day 3)</h2>
        <p>Portfolio tracking will be available after router deployment.</p>
        <ul style={{
          listStyle: 'none',
          padding: 0,
          marginTop: '1rem'
        }}>
          <li>✅ Wallet connection</li>
          <li>✅ Position tracking</li>
          <li>✅ P&L calculations</li>
          <li>✅ Transaction history</li>
        </ul>
      </div>
    </div>
  );
}