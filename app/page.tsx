import { TodoList } from "./todo-list";

export default function Home() {
  return (
    <div className="flex min-h-full flex-col items-center px-4 py-6">
      <div className="w-full max-w-sm">
        <TodoList />
      </div>
    </div>
  );
}
