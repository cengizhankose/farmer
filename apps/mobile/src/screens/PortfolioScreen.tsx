import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';

const PortfolioScreen = () => {
  const mockPositions = [
    {
      id: '1',
      protocol: 'ALEX',
      pool: 'STX/USDA',
      depositedAmount: 1000,
      currentValue: 1050,
      pnl: 50,
      pnlPercent: 0.05,
    },
    {
      id: '2',
      protocol: 'Arkadiko',
      pool: 'DIKO/STX',
      depositedAmount: 500,
      currentValue: 475,
      pnl: -25,
      pnlPercent: -0.05,
    },
  ];

  const totalValue = mockPositions.reduce((sum, pos) => sum + pos.currentValue, 0);
  const totalPnL = mockPositions.reduce((sum, pos) => sum + pos.pnl, 0);
  const totalPnLPercent = totalValue > 0 ? totalPnL / (totalValue - totalPnL) : 0;

  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatPercent = (value: number) => {
    return `${(value * 100).toFixed(2)}%`;
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Portfolio</Text>
        <Text style={styles.subtitle}>
          Track your DeFi investments and performance
        </Text>
      </View>

      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total Portfolio Value</Text>
          <Text style={styles.summaryValue}>{formatCurrency(totalValue)}</Text>
          <View style={styles.pnlContainer}>
            <Text
              style={[
                styles.pnlValue,
                { color: totalPnL >= 0 ? '#059669' : '#dc2626' },
              ]}
            >
              {totalPnL >= 0 ? '+' : ''}{formatCurrency(totalPnL)}
            </Text>
            <Text
              style={[
                styles.pnlPercent,
                { color: totalPnL >= 0 ? '#059669' : '#dc2626' },
              ]}
            >
              ({totalPnL >= 0 ? '+' : ''}{formatPercent(totalPnLPercent)})
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.positionsContainer}>
        <Text style={styles.sectionTitle}>Active Positions</Text>

        {mockPositions.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>No positions yet</Text>
            <Text style={styles.emptyStateText}>
              Start exploring yield opportunities to build your portfolio
            </Text>
            <TouchableOpacity style={styles.exploreButton}>
              <Text style={styles.exploreButtonText}>Explore Opportunities</Text>
            </TouchableOpacity>
          </View>
        ) : (
          mockPositions.map((position) => (
            <View key={position.id} style={styles.positionCard}>
              <View style={styles.positionHeader}>
                <View>
                  <Text style={styles.protocolName}>{position.protocol}</Text>
                  <Text style={styles.poolName}>{position.pool}</Text>
                </View>
                <View style={styles.positionValue}>
                  <Text style={styles.currentValue}>
                    {formatCurrency(position.currentValue)}
                  </Text>
                  <Text
                    style={[
                      styles.positionPnL,
                      { color: position.pnl >= 0 ? '#059669' : '#dc2626' },
                    ]}
                  >
                    {position.pnl >= 0 ? '+' : ''}{formatCurrency(position.pnl)}
                  </Text>
                </View>
              </View>

              <View style={styles.positionStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Deposited</Text>
                  <Text style={styles.statValue}>
                    {formatCurrency(position.depositedAmount)}
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>P&L %</Text>
                  <Text
                    style={[
                      styles.statValue,
                      { color: position.pnl >= 0 ? '#059669' : '#dc2626' },
                    ]}
                  >
                    {position.pnl >= 0 ? '+' : ''}{formatPercent(position.pnlPercent)}
                  </Text>
                </View>
              </View>

              <TouchableOpacity style={styles.manageButton}>
                <Text style={styles.manageButtonText}>Manage Position</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>

      <View style={styles.disclaimerContainer}>
        <Text style={styles.disclaimerText}>
          Portfolio values are estimates based on current market prices.
          Actual returns may vary.
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
  summaryContainer: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  summaryCard: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  pnlContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pnlValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  pnlPercent: {
    fontSize: 14,
    fontWeight: '500',
  },
  positionsContainer: {
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  emptyState: {
    backgroundColor: 'white',
    padding: 32,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  exploreButton: {
    backgroundColor: '#059669',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  exploreButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  positionCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  positionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  protocolName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  poolName: {
    fontSize: 14,
    color: '#64748b',
  },
  positionValue: {
    alignItems: 'flex-end',
  },
  currentValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  positionPnL: {
    fontSize: 14,
    fontWeight: '600',
  },
  positionStats: {
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
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  manageButton: {
    backgroundColor: '#f1f5f9',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  manageButtonText: {
    color: '#475569',
    fontSize: 14,
    fontWeight: '500',
  },
  disclaimerContainer: {
    margin: 24,
    backgroundColor: '#f1f5f9',
    padding: 16,
    borderRadius: 8,
  },
  disclaimerText: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 16,
  },
});

export default PortfolioScreen;