import { View, Text, Button } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { router } from "expo-router";

export default function Dashboard() {

  const params = useLocalSearchParams();

  return (
    <View style={{ flex:1, justifyContent:"center", alignItems:"center" }}>

      <Text style={{ fontSize:20, marginBottom:20 }}>
        Welcome {params.name}
      </Text>

      <Button
        title="START SURVEY"
        onPress={() => alert("Survey Screen Coming Next")}
      />

      <View style={{ marginTop:20 }}>
        <Button title="LOGOUT" onPress={() => router.replace("/login")} />
      </View>

    </View>
  );
}
