import Loader from "./components/common/Loader";
import { notify } from "./utils/toast";

function App() {
  return (
    <div>
      <div className="relative h-100 border bg-bg">
        <Loader text="Loading chats..." />
      </div>
      <div className="relative flex-1">
  <Loader text="Loading messages..." />
</div>
<div className="relative h-24">
  <Loader
    text="Saving..."
    size="sm"
    overlay={false}
  />
</div>
    </div>
  );
}

export default App;
