import { useParams } from "react-router-dom";
import { useEffect } from "react";

const ChannelPage = () => {
  const { id, channelId } = useParams();

  useEffect(() => {
    // TODO: fetch channel messages and details for workspace id and channelId
  }, [id, channelId]);

  return (
    <div className="h-[calc(100vh-64px)] flex">
      {/* TODO: Channel sidebar for this workspace */}
      <aside className="w-64 bg-base-200 hidden md:block">Sidebar (channels)</aside>
      <main className="flex-1 p-4">
        <h1 className="text-xl font-bold mb-2">Workspace {id} · Channel {channelId}</h1>
        {/* TODO: Chat header, message list (virtualized), composer */}
        <div className="h-full grid place-items-center text-base-content/60">
          <p>Channel UI coming soon…</p>
        </div>
      </main>
    </div>
  );
};

export default ChannelPage;
