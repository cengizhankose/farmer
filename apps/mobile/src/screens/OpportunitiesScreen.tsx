import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';

const OpportunitiesScreen = () => {
  const mockOpportunities = [
    {
      id: '1',
      protocol: 'ALEX',
      pool: 'STX/USDA',
      apy: 0.12,
      risk: 'Low',
      disabled: false,
    },
    {
      id: '2',
      protocol: 'Arkadiko',
      pool: 'DIKO/STX',
      apy: 0.18,
      risk: 'Medium',
      disabled: false,
    },
    {
      id: '3',
      protocol: 'Uniswap',
      pool: 'ETH/USDC',
      apy: 0.08,
      risk: 'Low',
      disabled: true,
    },
    {
      id: '4',
      protocol: 'Raydium',
      pool: 'SOL/USDC',
      apy: 0.15,
      risk: 'Medium',
      disabled: true,
    },
  ];

  const formatPercent = (value: number) => {
    return `${(value * 100).toFixed(2)}%`;
  };

  const getRiskColor = (risk: string) => {
    switch (risk.toLowerCase()) {
      case 'low':
        return '#059669';
      case 'medium':
        return '#d97706';
      case 'high':
        return '#dc2626';
      default:
        return '#64748b';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Yield Opportunities</Text>
        <Text style={styles.subtitle}>
          Discover DeFi yield farming opportunities across multiple chains
        </Text>
      </View>

      <View style={styles.filtersContainer}>
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterButtonText}>All Chains</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterButtonText}>All Risks</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.opportunitiesContainer}>
        {mockOpportunities.map((opportunity) => (
          <TouchableOpacity
            key={opportunity.id}
            style={[
              styles.opportunityCard,
              opportunity.disabled && styles.disabledCard,
            ]}
            disabled={opportunity.disabled}
          >
            <View style={styles.opportunityHeader}>
              <View>
                <Text style={styles.protocolName}>{opportunity.protocol}</Text>
                <Text style={styles.poolName}>{opportunity.pool}</Text>
              </View>
              {opportunity.disabled && (
                <View style={styles.comingSoonBadge}>
                  <Text style={styles.comingSoonText}>Coming Soon</Text>
                </View>
              )}
            </View>

            <View style={styles.opportunityStats}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>APY</Text>
                <Text style={styles.apyValue}>
                  {formatPercent(opportunity.apy)}
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Risk</Text>
                <Text
                  style={[
                    styles.riskValue,
                    { color: getRiskColor(opportunity.risk) },
                  ]}
                >
                  {opportunity.risk}
                </Text>
              </View>
            </View>

            {!opportunity.disabled && (
              <TouchableOpacity style={styles.depositButton}>
                <Text style={styles.depositButtonText}>View Details</Text>
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.disclaimerContainer}>
        <Text style={styles.disclaimerText}>
          ⚠️ BETA - This is experimental software. Not financial advice.
          Always do your own research before investing.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    lineHeight: 24,
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 24,
    gap: 12,
  },
  filterButton: {
    backgroundColor: 'white',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  filterButtonText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '500',
  },
  opportunitiesContainer: {
    paddingHorizontal: 24,
    gap: 16,
  },
  opportunityCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  disabledCard: {
    opacity: 0.6,
  },
  opportunityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  protocolName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  poolName: {
    fontSize: 14,
    color: '#64748b',
  },
  comingSoonBadge: {
    backgroundColor: '#fef3c7',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  comingSoonText: {
    fontSize: 12,
    color: '#92400e',
    fontWeight: '500',
  },
  opportunityStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  apyValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#059669',
  },
  riskValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  depositButton: {
    backgroundColor: '#059669',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  depositButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  disclaimerContainer: {
    margin: 24,
    backgroundColor: '#fef3c7',
    padding: 16,
    borderRadius: 8,
  },
  disclaimerText: {
    fontSize: 12,
    color: '#92400e',
    textAlign: 'center',
    lineHeight: 16,
  },
});

export default OpportunitiesScreen;