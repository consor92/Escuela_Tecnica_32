import React, { useState } from "react";

type TagInputProps = {
  tags: string[];
  setTags: React.Dispatch<React.SetStateAction<string[]>>;
};

export default function TagInput({ tags, setTags }: TagInputProps) {
  const [tagInput, setTagInput] = useState<string>("");

  const handleTagAdd = () => {
    const tag = tagInput.trim();
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  return (
    <div>
      <label className="mb-2 block text-black dark:text-white">Etiquetas (tags)</label>
      <div className="flex gap-2">
        <input
          type="text"
          className="w-full rounded border border-stroke bg-transparent py-2 px-4 text-black dark:text-white dark:border-form-strokedark dark:bg-form-input"
          placeholder="Ingresá una etiqueta"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleTagAdd()}
        />
        <button
          onClick={handleTagAdd}
          type="button"
          className="bg-primary px-4 py-2 text-white rounded"
        >
          Agregar
        </button>
      </div>

      <div className="mt-2 flex flex-wrap gap-2">
        {tags.map((tag, idx) => (
          <span
            key={idx}
            className="bg-gray-200 text-sm px-3 py-1 rounded-full flex items-center gap-1"
          >
            {tag}
            <button onClick={() => removeTag(tag)} className="text-red-600">
              ✕
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}
