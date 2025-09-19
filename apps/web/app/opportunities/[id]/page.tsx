import { adapterManager } from "@adapters/core";
import { notFound } from "next/navigation";
import { RiskScore, RiskBreakdown, RiskFactors } from "../../components/risk";

export default async function OpportunityDetailPage({
  params
}: {
  params: { id: string }
}) {
  const opportunity = await adapterManager.getEnrichedOpportunityById(params.id);

  if (!opportunity) {
    notFound();
  }

  return (
    <div>
      <h1>{opportunity.protocol} - {opportunity.pool}</h1>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginTop: '2rem'
      }}>
        <div style={{ padding: '1rem', border: '1px solid #ccc', borderRadius: '8px' }}>
          <h3>Returns</h3>
          <p>APR: {(opportunity.apr * 100).toFixed(2)}%</p>
          <p>APY: {(opportunity.apy * 100).toFixed(2)}%</p>
        </div>

        <div style={{ padding: '1rem', border: '1px solid #ccc', borderRadius: '8px' }}>
          <h3>Risk Assessment</h3>
          {opportunity.riskScore ? (
            <RiskScore riskScore={opportunity.riskScore} showDetails size="lg" />
          ) : (
            <p style={{
              color: opportunity.risk === 'low' ? 'green' :
                     opportunity.risk === 'med' ? 'orange' : 'red',
              fontSize: '1.25rem',
              fontWeight: 'bold'
            }}>
              {opportunity.risk.toUpperCase()}
            </p>
          )}
        </div>

        <div style={{ padding: '1rem', border: '1px solid #ccc', borderRadius: '8px' }}>
          <h3>Pool Details</h3>
          <p>Tokens: {opportunity.tokens.join(' / ')}</p>
          {opportunity.tvlUsd && <p>TVL: ${opportunity.tvlUsd.toLocaleString()}</p>}
          {opportunity.rewardToken && <p>Reward: {opportunity.rewardToken}</p>}
        </div>
      </div>

      {/* Detailed Risk Analysis */}
      {opportunity.riskScore && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '2rem',
          marginTop: '3rem'
        }}>
          <RiskBreakdown riskScore={opportunity.riskScore} />
          {opportunity.riskFactors && opportunity.riskFactors.length > 0 && (
            <RiskFactors riskFactors={opportunity.riskFactors} />
          )}
        </div>
      )}

      <div style={{ marginTop: '2rem' }}>
        <button
          disabled
          style={{
            padding: '1rem 2rem',
            backgroundColor: '#ccc',
            color: '#666',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            cursor: 'not-allowed'
          }}
        >
          Deposit (Router Coming Soon)
        </button>
        <p style={{
          marginTop: '0.5rem',
          fontSize: '0.875rem',
          color: '#666'
        }}>
          Router contract deployment in progress
        </p>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <p style={{ fontSize: '0.75rem', color: '#999' }}>
          ⚠️ BETA - This is experimental software. Not financial advice.
          Always do your own research before investing.
        </p>
      </div>
    </div>
  );
}