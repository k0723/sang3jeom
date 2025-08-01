// useAuth.js (훅 전용)
import { useContext } from "react";
import { AuthContext } from "../components/AuthContext";

export const useAuth = () => useContext(AuthContext);