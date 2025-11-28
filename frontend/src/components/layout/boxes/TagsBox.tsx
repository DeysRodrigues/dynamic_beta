import { useState } from "react";
import { useTagStore } from "@/store/useTagStore";
import { Plus, X } from "lucide-react";

export default function TagsBox() {
  const [tagInput, setTagInput] = useState("");
  const { tags, addTag, removeTag } = useTagStore();

  const handleAddTag = () => {
    if (tagInput.trim()) {
      addTag(tagInput.trim());
      setTagInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleAddTag();
  };

  return (
    <div className="box-padrao">
      <h2 className="text-lg font-semibold mb-2 text-gray-800">
        Quais tags você quer usar?
      </h2>

      <div className="flex items-center gap-2 mb-4">
        <input
          type="text"
          placeholder="Nova tag..."
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 px-3 py-1.5 rounded-lg bg-white border border-gray-200 outline-none focus:ring-2 focus:ring-purple-200 transition-all text-sm"
        />
        <button
          onClick={handleAddTag}
          className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          title="Adicionar Tag"
        >
          <Plus size={18} />
        </button>
      </div>

      <div className="flex flex-wrap gap-2 overflow-y-auto max-h-[200px]">
        {tags.length > 0 ? (
          tags.map((tag, index) => (
            <div
              key={index}
              className="flex items-center bg-white border border-gray-200 text-gray-700 text-sm px-3 py-1 rounded-full shadow-sm"
            >
              <span className="mr-2 font-medium">{tag}</span>
              <button
                onClick={() => removeTag(index)}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500 italic">Nenhuma tag definida.</p>
        )}
      </div>
    </div>
  );
}