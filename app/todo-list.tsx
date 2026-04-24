"use client";

import { useEffect, useState, useCallback } from "react";
import { IconArrowUp } from "@tabler/icons-react";
import { SwipeableTodo } from "./swipeable-todo";

type Todo = { id: number; text: string; completed: boolean };

export function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchTodos = useCallback(async () => {
    const res = await fetch("/api/todos");
    const data = await res.json();
    setTodos(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;

    const text = input.trim();
    setInput("");

    const tempId = Date.now();
    setTodos((prev) => [{ id: tempId, text, completed: false }, ...prev]);

    const res = await fetch("/api/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    const created = await res.json();
    setTodos((prev) => prev.map((t) => (t.id === tempId ? created : t)));
  }

  async function handleToggle(id: number) {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
    await fetch(`/api/todos/${id}`, { method: "PATCH" });
  }

  async function handleDelete(id: number) {
    setTodos((prev) => prev.filter((t) => t.id !== id));
    await fetch(`/api/todos/${id}`, { method: "DELETE" });
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-gray-600" />
      </div>
    );
  }

  return (
    <>
      <form onSubmit={handleAdd} className="relative">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="What needs to be done?"
          autoComplete="off"
          className="w-full bg-gray-100 px-4 py-2.5 pr-12 text-sm text-gray-800 placeholder-gray-400 outline-none focus:bg-gray-200"
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-600 transition-colors hover:text-blue-600"
        >
          <IconArrowUp size={18} />
        </button>
      </form>

      <div className="mt-6 flex flex-col gap-2">
        {todos.length === 0 ? (
          <p className="py-8 text-center text-gray-400">No todos yet. Add one above!</p>
        ) : (
          todos.map((todo) => (
            <SwipeableTodo
              key={todo.id}
              id={todo.id}
              text={todo.text}
              completed={todo.completed}
              onToggle={handleToggle}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>

    </>
  );
}
