import { firestore, storage } from "./firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getDB } from "./dbService";





async function uriToBlob(uri: string) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = () => resolve(xhr.response);
    xhr.onerror = () => reject(new Error("Blob conversion failed"));
    xhr.responseType = "blob";
    xhr.open("GET", uri, true);
    xhr.send(null);
  });
}








export async function uploadSurveyToFirebase(survey_id: string) {

  const db = await getDB();

  // HEADER
  const header:any = await db.getFirstAsync(
    "SELECT * FROM survey_header WHERE survey_id=?",
    [survey_id]
  );

  // ANSWERS
  const answersArr:any[] = await db.getAllAsync(
    "SELECT question_id, answer FROM survey_answers WHERE survey_id=?",
    [survey_id]
  );

  const answers:any = {};
  answersArr.forEach(a => {
  try {
    answers[a.question_id] = JSON.parse(a.answer);
  } catch {
    answers[a.question_id] = {
      question: "",
      value: a.answer
    };
  }
});


  // PHOTOS
  const photoRows:any[] = await db.getAllAsync(
    "SELECT question_id, file_path FROM survey_photos WHERE survey_id=?",
    [survey_id]
  );

console.log("PHOTO ROWS:", photoRows);


  let uploadedUrls:string[] = [];
  
  
  
  
  for (let p of photoRows) {

  try {

    const photoUri = p.file_path;

    const blob:any = await uriToBlob(photoUri);

    const storagePath =
      `surveys/${header.surveyor_id}/${survey_id}/${Date.now()}.jpg`;

    const storageRef = ref(storage, storagePath);

    await uploadBytes(storageRef, blob, {
      contentType: "image/jpeg"
    });

    const downloadUrl = await getDownloadURL(storageRef);

    uploadedUrls.push(downloadUrl);

  } catch (err) {

    console.log("Photo upload failed:", p.file_path, err);

  }

}






  // FIRESTORE SAVE (ONE DOC)
  await setDoc(doc(firestore, "survey_data", survey_id), {

    shop_id: header.shop_id,
    beat_id: header.beat_id,
    surveyor_id: header.surveyor_id,

    gps: {
      lat: header.latitude,
      lng: header.longitude,
      accuracy: header.accuracy
    },

    answers: answers,

    photos: uploadedUrls,

    date: header.survey_date,

    created_at: serverTimestamp()

  });

  // MARK LOCAL SYNCED
  await db.runAsync(
    "UPDATE survey_header SET synced=1 WHERE survey_id=?",
    [survey_id]
  );

  return true;
}
  
