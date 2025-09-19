"use client";

import { Opportunity } from "@adapters/core";

interface OpportunityCardProps {
  opportunity: Opportunity;
}

export function OpportunityCard({ opportunity }: OpportunityCardProps) {
  const formatApy = (value: number) => value.toFixed(2);
  const formatTvl = (value: number) => {
    if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
    if (value >= 1e3) return `$${(value / 1e3).toFixed(0)}K`;
    return `$${value.toLocaleString()}`;
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "low":
        return "#10b981"; // green-500
      case "med":
        return "#f59e0b"; // amber-500
      case "high":
        return "#ef4444"; // red-500
      default:
        return "#6b7280"; // gray-500
    }
  };

  const getSourceBadge = (source: string) => {
    const styles = {
      api: { bg: "#dcfce7", color: "#166534", text: "Live" },
      mock: { bg: "#fef3c7", color: "#92400e", text: "Demo" },
    };
    const style = styles[source as keyof typeof styles] || styles.mock;

    return (
      <span
        style={{
          backgroundColor: style.bg,
          color: style.color,
          padding: "2px 6px",
          borderRadius: "4px",
          fontSize: "0.75rem",
          fontWeight: "bold",
        }}
      >
        {style.text}
      </span>
    );
  };

  return (
    <div
      style={{
        border: "1px solid #e5e7eb",
        padding: "1.5rem",
        borderRadius: "12px",
        position: "relative",
        backgroundColor: "white",
        boxShadow:
          "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
        transition: "all 0.2s ease-in-out",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow =
          "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)";
        e.currentTarget.style.transform = "translateY(-1px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow =
          "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {/* Header with Protocol Logo and Source Badge */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "1rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          {opportunity.logoUrl && (
            <img
              src={opportunity.logoUrl}
              alt={opportunity.protocol}
              style={{ width: "32px", height: "32px", borderRadius: "50%" }}
              onError={(e) => {
                // Fallback to initials if logo fails to load
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
              }}
            />
          )}
          <div>
            <h3
              style={{
                margin: 0,
                fontSize: "1.125rem",
                fontWeight: "600",
                color: "#1f2937",
              }}
            >
              {opportunity.protocol}
            </h3>
            <p style={{ margin: 0, fontSize: "0.875rem", color: "#6b7280" }}>
              {opportunity.pool}
            </p>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: "0.5rem",
          }}
        >
          {getSourceBadge(opportunity.source)}
          <span
            style={{
              fontSize: "0.75rem",
              color: "#9ca3af",
              textAlign: "right",
            }}
          >
            Updated: {new Date(opportunity.lastUpdated).toLocaleTimeString()}
          </span>
        </div>
      </div>

      {/* APY Information */}
      <div style={{ marginBottom: "1rem" }}>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: "0.5rem",
            marginBottom: "0.5rem",
          }}
        >
          <span
            style={{ fontSize: "2rem", fontWeight: "bold", color: "#059669" }}
          >
            {formatApy(opportunity.apy)}%
          </span>
          <span style={{ fontSize: "0.875rem", color: "#6b7280" }}>APY</span>
        </div>

        {/* APY Breakdown */}
        {(opportunity.apyBase || opportunity.apyReward) && (
          <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>
            {opportunity.apyBase && (
              <span>Base: {formatApy(opportunity.apyBase)}%</span>
            )}
            {opportunity.apyBase && opportunity.apyReward && <span> + </span>}
            {opportunity.apyReward && (
              <span>Rewards: {formatApy(opportunity.apyReward)}%</span>
            )}
          </div>
        )}
      </div>

      {/* Metrics Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "1rem",
          marginBottom: "1rem",
        }}
      >
        <div>
          <p style={{ margin: 0, fontSize: "0.875rem", color: "#6b7280" }}>
            TVL
          </p>
          <p
            style={{
              margin: 0,
              fontSize: "1.125rem",
              fontWeight: "600",
              color: "#1f2937",
            }}
          >
            {formatTvl(opportunity.tvlUsd)}
          </p>
        </div>

        <div>
          <p style={{ margin: 0, fontSize: "0.875rem", color: "#6b7280" }}>
            Risk
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <div
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: getRiskColor(opportunity.risk),
              }}
            />
            <span
              style={{
                fontSize: "1.125rem",
                fontWeight: "600",
                color: getRiskColor(opportunity.risk),
                textTransform: "capitalize",
              }}
            >
              {opportunity.risk}
            </span>
          </div>
        </div>
      </div>

      {/* Tokens */}
      <div style={{ marginBottom: "1rem" }}>
        <p
          style={{
            margin: "0 0 0.25rem 0",
            fontSize: "0.875rem",
            color: "#6b7280",
          }}
        >
          Tokens
        </p>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {opportunity.tokens.map((token, index) => (
            <span
              key={index}
              style={{
                padding: "2px 8px",
                backgroundColor: "#f3f4f6",
                color: "#374151",
                borderRadius: "6px",
                fontSize: "0.875rem",
                fontWeight: "500",
              }}
            >
              {token}
            </span>
          ))}
        </div>
      </div>

      {/* Reward Tokens */}
      {opportunity.rewardToken && (
        <div style={{ marginBottom: "1rem" }}>
          <p
            style={{
              margin: "0 0 0.25rem 0",
              fontSize: "0.875rem",
              color: "#6b7280",
            }}
          >
            Rewards
          </p>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {Array.isArray(opportunity.rewardToken) ? (
              opportunity.rewardToken.map((token, index) => (
                <span
                  key={index}
                  style={{
                    padding: "2px 8px",
                    backgroundColor: "#ecfdf5",
                    color: "#065f46",
                    borderRadius: "6px",
                    fontSize: "0.875rem",
                    fontWeight: "500",
                  }}
                >
                  {token}
                </span>
              ))
            ) : (
              <span
                style={{
                  padding: "2px 8px",
                  backgroundColor: "#ecfdf5",
                  color: "#065f46",
                  borderRadius: "6px",
                  fontSize: "0.875rem",
                  fontWeight: "500",
                }}
              >
                {opportunity.rewardToken}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Additional Metadata */}
      {(opportunity.volume24h ||
        opportunity.exposure ||
        opportunity.ilRisk) && (
        <div
          style={{
            padding: "0.75rem",
            backgroundColor: "#f9fafb",
            borderRadius: "8px",
            marginBottom: "1rem",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(80px, 1fr))",
              gap: "0.5rem",
            }}
          >
            {opportunity.volume24h && (
              <div>
                <p style={{ margin: 0, fontSize: "0.75rem", color: "#6b7280" }}>
                  24h Volume
                </p>
                <p
                  style={{
                    margin: 0,
                    fontSize: "0.875rem",
                    fontWeight: "500",
                    color: "#374151",
                  }}
                >
                  {formatTvl(opportunity.volume24h)}
                </p>
              </div>
            )}
            {opportunity.exposure && (
              <div>
                <p style={{ margin: 0, fontSize: "0.75rem", color: "#6b7280" }}>
                  Exposure
                </p>
                <p
                  style={{
                    margin: 0,
                    fontSize: "0.875rem",
                    fontWeight: "500",
                    color: "#374151",
                    textTransform: "capitalize",
                  }}
                >
                  {opportunity.exposure}
                </p>
              </div>
            )}
            {opportunity.ilRisk && (
              <div>
                <p style={{ margin: 0, fontSize: "0.75rem", color: "#6b7280" }}>
                  IL Risk
                </p>
                <p
                  style={{
                    margin: 0,
                    fontSize: "0.875rem",
                    fontWeight: "500",
                    color: "#374151",
                    textTransform: "capitalize",
                  }}
                >
                  {opportunity.ilRisk}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Button */}
      <a
        href={`/opportunities/${opportunity.id}`}
        style={{
          display: "block",
          width: "100%",
          padding: "0.75rem",
          backgroundColor: "#2563eb",
          color: "white",
          textDecoration: "none",
          borderRadius: "8px",
          fontSize: "0.875rem",
          fontWeight: "600",
          textAlign: "center",
          transition: "background-color 0.2s ease-in-out",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "#1d4ed8";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "#2563eb";
        }}
      >
        View Details
      </a>
    </div>
  );
}
