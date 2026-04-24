import { TodoList } from "./todo-list";

export default function Home() {
  return (
    <div className="flex min-h-full flex-col items-center px-4 py-8 sm:py-12">
      <div className="w-full max-w-md">
        <h1 className="mb-6 text-center text-3xl font-bold text-gray-900">
          prodoto ✅
        </h1>
        <TodoList />
      </div>
    </div>
  );
}
