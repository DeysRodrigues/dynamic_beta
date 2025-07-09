import { useState } from "react";

export default function TagsBox() {
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  function handleAddTag() {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput("");
    }
  }

  function handleRemoveTag(index: number) {
    const updated = [...tags];
    updated.splice(index, 1);
    setTags(updated);
  }

  return (
    <div className="box-padrao">
      <h2 className="text-lg font-semibold mb-2">
        Quais tags você quer usar nas suas notas?
      </h2>

      <div className="flex items-center gap-2 flex-wrap mb-2">
        <input
          type="text"
          placeholder="Nova tag"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          className="px-2 py-1 rounded bg-white"
        />
        <button
          onClick={handleAddTag}
          className="px-4 py-1 bg-primary text-white rounded"
        >
          Adicionar tag
        </button>
      </div>

      {tags.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <div
              key={index}
              className="flex items-center bg-gray-200 text-sm px-3 py-1 rounded-full"
            >
              <span>{tag}</span>
              <button
                onClick={() => handleRemoveTag(index)}
                className="ml-2 text-red-500 hover:text-red-700"
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500">Nenhuma tag definida ainda.</p>
      )}
    </div>
  );
}
