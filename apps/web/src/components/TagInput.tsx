"use client";

import { useState } from "react";
import { X, Tag } from "lucide-react";

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}

export function TagInput({ tags, onChange, placeholder = "Add tags..." }: TagInputProps) {
  const [inputValue, setInputValue] = useState("");

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };

  const addTag = () => {
    const trimmed = inputValue.trim().replace(/^#/, "");
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
    }
    setInputValue("");
  };

  const removeTag = (index: number) => {
    const newTags = [...tags];
    newTags.splice(index, 1);
    onChange(newTags);
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-xl border border-[var(--faint)] bg-[var(--bg)] focus-within:border-[var(--accent)] transition-colors">
      <Tag className="w-3.5 h-3.5 ml-2 text-[var(--muted)]" />
      {tags.map((tag, index) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 pl-2 pr-1 py-0.5 rounded-md text-xs font-medium bg-[var(--panel)] border border-[var(--faint)] text-[var(--ink)]"
        >
          #{tag}
          <button
            type="button"
            onClick={() => removeTag(index)}
            className="p-0.5 rounded-sm hover:bg-[var(--faint)] text-[var(--muted)] hover:text-[var(--ink)] transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={addTag}
        placeholder={tags.length === 0 ? placeholder : ""}
        className="flex-1 min-w-[80px] bg-transparent text-sm py-1 px-1.5 text-[var(--ink)] focus:outline-none placeholder:text-[var(--muted)]/60"
      />
    </div>
  );
}
