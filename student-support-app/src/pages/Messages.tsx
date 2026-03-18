import Inbox from "./Inbox";
import Chat from "./Chat";

export default function Messages() {
  return (
    <div className="min-h-screen flex">

      {/* LEFT - INBOX */}
      <div className="w-1/3 border-r">
        <Inbox />
      </div>

      {/* RIGHT - CHAT */}
      <div className="flex-1">
        <Chat />
      </div>

    </div>
  );
}