
-- Conversations table
CREATE TABLE public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_1 uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  participant_2 uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service_id uuid REFERENCES public.services(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT unique_conversation UNIQUE (participant_1, participant_2, service_id),
  CONSTRAINT different_participants CHECK (participant_1 <> participant_2)
);

-- Messages table
CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Conversations: participants can view
CREATE POLICY "Users can view own conversations"
  ON public.conversations FOR SELECT
  TO authenticated
  USING (auth.uid() = participant_1 OR auth.uid() = participant_2);

-- Conversations: authenticated users can create
CREATE POLICY "Users can create conversations"
  ON public.conversations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = participant_1 OR auth.uid() = participant_2);

-- Conversations: admins can view all
CREATE POLICY "Admins can view all conversations"
  ON public.conversations FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Messages: participants can view messages in their conversations
CREATE POLICY "Users can view messages in own conversations"
  ON public.messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id
      AND (c.participant_1 = auth.uid() OR c.participant_2 = auth.uid())
    )
  );

-- Messages: users can send messages in their conversations
CREATE POLICY "Users can send messages in own conversations"
  ON public.messages FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id
      AND (c.participant_1 = auth.uid() OR c.participant_2 = auth.uid())
    )
  );

-- Messages: users can update (mark as read) messages in their conversations
CREATE POLICY "Users can update messages in own conversations"
  ON public.messages FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id
      AND (c.participant_1 = auth.uid() OR c.participant_2 = auth.uid())
    )
  );

-- Updated_at trigger for conversations
CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
