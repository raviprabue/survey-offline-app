import { View, Text, TextInput, Button, ScrollView, TouchableOpacity } from "react-native";


import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { getDB } from "../services/dbService";
import { router } from "expo-router";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";



export default function SectionForm() {

  const params = useLocalSearchParams();

  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<any>({});
  
  
  const [photos, setPhotos] = useState<any>({});




  
useEffect(() => {
  loadQuestions();
  loadSavedAnswers();
  loadSavedPhotos();
}, [params.section]);



useEffect(() => {

  const checkCompleted = async () => {

    const db = await getDB();

    const today = new Date().toISOString().split("T")[0];

    const exists:any = await db.getFirstAsync(
      `SELECT survey_id FROM survey_header 
       WHERE shop_id=? AND survey_date=?`,
      [params.shop_id, today]
    );

   if (exists && params.section === "BASIC") {

		
      alert("Survey already completed for this shop today ⚠️");
    }

  };

  checkCompleted();

}, []);








  const loadQuestions = async () => {

    const db = await getDB();

    const result = await db.getAllAsync(
      `
      SELECT * FROM questions
      WHERE section=?
      ORDER BY rowid
      `,
      [params.section]
    );

    setQuestions(result);
  };







  const saveSection = async () => {
	  
	  

    
	
	const db = await getDB();

// force save all current answers (safety sync)
for (let qid in answers) {

  const qObj = questions.find(q => q.id === qid);

  if (!qObj) continue;

  const payload = JSON.stringify({
    question: qObj.question,
    value: answers[qid]
  });

  await db.runAsync(
    `INSERT OR REPLACE INTO survey_answers
     (survey_id, question_id, answer)
     VALUES (?,?,?)`,
    [params.survey_id, qid, payload]
  );
}

	
	
	
	
	
	
	
	
	
	
	

    for (let q of questions) {

      const value = answers[q.id];


      if (!shouldShowQuestion(q)) continue;

if (q.mandatory === 1 && !value) {
  alert(`Please answer: ${q.question}`);
  return;
}

if (q.photo_count > 0) {

  const count = photos[q.id]?.length || 0;

  if (count < q.photo_count) {
    alert(`Please capture ${q.photo_count} photos for: ${q.question}`);
    return;
  }
}

    }

    




const sections = await db.getAllAsync(
  "SELECT DISTINCT section FROM questions ORDER BY rowid"
);

const index = sections.findIndex(
  (s:any) => s.section === params.section
);

if (index === sections.length - 1) {

  alert("Survey Completed ✅");

await db.runAsync(
  `UPDATE survey_header 
   SET synced=0 
   WHERE survey_id=?`,
  [params.survey_id]
);




  router.replace({
    pathname: "/shopSelect",
    params: {
      beat_id: params.beat_id,
      beat_name: params.beat_name,
      surveyor_id: params.surveyor_id
    }
  });

} else {

  const nextSection = sections[index + 1].section;

  router.replace({
  pathname: "/sectionForm",
  params: {
    survey_id: params.survey_id,
    section: nextSection,
    beat_id: params.beat_id,
    beat_name: params.beat_name,
    surveyor_id: params.surveyor_id,
    shop_id: params.shop_id
  }
});


}

	
	
	
	
  };


const shouldShowQuestion = (q: any) => {

  if (!q.show_if || q.show_if.trim() === "") {
    return true;
  }

  // Example format: q001=yes
  const parts = q.show_if.split("=");

  if (parts.length !== 2) {
    return true;
  }

  const parentQ = parts[0];
  const expectedValue = parts[1];

  const actualValue = answers[parentQ];

  const visible = actualValue === expectedValue;
	

return visible;

  
  
};









const capturePhoto = async (questionId: string) => {
	
	

  const permission = await ImagePicker.requestCameraPermissionsAsync();

  if (!permission.granted) {
    alert("Camera permission required");
    return;
  }

  const result = await ImagePicker.launchCameraAsync({
    quality: 0.6
  });

  if (!result.canceled) {

  const uri = result.assets[0].uri;

  const db = await getDB();

  await db.runAsync(
    `INSERT INTO survey_photos
     (survey_id, question_id, file_path)
     VALUES (?,?,?)`,
    [params.survey_id, questionId, uri]
  );
  
  console.log("PHOTO SAVED:", uri);


  setPhotos(prev => {

    const existing = prev[questionId] || [];

    return {
      ...prev,
      [questionId]: [...existing, uri]
    };

  });
}


};






  
const autoSaveAnswer = async (qid: string, value: string, questionText: string) => {

  setAnswers(prev => ({
    ...prev,
    [qid]: value
  }));

  const payload = JSON.stringify({
    question: questionText,
    value: value
  });

  const db = await getDB();

  await db.runAsync(
    `INSERT OR REPLACE INTO survey_answers
     (survey_id, question_id, answer)
     VALUES (?,?,?)`,
    [params.survey_id, qid, payload]
  );
};
  




const loadSavedAnswers = async () => {

  const db = await getDB();

  const rows:any = await db.getAllAsync(
    `SELECT question_id, answer 
     FROM survey_answers 
     WHERE survey_id=?`,
    [params.survey_id]
  );

  const map:any = {};

  rows.forEach((r:any) => {
    
	try {
  const parsed = JSON.parse(r.answer);
  map[r.question_id] = parsed.value;
} catch {
  map[r.question_id] = r.answer;
}

	
  });

  setAnswers(map);
};






const loadSavedPhotos = async () => {

  const db = await getDB();

  const rows:any = await db.getAllAsync(
    `SELECT question_id, file_path 
     FROM survey_photos 
     WHERE survey_id=?`,
    [params.survey_id]
  );

  const map:any = {};

  rows.forEach((r:any) => {

    if (!map[r.question_id]) {
      map[r.question_id] = [];
    }

    map[r.question_id].push(r.file_path);

  });

  setPhotos(map);
};
















  return (
    <View style={{ flex:1, padding:20 }}>

      <Text style={{ fontSize:18, marginBottom:15 }}>
        {params.section}
      </Text>

      <ScrollView keyboardShouldPersistTaps="handled">

        {questions.map((q) => {

if (!shouldShowQuestion(q)) {
    return null;
  }
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
 return (
          <View key={q.id} style={{ marginBottom:20 }}>

            <Text style={{ marginBottom:5 }}>
              {q.question}
              {q.mandatory === 1 ? " *" : ""}
            </Text>

           
           
          {/* TEXT / NUMBER */}
{(q.type === "text" || q.type === "number") && (
  <TextInput
  value={answers[q.id] || ""}

  
    placeholder="Enter answer"
    keyboardType={q.type === "number" ? "numeric" : "default"}
    style={{
      borderWidth: 1,
      padding: 10,
      borderRadius: 5
    }}
   

   onChangeText={(val) =>
  setAnswers(prev => ({ ...prev, [q.id]: val }))
}

onBlur={() =>
  autoSaveAnswer(q.id, answers[q.id], q.question)
}


  />
)}

{/* PHOTO CAPTURE */}

{q.photo_count > 0 && (

  <View style={{ marginTop:10 }}>


    <Button
      title={`Capture Photo (${(photos[q.id]?.length || 0)}/${q.photo_count})`}
      onPress={() => capturePhoto(q.id)}
    />
	
	<Text style={{ marginTop:5, color:"green" }}>
  Saved: {(photos[q.id]?.length || 0)} photos
</Text>


  </View>
)}









{/* RADIO */}


{q.type === "radio" && (

  <View style={{ flexDirection: "row", flexWrap: "wrap" }}>

    {q.options.split(",").map((opt: string) => (

      <TouchableOpacity
        key={opt}
        onPress={() => autoSaveAnswer(q.id, opt, q.question)}

        style={{
          padding: 12,
          borderWidth: 1,
          borderColor: answers[q.id] === opt ? "#007bff" : "#ccc",
          backgroundColor: answers[q.id] === opt ? "#007bff" : "#fff",
          marginRight: 10,
          borderRadius: 6
        }}
      >

        <Text style={{ color: answers[q.id] === opt ? "#fff" : "#000" }}>
          {opt.toUpperCase()}
        </Text>

      </TouchableOpacity>

    ))}

  </View>

)}


{/* DROPDOWN */}




{q.type === "dropdown" && (

  <View style={{ borderWidth: 1, borderRadius: 5 }}>

    <Picker
      selectedValue={answers[q.id]}
      onValueChange={(val) => autoSaveAnswer(q.id, val, q.question)}

    >

      <Picker.Item label="Select option" value="" />

      {q.options.split(",").map((opt: string) => (

        <Picker.Item
          key={opt}
          label={opt}
          value={opt}
        />

      ))}

    </Picker>

  </View>

)}



	  
		  </View>
        );	
        })}

      </ScrollView>

      <Button title="SAVE SECTION" onPress={saveSection} />

    </View>
  );
}
