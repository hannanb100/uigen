"use client";

import { ToolInvocation } from "ai";
import { Loader2 } from "lucide-react";

export function getToolLabel(toolName: string, args: Record<string, unknown>): string {
  const filename = (path: unknown) =>
    typeof path === "string" ? path.split("/").pop() ?? path : "";

  if (toolName === "str_replace_editor") {
    switch (args.command) {
      case "create":
        return `Creating ${filename(args.path)}`;
      case "str_replace":
      case "insert":
        return `Editing ${filename(args.path)}`;
      case "view":
        return `Viewing ${filename(args.path)}`;
    }
  }

  if (toolName === "file_manager") {
    switch (args.command) {
      case "rename":
        return `Renaming ${filename(args.path)} → ${filename(args.new_path)}`;
      case "delete":
        return `Deleting ${filename(args.path)}`;
    }
  }

  return toolName;
}

interface ToolCallBadgeProps {
  toolInvocation: ToolInvocation;
}

export function ToolCallBadge({ toolInvocation }: ToolCallBadgeProps) {
  const label = getToolLabel(
    toolInvocation.toolName,
    toolInvocation.args as Record<string, unknown>
  );
  const isDone = toolInvocation.state === "result" && (toolInvocation as { result?: unknown }).result;

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs font-mono border border-neutral-200">
      {isDone ? (
        <>
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-neutral-700">{label}</span>
        </>
      ) : (
        <>
          <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
          <span className="text-neutral-700">{label}</span>
        </>
      )}
    </div>
  );
}
