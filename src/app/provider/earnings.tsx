import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import ProviderBottomNav from "../../components/ProviderBottomNav";

export default function ProviderEarningsScreen() {
  const transactions = [
    {
      id: "TR001",
      service: "Leak Repair",
      customer: "Suresh Kumar",
      date: "16 Apr 2025",
      amount: "Rs. 3,500",
      status: "Paid",
    },
    {
      id: "TR002",
      service: "Pipe Installation",
      customer: "Nadeesha Silva",
      date: "15 Apr 2025",
      amount: "Rs. 4,500",
      status: "Paid",
    },
    {
      id: "TR003",
      service: "Bathroom Fitting",
      customer: "Kasun Fernando",
      date: "14 Apr 2025",
      amount: "Rs. 6,200",
      status: "Paid",
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.title}>Earnings</Text>

        <Text style={styles.subtitle}>
          Track your income and recent service payments.
        </Text>

        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Total Earnings</Text>

          <Text style={styles.balanceValue}>Rs. 84,500</Text>

          <Text style={styles.balanceGrowth}>
            ↗ 12% from last month
          </Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>This Week</Text>
            <Text style={styles.statValue}>Rs. 18,200</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>This Month</Text>
            <Text style={styles.statValue}>Rs. 42,600</Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Earnings Overview</Text>

          <TouchableOpacity>
            <Text style={styles.filter}>This Month ▾</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.chartCard}>
          <View style={styles.chartBars}>
            <View style={styles.barColumn}>
              <View style={[styles.bar, { height: 55 }]} />
              <Text style={styles.dayLabel}>Mon</Text>
            </View>

            <View style={styles.barColumn}>
              <View style={[styles.bar, { height: 85 }]} />
              <Text style={styles.dayLabel}>Tue</Text>
            </View>

            <View style={styles.barColumn}>
              <View style={[styles.bar, { height: 68 }]} />
              <Text style={styles.dayLabel}>Wed</Text>
            </View>

            <View style={styles.barColumn}>
              <View style={[styles.bar, { height: 110 }]} />
              <Text style={styles.dayLabel}>Thu</Text>
            </View>

            <View style={styles.barColumn}>
              <View style={[styles.bar, { height: 90 }]} />
              <Text style={styles.dayLabel}>Fri</Text>
            </View>

            <View style={styles.barColumn}>
              <View style={[styles.bar, { height: 125 }]} />
              <Text style={styles.dayLabel}>Sat</Text>
            </View>

            <View style={styles.barColumn}>
              <View style={[styles.bar, { height: 75 }]} />
              <Text style={styles.dayLabel}>Sun</Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>

          <TouchableOpacity>
            <Text style={styles.filter}>View All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.transactionList}>
          {transactions.map((transaction) => (
            <View key={transaction.id} style={styles.transactionCard}>
              <View style={styles.transactionIcon}>
                <Text style={styles.transactionEmoji}>💰</Text>
              </View>

              <View style={styles.transactionInfo}>
                <Text style={styles.transactionService}>
                  {transaction.service}
                </Text>

                <Text style={styles.transactionCustomer}>
                  {transaction.customer}
                </Text>

                <Text style={styles.transactionDate}>
                  {transaction.date}
                </Text>
              </View>

              <View style={styles.amountArea}>
                <Text style={styles.amount}>
                  {transaction.amount}
                </Text>

                <Text style={styles.paid}>
                  ✓ {transaction.status}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <ProviderBottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7FC",
  },

  scrollContent: {
    padding: 18,
    paddingBottom: 30,
  },

  title: {
    fontSize: 27,
    fontWeight: "800",
    color: "#0F172A",
  },

  subtitle: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 20,
    color: "#64748B",
  },

  balanceCard: {
    marginTop: 20,
    borderRadius: 18,
    padding: 20,
    backgroundColor: "#1D4ED8",
  },

  balanceLabel: {
    fontSize: 12,
    color: "#BFDBFE",
  },

  balanceValue: {
    marginTop: 6,
    fontSize: 30,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  balanceGrowth: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: "600",
    color: "#BBF7D0",
  },

  statsRow: {
    marginTop: 14,
    flexDirection: "row",
    gap: 12,
  },

  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  statLabel: {
    fontSize: 11,
    color: "#64748B",
  },

  statValue: {
    marginTop: 5,
    fontSize: 17,
    fontWeight: "800",
    color: "#0F172A",
  },

  sectionHeader: {
    marginTop: 24,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#0F172A",
  },

  filter: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1D4ED8",
  },

  chartCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 16,
  },

  chartBars: {
    height: 165,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },

  barColumn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
  },

  bar: {
    width: 20,
    borderRadius: 5,
    backgroundColor: "#2563EB",
  },

  dayLabel: {
    marginTop: 7,
    fontSize: 9,
    color: "#64748B",
  },

  transactionList: {
    gap: 10,
  },

  transactionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
  },

  transactionIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#DCFCE7",
    alignItems: "center",
    justifyContent: "center",
  },

  transactionEmoji: {
    fontSize: 20,
  },

  transactionInfo: {
    flex: 1,
    marginLeft: 11,
  },

  transactionService: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0F172A",
  },

  transactionCustomer: {
    marginTop: 2,
    fontSize: 11,
    color: "#475569",
  },

  transactionDate: {
    marginTop: 2,
    fontSize: 10,
    color: "#94A3B8",
  },

  amountArea: {
    alignItems: "flex-end",
  },

  amount: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A",
  },

  paid: {
    marginTop: 3,
    fontSize: 10,
    fontWeight: "700",
    color: "#16A34A",
  },
});