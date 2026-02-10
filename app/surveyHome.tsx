import { View, Text, Button } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { router } from "expo-router";
import { getDB } from "../services/dbService";
import { useEffect, useState } from "react";
import { syncMasterData } from "../services/syncService";
import { autoSyncPendingSurveys } from "../services/autoSyncService";



export default function SurveyHome() {

  const params = useLocalSearchParams();

  const [beats, setBeats] = useState<any[]>([]);
  

  useEffect(() => {
    loadBeats();
  }, []);

  const loadBeats = async () => {

    const db = await getDB();

    const result = await db.getAllAsync(
      "SELECT * FROM beats WHERE surveyor_id=?",
      [params.surveyor_id]
    );

    setBeats(result);

const q = await db.getAllAsync("SELECT DISTINCT section FROM questions");
console.log("SECTIONS:", q);





  };

  const logout = async () => {

    const db = await getDB();
    await db.execAsync("DELETE FROM session");

    router.replace("/login");
  };




const syncData = async () => {
  try {
    await syncMasterData();
    alert("Master Data Synced ✅");
  } catch (err) {
    console.log(err);
    alert("Sync Failed ❌");
  }
};











  return (
    <View style={{ flex:1, padding:20 }}>

      <Text style={{ fontSize:20, marginBottom:20 }}>
        Welcome {params.name}
      </Text>

      <Text style={{ fontSize:16, marginBottom:10 }}>
        Select Beat
      </Text>

      {beats.map((b) => (
  <Button
    key={b.beat_id}
    title={b.beat_name}
    onPress={() =>
      router.push({
        pathname: "/shopSelect",
        params: {
          beat_id: b.beat_id,
          beat_name: b.beat_name,
          surveyor_id: params.surveyor_id,
          name: params.name
        }
      })
    }
  />
))}


     


<View style={{ marginTop:20 }}>
  <Button title="SYNC MASTER DATA" onPress={syncData} />
</View>



<Button
  title="SYNC PENDING SURVEYS"
  onPress={async () => {

    await autoSyncPendingSurveys();

    alert("Sync Completed ✅");

  }}
/>




      <View style={{ marginTop:40 }}>
        <Button title="LOGOUT" onPress={logout} />
      </View>

    </View>
  );
}
