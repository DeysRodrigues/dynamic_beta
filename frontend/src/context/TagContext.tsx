import { useState } from "react";
import { TagContext } from "./TagContextInstance"; // <- novo arquivo
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export function TagProvider({ children }: Props) {
  const [tags, setTags] = useState<string[]>([]);

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
