import { useEffect, useState } from "react";
import { TagContext } from "./TagContextInstance"; 
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
};


export function TagProvider({ children }: Props) {
  const [tags, setTags] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("user-tags");
        const parsed = stored ? JSON.parse(stored) : [];
        console.log("Tags carregadas do localStorage:", parsed);
        return Array.isArray(parsed) ? parsed : [];
      } catch (error) {
        console.error("Erro ao carregar tags do localStorage:", error);
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem("user-tags", JSON.stringify(tags));
    } catch (error) {
      console.error("Erro ao salvar tags no localStorage:", error);
    }
  }, [tags]);

  const addTag = (tag: string) => {
    if (tag.trim() && !tags.includes(tag)) {
      setTags((prev) => [...prev, tag.trim()]);
    }
  };

  const removeTag = (index: number) => {
    setTags((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <TagContext.Provider value={{ tags, addTag, removeTag }}>
      {children}
    </TagContext.Provider>
  );
}