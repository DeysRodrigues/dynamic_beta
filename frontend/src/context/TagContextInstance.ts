import { createContext } from "react";

type TagContextType = {
  tags: string[];
  addTag: (tag: string) => void;
  removeTag: (index: number) => void;
};

export const TagContext = createContext<TagContextType | undefined>(undefined);
