import {
  ref,
  set,
  onDisconnect,
  onValue
} from "firebase/database";
import { rtdb, auth } from "./firebase";

export const setupPresence = () => {
  console.log("PRESENCE RUNNING");

  const user = auth.currentUser;
  if (!user) return;

  const userStatusRef = ref(rtdb, "status/" + user.uid);
  const connectedRef = ref(rtdb, ".info/connected");

  onValue(connectedRef, (snap) => {
    if (snap.val() === true) {
      // 🟢 ONLINE
      set(userStatusRef, {
        state: "online",
        lastChanged: Date.now(),
      });

      // ⚫ OFFLINE when disconnected
      onDisconnect(userStatusRef).set({
        state: "offline",
        lastChanged: Date.now(),
      });
    }
  });
};