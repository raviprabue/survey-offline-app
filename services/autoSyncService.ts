import { getDB } from "./dbService";
import { uploadSurveyToFirebase } from "./uploadService";

export async function autoSyncPendingSurveys() {

  const db = await getDB();

  const pending:any[] = await db.getAllAsync(
    "SELECT survey_id FROM survey_header WHERE synced=0"
  );

  if (pending.length === 0) {
    console.log("No pending surveys to sync");
    return;
  }

  console.log("Pending uploads:", pending.length);

  for (let row of pending) {

    try {

      await uploadSurveyToFirebase(row.survey_id);

      console.log("Uploaded:", row.survey_id);

    } catch (err) {

      console.log("Failed upload:", row.survey_id);

    }
  }
}
