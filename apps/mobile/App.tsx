import { StatusBar } from "expo-status-bar";
import { Text, View } from "react-native";
import { aprToApy } from "@shared/core";

export default function App() {
  return (
    <View style={{flex:1,justifyContent:"center",alignItems:"center"}}>
      <Text style={{fontSize: 24, marginBottom: 20}}>Stacks Yield Aggregator</Text>
      <Text>APY of 12% APR: {(aprToApy(0.12)*100).toFixed(2)}%</Text>
      <Text style={{marginTop: 20, fontSize: 12, color: '#666'}}>
        Mobile app coming soon...
      </Text>
      <StatusBar style="auto" />
    </View>
  );
}