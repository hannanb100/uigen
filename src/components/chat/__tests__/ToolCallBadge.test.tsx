import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { getToolLabel, ToolCallBadge } from "../ToolCallBadge";
import type { ToolInvocation } from "ai";

afterEach(() => {
  cleanup();
});

// --- getToolLabel unit tests ---

test("getToolLabel: str_replace_editor create", () => {
  expect(getToolLabel("str_replace_editor", { command: "create", path: "src/App.jsx" })).toBe("Creating App.jsx");
});

test("getToolLabel: str_replace_editor str_replace", () => {
  expect(getToolLabel("str_replace_editor", { command: "str_replace", path: "src/components/Card.tsx" })).toBe("Editing Card.tsx");
});

test("getToolLabel: str_replace_editor insert", () => {
  expect(getToolLabel("str_replace_editor", { command: "insert", path: "src/index.tsx" })).toBe("Editing index.tsx");
});

test("getToolLabel: str_replace_editor view", () => {
  expect(getToolLabel("str_replace_editor", { command: "view", path: "src/lib/utils.ts" })).toBe("Viewing utils.ts");
});

test("getToolLabel: file_manager rename", () => {
  expect(getToolLabel("file_manager", { command: "rename", path: "src/old.jsx", new_path: "src/new.jsx" })).toBe("Renaming old.jsx → new.jsx");
});

test("getToolLabel: file_manager delete", () => {
  expect(getToolLabel("file_manager", { command: "delete", path: "src/App.jsx" })).toBe("Deleting App.jsx");
});

test("getToolLabel: unknown tool falls back to tool name", () => {
  expect(getToolLabel("some_other_tool", { command: "do_thing" })).toBe("some_other_tool");
});

test("getToolLabel: unknown command falls back to tool name", () => {
  expect(getToolLabel("str_replace_editor", { command: "undo_edit" })).toBe("str_replace_editor");
});

// --- ToolCallBadge render tests ---

test("ToolCallBadge shows label in pending state", () => {
  const toolInvocation = {
    toolCallId: "1",
    toolName: "str_replace_editor",
    args: { command: "create", path: "src/App.jsx" },
    state: "call",
  } as unknown as ToolInvocation;

  render(<ToolCallBadge toolInvocation={toolInvocation} />);
  expect(screen.getByText("Creating App.jsx")).toBeDefined();
});

test("ToolCallBadge shows label in completed state", () => {
  const toolInvocation = {
    toolCallId: "2",
    toolName: "str_replace_editor",
    args: { command: "str_replace", path: "src/Card.tsx" },
    state: "result",
    result: "OK",
  } as unknown as ToolInvocation;

  render(<ToolCallBadge toolInvocation={toolInvocation} />);
  expect(screen.getByText("Editing Card.tsx")).toBeDefined();
});

test("ToolCallBadge shows green dot when done", () => {
  const toolInvocation = {
    toolCallId: "3",
    toolName: "file_manager",
    args: { command: "delete", path: "src/Old.jsx" },
    state: "result",
    result: { success: true },
  } as unknown as ToolInvocation;

  const { container } = render(<ToolCallBadge toolInvocation={toolInvocation} />);
  expect(container.querySelector(".bg-emerald-500")).toBeDefined();
});

test("ToolCallBadge shows spinner when pending", () => {
  const toolInvocation = {
    toolCallId: "4",
    toolName: "file_manager",
    args: { command: "rename", path: "src/A.jsx", new_path: "src/B.jsx" },
    state: "call",
  } as unknown as ToolInvocation;

  const { container } = render(<ToolCallBadge toolInvocation={toolInvocation} />);
  expect(container.querySelector(".animate-spin")).toBeDefined();
});
