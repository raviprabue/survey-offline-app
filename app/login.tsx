import { View, Text, TextInput, Button } from "react-native";
import { useState, useEffect } from "react";
import { getDB } from "../services/dbService";
import { router } from "expo-router";
import { syncMasterData } from "../services/syncService";

export default function Login() {

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [syncing, setSyncing] = useState(true);

  // AUTO SYNC ON SCREEN LOAD
  useEffect(() => {

    const autoSyncSurveyors = async () => {

      try {

        console.log("Auto syncing surveyors...");

        await syncMasterData();

        setSyncing(false);

        console.log("Surveyors synced");

      } catch (err) {

        console.log("Auto sync failed", err);
        setSyncing(false);

      }

    };

    autoSyncSurveyors();

  }, []);

  const handleLogin = async () => {

    if (syncing) {
      alert("Please wait syncing data...");
      return;
    }

    const db = await getDB();

    const allUsers = await db.getAllAsync("SELECT * FROM surveyors");
    console.log("LOCAL SURVEYORS:", allUsers);

    const result = await db.getFirstAsync(
      "SELECT * FROM surveyors WHERE username=? AND password=?",
      [username.trim(), password.trim()]
    );

    if (result) {

      await db.execAsync("DELETE FROM session");

      await db.runAsync(
        "INSERT INTO session (surveyor_id, username, login_time) VALUES (?,?,datetime('now'))",
        [result.surveyor_id, result.username]
      );

      router.replace({
        pathname: "/surveyHome",
        params: {
          surveyor_id: result.surveyor_id,
          name: result.name
        }
      });

    } else {

      alert("Invalid Login ❌");

    }
  };

  return (
    <View style={{ flex:1, justifyContent:"center", padding:20 }}>

      <Text style={{ fontSize:22, marginBottom:20, textAlign:"center" }}>
        Survey Login
      </Text>

      <TextInput
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        style={{ borderWidth:1, padding:10, marginBottom:15 }}
      />

      <TextInput
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={{ borderWidth:1, padding:10, marginBottom:20 }}
      />

      <Button
        title={syncing ? "SYNCING..." : "LOGIN"}
        onPress={handleLogin}
        disabled={syncing}
      />

    </View>
  );
}
