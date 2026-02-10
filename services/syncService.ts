import { getDB } from "./dbService";

const SHEET_ID = "10TZBMj6OIVnb1brSUUIx7wmASAfgBpnItBLWoemKHck";

const SURVEYOR_URL = `https://opensheet.elk.sh/${SHEET_ID}/Surveyors`;
const BEATS_URL = `https://opensheet.elk.sh/${SHEET_ID}/Beats`;
const SHOPS_URL = `https://opensheet.elk.sh/${SHEET_ID}/Shops`;
const QUESTIONS_URL = `https://opensheet.elk.sh/${SHEET_ID}/Questions`;


export async function syncMasterData() {

  const db = await getDB();


  const surveyors = await fetch(SURVEYOR_URL).then(res => res.json());
  const beats = await fetch(BEATS_URL).then(res => res.json());
  const shops = await fetch(SHOPS_URL).then(res => res.json());
  const questions = await fetch(QUESTIONS_URL).then(res => res.json());


  await db.execAsync("DELETE FROM questions;");
await db.execAsync("DELETE FROM shops;");
await db.execAsync("DELETE FROM beats;");
await db.execAsync("DELETE FROM surveyors;");


  for (let s of surveyors) {
    await db.runAsync(
      "REPLACE INTO surveyors VALUES (?,?,?,?)",
      [s.surveyor_id, s.name, s.username, s.password]
    );
  }

  for (let b of beats) {
    await db.runAsync(
      "REPLACE INTO beats VALUES (?,?,?)",
      [b.beat_id, b.beat_name, b.surveyor_id]
    );
  }



  for (let sh of shops) {
    await db.runAsync(
      "REPLACE INTO shops VALUES (?,?,?)",
      [sh.shop_id, sh.shop_name, sh.beat_id]
    );
  }



for (let q of questions) {
  await db.runAsync(
    `REPLACE INTO questions 
    (id, section, question, type, options, show_if, mandatory, photo_count)
    VALUES (?,?,?,?,?,?,?,?)`,
    [
      q.id,
      q.section,
      q.question,
      q.type,
      q.options || "",
      q.show_if || "",
      q.mandatory === "true" ? 1 : 0,
      q.photo_count ? Number(q.photo_count) : 0
    ]
  );
}





  return true;
}
