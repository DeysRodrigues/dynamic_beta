import { useContext } from "react";
import { TagContext } from "./TagContextInstance";

export function useTagContext() {
  const context = useContext(TagContext);
  if (!context) {
    throw new Error("useTagContext deve ser usado dentro de TagProvider");
  }
  return context;
}
