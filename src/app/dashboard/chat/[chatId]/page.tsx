import ChatInterface from "@/components/ChatInterface";
import { Id } from "../../../../../convex/_generated/dataModel";
import { api } from "../../../../../convex/_generated/api";
import { getConvexClient } from "@/lib/convex";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

// Match what .next/types expects
type PageParams = Promise<{ chatId: string }>;

export default async function ChatPage({
  params,
}: {
  params: PageParams;
}) {
  const { chatId } = await params;
  const chatIdTyped = chatId as Id<"chats">;

  const { userId } = await auth();
  if (!userId) {
    redirect("/");
  }

  try {
    const convex = getConvexClient();

    const chat = await convex.query(api.chats.getChat, {
      id: chatIdTyped,
      userId,
    });

    if (!chat) {
      console.log("⚠️ Chat not found or unauthorized, redirecting to dashboard");
      redirect("/dashboard");
    }

    const initialMessages = await convex.query(api.messages.list, {
      chatId: chatIdTyped,
    });

    return (
      <div className="flex-1 overflow-hidden">
        <ChatInterface chatId={chatIdTyped} initialMessages={initialMessages} />
      </div>
    );
  } catch (error) {
    console.error("🔥 Error loading chat:", error);
    redirect("/dashboard");
  }
}
