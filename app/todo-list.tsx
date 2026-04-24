"use client";

import { useEffect, useState, useCallback } from "react";

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
    return <p className="py-8 text-center text-gray-400">Loading...</p>;
  }

  return (
    <>
      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="What needs to be done?"
          autoComplete="off"
          className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-base text-gray-800 placeholder-gray-400 shadow-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
        />
        <button
          type="submit"
          className="rounded-xl bg-emerald-500 px-5 py-3 text-base font-medium text-white shadow-sm transition-colors hover:bg-emerald-600 active:bg-emerald-700"
        >
          Add
        </button>
      </form>

      <div className="mt-6 flex flex-col gap-2">
        {todos.length === 0 ? (
          <p className="py-8 text-center text-gray-400">No todos yet. Add one above!</p>
        ) : (
          todos.map((todo) => (
            <div
              key={todo.id}
              className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-sm border border-gray-100"
            >
              <button
                onClick={() => handleToggle(todo.id)}
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                  todo.completed
                    ? "border-emerald-500 bg-emerald-500 text-white"
                    : "border-gray-300 hover:border-emerald-400"
                }`}
              >
                {todo.completed && (
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>

              <span className={`flex-1 text-base ${todo.completed ? "text-gray-400 line-through" : "text-gray-800"}`}>
                {todo.text}
              </span>

              <button
                onClick={() => handleDelete(todo.id)}
                className="shrink-0 rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))
        )}
      </div>

      <p className="mt-8 text-center text-xs text-gray-400">
        {todos.length} todo{todos.length !== 1 && "s"}
      </p>
    </>
  );
}
