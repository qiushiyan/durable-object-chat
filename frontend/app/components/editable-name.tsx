"use client";

import { useState, useRef, useEffect } from "react";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";

import { cn } from "~/lib/utils";
import { useAtom } from "jotai";
import { nameAtom } from "~/lib/store";
import { toast } from "sonner";

interface Props {
  className?: string;
  onSave?: (name: string) => void;
}

export default function EditableName({ className, onSave }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useAtom(nameAtom);
  const [text, setText] = useState(name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleLabelClick = () => {
    setIsEditing(true);
  };

  const saveName = () => {
    setName(text);
    setIsEditing(false);
    onSave?.(text);
  };

  const handleInputBlur = () => {
    if (text.length < 3) {
      toast.warning("Name must be at least 3 characters");
      return;
    }
    saveName();
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === "Escape") {
      if (text.length < 3) {
        toast.warning("Name must be at least 3 characters");
        return;
      }
      saveName();
    }
  };

  return (
    <div className={cn(className)}>
      {isEditing ? (
        <Input
          ref={inputRef}
          className="w-full"
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={handleInputBlur}
          onKeyDown={handleInputKeyDown}
        />
      ) : (
        <Label
          onClick={handleLabelClick}
          className="cursor-pointer hover:bg-accent p-2 rounded transition-colors text-center w-full block"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleLabelClick();
            }
          }}
          role="button"
          aria-label={`Edit ${text}`}
        >
          {text}
        </Label>
      )}
    </div>
  );
}
