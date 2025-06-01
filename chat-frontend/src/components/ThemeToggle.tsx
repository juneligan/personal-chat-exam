// components/ThemeToggle.tsx
export default function ThemeToggle() {
  return (
      <button
          onClick={() => document.body.classList.toggle('light')}
          className="absolute top-4 right-4 px-3 py-1 rounded bg-gray-700 text-white dark:bg-white dark:text-black z-50"
      >
        Toggle Theme
      </button>
  );
}
