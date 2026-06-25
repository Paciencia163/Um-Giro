import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { pt } from "date-fns/locale";
import { MessageSquare, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface Conversation {
  id: string;
  participant_1: string;
  participant_2: string;
  service_id: string | null;
  updated_at: string | null;
  otherUser?: { full_name: string | null; avatar_url: string | null };
  serviceName?: string;
  lastMessage?: string;
  unreadCount?: number;
}

interface ConversationListProps {
  userId: string;
  selectedId: string | null;
  onSelect: (id: string) => void;
}

const ConversationList = ({ userId, selectedId, onSelect }: ConversationListProps) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConversations = async () => {
    const { data: convos } = await supabase
      .from("conversations")
      .select("*")
      .order("updated_at", { ascending: false });

    if (!convos || convos.length === 0) {
      setConversations([]);
      setLoading(false);
      return;
    }

    // Get other user profiles
    const otherIds = convos.map((c) =>
      c.participant_1 === userId ? c.participant_2 : c.participant_1
    );
    const serviceIds = convos.filter((c) => c.service_id).map((c) => c.service_id!);

    const [profilesRes, servicesRes] = await Promise.all([
      supabase.from("profiles").select("id, full_name, avatar_url").in("id", otherIds),
      serviceIds.length > 0
        ? supabase.from("services").select("id, name").in("id", serviceIds)
        : Promise.resolve({ data: [] }),
    ]);

    const profileMap = new Map((profilesRes.data ?? []).map((p) => [p.id, p] as const));
    const serviceMap = new Map((servicesRes.data ?? []).map((s) => [s.id, s.name] as const));

    // Get last message for each conversation
    const enriched = await Promise.all(
      convos.map(async (c) => {
        const otherId = c.participant_1 === userId ? c.participant_2 : c.participant_1;
        const { data: msgs } = await supabase
          .from("messages")
          .select("content, is_read, sender_id")
          .eq("conversation_id", c.id)
          .order("created_at", { ascending: false })
          .limit(1);

        const { count } = await supabase
          .from("messages")
          .select("*", { count: "exact", head: true })
          .eq("conversation_id", c.id)
          .eq("is_read", false)
          .neq("sender_id", userId);

        return {
          ...c,
          otherUser: profileMap.get(otherId) ?? null,
          serviceName: c.service_id ? serviceMap.get(c.service_id) : undefined,
          lastMessage: msgs?.[0]?.content,
          unreadCount: count ?? 0,
        } as Conversation;
      })
    );

    setConversations(enriched);
    setLoading(false);
  };

  useEffect(() => {
    fetchConversations();

    // Listen for new messages to refresh list
    const channel = supabase
      .channel("conv-list")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, () => {
        fetchConversations();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userId]);

  if (loading) {
    return (
      <div className="space-y-2 p-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse flex items-center gap-3 p-3">
            <div className="w-10 h-10 rounded-full bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted rounded w-2/3" />
              <div className="h-3 bg-muted rounded w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="text-center py-12 px-4">
        <MessageSquare className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
        <p className="text-muted-foreground text-sm">Sem conversas ainda.</p>
        <p className="text-muted-foreground text-xs mt-1">Inicie uma conversa a partir da página de um serviço.</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border">
      {conversations.map((conv) => (
        <button
          key={conv.id}
          onClick={() => onSelect(conv.id)}
          className={cn(
            "w-full text-left p-4 hover:bg-muted/50 transition-colors flex items-center gap-3",
            selectedId === conv.id && "bg-muted"
          )}
        >
          {conv.otherUser?.avatar_url ? (
            <img src={conv.otherUser.avatar_url} className="w-10 h-10 rounded-full object-cover flex-shrink-0" alt="" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-primary" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-foreground truncate">
                {conv.otherUser?.full_name ?? "Utilizador"}
              </p>
              {(conv.unreadCount ?? 0) > 0 && (
                <span className="bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                  {conv.unreadCount}
                </span>
              )}
            </div>
            {conv.serviceName && (
              <p className="text-xs text-primary truncate">{conv.serviceName}</p>
            )}
            {conv.lastMessage && (
              <p className="text-xs text-muted-foreground truncate mt-0.5">{conv.lastMessage}</p>
            )}
          </div>
        </button>
      ))}
    </div>
  );
};

export default ConversationList;
