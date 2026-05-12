import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  type Firestore,
} from "firebase/firestore";
import { app } from "./firebase";

// Initialize Firestore with modern persistent cache settings
// Guarded for build time / pre-rendering
export const db = (Object.keys(app).length > 0 
  ? initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
      }),
    })
  : {} as Firestore);
