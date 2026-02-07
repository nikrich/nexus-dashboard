"use client";

import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";

interface EditableTitleProps {
  value: string;
  onSave: (value: string) => void;
  disabled?: boolean;
}

export function EditableTitle({ value, onSave, disabled }: EditableTitleProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  function handleSave() {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== value) {
      onSave(trimmed);
    } else {
      setEditValue(value);
    }
    setIsEditing(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      setEditValue(value);
      setIsEditing(false);
    }
  }

  if (isEditing) {
    return (
      <Input
        ref={inputRef}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className="text-2xl font-bold h-auto py-1"
      />
    );
  }

  return (
    <h1
      className="text-2xl font-bold cursor-pointer rounded px-1 py-1 hover:bg-accent/50 transition-colors"
      onClick={() => !disabled && setIsEditing(true)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" && !disabled) setIsEditing(true);
      }}
    >
      {value}
    </h1>
  );
}
