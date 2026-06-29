import { notify } from "./utils/toast";

function App() {
  return (
    <div>
      <button
        className="
    bg-bg
    text-text
    border
    border-border
    px-4
    py-2
    rounded-lg
    text-sm
    font-medium
    transition-colors
    duration-200
    hover:opacity-90
    active:scale-95
  "
        onClick={() =>
          notify.success("this is sucess")
        }
      >
        Show Toast-normal
      </button>
    </div>
  );
}

export default App;
