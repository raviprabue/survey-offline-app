import { useEffect, useState } from "react";
import { Redirect } from "expo-router";
import { initDB, getDB } from "../services/dbService";
import { autoSyncPendingSurveys } from "../services/autoSyncService";

export default function Index() {

  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const [userId, setUserId] = useState("");
  const [name, setName] = useState("");

  useEffect(() => {

    const init = async () => {

      await initDB();
	  
	await autoSyncPendingSurveys();

      const db = await getDB();

      const session = await db.getFirstAsync(
        "SELECT * FROM session LIMIT 1"
      );

      if (session) {
        setLoggedIn(true);
        setUserId(session.surveyor_id);
        setName(session.username);
      }

      setLoading(false);
    };

    init();

  }, []);

  if (loading) return null;

  if (loggedIn) {
    return (
      <Redirect
        href={{
          pathname: "/surveyHome",
          params: {
            surveyor_id: userId,
            name: name
          }
        }}
      />
    );
  }

  return <Redirect href="/login" />;
}
