import { ref, set, onDisconnect, onValue, off } from "firebase/database";
import { rtdb, auth } from "./firebase";

let presenceInitialized = false;

export const setupPresence = () => {
  if (presenceInitialized) {
    console.log("PRESENCE ALREADY RUNNING — skipping");
    return;
  }

  console.log("PRESENCE RUNNING");

  const user = auth.currentUser;
  if (!user) return;

  presenceInitialized = true;

  const userStatusRef = ref(rtdb, "status/" + user.uid);
  const connectedRef = ref(rtdb, ".info/connected");

  off(connectedRef);

  const handleConnection = (snap: any) => {
    if (snap.val() === true) {
      onDisconnect(userStatusRef)
        .set({ state: "offline", lastChanged: Date.now() })
        .then(() => {
          set(userStatusRef, { state: "online", lastChanged: Date.now() });
        });
    }
  };

  onValue(connectedRef, handleConnection);

  return () => {
    off(connectedRef, "value", handleConnection);
    set(userStatusRef, { state: "offline", lastChanged: Date.now() });
    presenceInitialized = false;
  };
};