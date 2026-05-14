import { type Auth, GoogleAuthProvider, getAuth } from "firebase/auth";
import { app } from "./firebase";

export const auth = Object.keys(app).length > 0 ? getAuth(app) : ({} as Auth);
export const googleProvider = new GoogleAuthProvider();
