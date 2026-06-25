import { useState, useEffect } from "react";
import { MessageSquare, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/layout/Layout";
import ConversationList from "@/components/messaging/ConversationList";
import ChatWindow from "@/components/messaging/ChatWindow";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, useSearchParams } from "react-router-dom";

const Messages = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(
    searchParams.get("conv")
  );

  useEffect(() => {
    const conv = searchParams.get("conv");
    if (conv) setSelectedConversation(conv);
  }, [searchParams]);

  if (loading) {
    return (
      <Layout>
        <div className="container px-4 py-20 text-center">
          <div className="animate-pulse h-8 bg-muted rounded w-1/3 mx-auto" />
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className="container px-4 py-20 text-center">
          <MessageSquare className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground text-lg mb-4">Faça login para aceder às suas mensagens.</p>
          <Button onClick={() => navigate("/auth")}>Entrar</Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container px-4 pt-8 pb-4">
        <h1 className="font-display text-3xl text-foreground mb-6">Mensagens</h1>
      </div>
      <div className="container px-4 pb-8">
        <div className="border border-border rounded-xl overflow-hidden bg-background" style={{ height: "calc(100vh - 220px)" }}>
          <div className="flex h-full">
            {/* Conversation list - hidden on mobile when chat is open */}
            <div className={`w-full md:w-80 border-r border-border overflow-y-auto flex-shrink-0 ${selectedConversation ? "hidden md:block" : ""}`}>
              <div className="p-4 border-b border-border">
                <h2 className="font-medium text-foreground">Conversas</h2>
              </div>
              <ConversationList
                userId={user.id}
                selectedId={selectedConversation}
                onSelect={setSelectedConversation}
              />
            </div>

            {/* Chat window */}
            <div className={`flex-1 flex flex-col ${!selectedConversation ? "hidden md:flex" : ""}`}>
              {selectedConversation ? (
                <>
                  {/* Mobile back button */}
                  <div className="md:hidden border-b border-border p-2">
                    <Button variant="ghost" size="sm" onClick={() => setSelectedConversation(null)} className="gap-1">
                      <ArrowLeft className="w-4 h-4" /> Voltar
                    </Button>
                  </div>
                  <ChatWindow conversationId={selectedConversation} userId={user.id} />
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <MessageSquare className="w-16 h-16 text-muted-foreground/20 mx-auto mb-3" />
                    <p className="text-muted-foreground">Selecione uma conversa para começar</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Messages;
