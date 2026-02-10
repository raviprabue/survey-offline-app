import { View, Text, TouchableOpacity, ScrollView, Button } from "react-native";
import { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { getDB } from "../services/dbService";
import { router } from "expo-router";
import { uploadSurveyToFirebase } from "../services/uploadService";

export default function SurveySections() {

  const params = useLocalSearchParams();

  const [sections, setSections] = useState<any[]>([]);
  const [statusMap, setStatusMap] = useState<any>({});

  useEffect(() => {
    loadSections();
  }, [params.survey_id]);


  const loadSections = async () => {

    const db = await getDB();

    // Load sections in Excel order
    
	const secResult = await db.getAllAsync(`
  SELECT section
  FROM questions
  GROUP BY section
  ORDER BY MIN(rowid)
`);

console.log("SECTIONS RESULT:", secResult);

	
	

    // Check completion status
    let statusObj: any = {};

    for (let sec of secResult) {

      const mandatoryTotal = await db.getFirstAsync(
        `
        SELECT COUNT(*) as total
        FROM questions
        WHERE section=? AND mandatory=1
        `,
        [sec.section]
      );

      const mandatoryAnswered = await db.getFirstAsync(
        `
        SELECT COUNT(DISTINCT q.id) as answered
        FROM survey_answers a
        JOIN questions q ON a.question_id = q.id
        WHERE q.section=? AND q.mandatory=1
        AND a.survey_id=?
        `,
        [sec.section, params.survey_id]
      );

      statusObj[sec.section] =
        mandatoryAnswered.answered >= mandatoryTotal.total;
    }

    setSections(secResult);
    setStatusMap(statusObj);
  };

  const openSection = (sectionName: string) => {

  router.push({
    pathname: "/sectionForm",
    params: {
      section: sectionName,
      survey_id: params.survey_id,
      shop_id: params.shop_id,
      beat_id: params.beat_id,
      beat_name: params.beat_name,
      surveyor_id: params.surveyor_id
    }
  });
};



const finalSubmit = async () => {

  const incomplete = Object.values(statusMap).includes(false);

  if (incomplete) {
    alert("Complete all mandatory sections ❌");
    return;
  }

  try {

    await uploadSurveyToFirebase(params.survey_id);

    alert("Survey Uploaded Successfully ✅");

    router.replace("/shopSelect");

  } catch (err) {

    console.log(err);

    alert("Upload Failed — Will retry later ⚠️");

  }
};

  return (
    <View style={{ flex:1, padding:20 }}>

      <Text style={{ fontSize:18, marginBottom:15 }}>
        Survey Sections
      </Text>

      <ScrollView>

        {sections.map((s, index) => {

          const completed = statusMap[s.section];

          return (
            <TouchableOpacity
              key={index}
              onPress={() => openSection(s.section)}
              style={{
                padding:15,
                marginBottom:10,
                borderRadius:8,
                backgroundColor: completed ? "#c8f7c5" : "#f7c5c5"
              }}
            >
              <Text style={{ fontSize:16 }}>
                {s.section}
                {completed ? " ✔" : " ⚠"}
              </Text>
            </TouchableOpacity>
          );
        })}

      </ScrollView>

      <View style={{ marginTop:20 }}>
        <Button title="FINAL SUBMIT" onPress={finalSubmit} />
      </View>

    </View>
  );
}
