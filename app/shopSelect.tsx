import { View, Text, Button, ScrollView, TouchableOpacity} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { getDB } from "../services/dbService";

export default function ShopSelect() {

  const params = useLocalSearchParams();

  const [shops, setShops] = useState<any[]>([]);
  
  useEffect(() => {
    loadShops();
  }, []);

  const loadShops = async () => {

    const db = await getDB();



    const today = new Date().toISOString().split("T")[0];

const result = await db.getAllAsync(
  `
  SELECT 
    shops.*,
    CASE 
      WHEN survey_header.shop_id IS NOT NULL THEN 1 
      ELSE 0 
    END as is_done
  FROM shops
  LEFT JOIN survey_header
  ON shops.shop_id = survey_header.shop_id
  AND survey_header.survey_date = ?
  WHERE shops.beat_id=?
  `,
  [today, params.beat_id]
);

	
	
	

    setShops(result);
  };

  return (
  <View style={{ flex:1, padding:20 }}>

    <Text style={{ fontSize:18, marginBottom:10 }}>
      Beat: {params.beat_name}
    </Text>

    <Text style={{ fontSize:16, marginBottom:10 }}>
      Select Shop
    </Text>

    <ScrollView>

      {shops.map((s) => (

        <TouchableOpacity
          key={s.shop_id}
          onPress={() =>
            router.push({
              pathname: "/surveyForm",
              params: {
                shop_id: s.shop_id,
                shop_name: s.shop_name,
                beat_id: params.beat_id,
                surveyor_id: params.surveyor_id
              }
            })
          }
          style={{
            backgroundColor: s.is_done === 1 ? "#ff4d4d" : "#2196f3",
            padding: 14,
            marginBottom: 10,
            borderRadius: 6
          }}
        >

          <Text style={{ color: "#fff", textAlign: "center", fontSize: 16 }}>
            {s.shop_name}
          </Text>

        </TouchableOpacity>

      ))}

    </ScrollView>

  </View>
);

}
