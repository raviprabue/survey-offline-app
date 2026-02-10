import { View, Text, Button } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { getDB } from "../services/dbService";
import * as Location from "expo-location";
import { router } from "expo-router";

export default function SurveyForm() {

  const params = useLocalSearchParams();

  const [gps, setGps] = useState<any>(null);
  const [accuracyOk, setAccuracyOk] = useState(false);

  useEffect(() => {
  captureGPS();
}, []);

useEffect(() => {
  if (accuracyOk) {
    startSurveySession();
  }
}, [accuracyOk]);


  const captureGPS = async () => {

    let { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") {
      alert("GPS Permission Required");
      return;
    }

    const loc = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Highest,
    });

    setGps(loc);

    if (loc.coords.accuracy <= 10) {
      setAccuracyOk(true);
    } else {
      setAccuracyOk(false);
    }
  };

  const startSurveySession = async () => {


    if (!gps) {
  alert("Waiting for GPS fix...");
  return;
}

    const db = await getDB();

    const today = new Date().toISOString().split("T")[0];
    const surveyId = `${params.shop_id}_${today}`;

    try {

      await db.runAsync(
        `INSERT INTO survey_header
        (survey_id, surveyor_id, beat_id, shop_id, latitude, longitude, accuracy, survey_date)
        VALUES (?,?,?,?,?,?,?,?)`,
        [
          surveyId,
          params.surveyor_id,
          params.beat_id,
          params.shop_id,
          gps.coords.latitude,
          gps.coords.longitude,
          gps.coords.accuracy,
          today
        ]
      );

      

router.replace({
  pathname: "/surveySections",
  params: {
    survey_id: surveyId,
    shop_id: params.shop_id,
    beat_id: params.beat_id,
    beat_name: params.beat_name,
    surveyor_id: params.surveyor_id
  }
});
    } 
    
    catch (e:any) {

  if (String(e).includes("UNIQUE")) {
    alert("Survey already done today for this shop ❌");
  } else {
    alert("Failed to start survey");
    console.log(e);
  }

}






  };

  return (
    <View style={{ flex:1, padding:20 }}>

      <Text style={{ fontSize:18, marginBottom:10 }}>
        Shop: {params.shop_name}
      </Text>

      <Text style={{ color: accuracyOk ? "green" : "black" }}>
  GPS Accuracy: {gps ? `${gps.coords.accuracy} meters` : "Loading..."}
</Text>

      {!accuracyOk && (
        <Text style={{ color:"red", marginVertical:10 }}>
          Move device for better GPS accuracy (Need ≤ 10m)
        </Text>
      )}

      <Button title="REFRESH GPS" onPress={captureGPS} />

		  

    </View>
  );
}
