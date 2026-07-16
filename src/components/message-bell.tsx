import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Send, MapPin, Users, ChevronLeft, MoreHorizontal, LogOut, UserMinus, Search, X, Paperclip } from "lucide-react";
import { formatDistanceToNowStrict } from "date-fns";
import { useUser } from "@/hooks/use-user";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  useConversations,
  useUnreadMessagesTotal,
  useMessages,
  useSendMessage,
  useMessagesRealtime,
  useMarkConvRead,
  useLeaveConv,
  useRemoveMember,
  useStartDM,
  useMutualFollowers,
  type ConversationSummary,
  type MemberRow,
} from "@/lib/messages";
import { toast } from "sonner";

export function MessageBell() {
  const { user } = useUser();
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  useMessagesRealtime(user?.id, activeId ?? undefined);
  const unread = useUnreadMessagesTotal(user?.id);

  if (!user) return null;

  return (
    <>
      <button
        aria-label={`Messages${unread ? `, ${unread} unread` : ""}`}
        onClick={() => setOpen(true)}
        className="fixed right-4 top-[calc(env(safe-area-inset-top,0px)+64px)] z-40 flex h-11 w-11 items-center justify-center rounded-full border border-white/40 bg-white/55 shadow-glass backdrop-blur-2xl transition active:scale-95"
        style={{ WebkitBackdropFilter: "blur(24px) saturate(1.4)" }}
      >
        <MessageCircle className="h-[18px] w-[18px] text-ink" strokeWidth={2.2} />
        <AnimatePresence>
          {unread > 0 && (
            <motion.span
              key="dot"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white shadow-md ring-2 ring-white"
            >
              {unread > 99 ? "99+" : unread}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      <Sheet
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (!v) setActiveId(null);
        }}
      >
        <SheetContent
          side="right"
          className="w-full max-w-md border-l border-white/40 bg-white/80 p-0 backdrop-blur-2xl sm:max-w-md"
          style={{ WebkitBackdropFilter: "blur(28px) saturate(1.5)" }}
        >
          {activeId ? (
            <ChatView convId={activeId} onBack={() => setActiveId(null)} />
          ) : (
            <InboxView onOpen={(id) => setActiveId(id)} />
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}

// ============ INBOX ============
function InboxView({ onOpen }: { onOpen: (id: string) => void }) {
  const { user } = useUser();
  const { data: convs = [], isLoading } = useConversations(user?.id);
  const [tab, setTab] = useState<"dm" | "location">("dm");
  const [composeOpen, setComposeOpen] = useState(false);

  const filtered = convs.filter((c) => c.type === tab);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-black/5 px-5 py-4">
        <div>
          <h2 className="text-[19px] font-semibold tracking-tight text-ink">Messages</h2>
          <p className="text-[12px] text-muted-foreground">Chat with friends & gatherings</p>
        </div>
        <button
          onClick={() => setComposeOpen(true)}
          className="rounded-full bg-primary px-3 py-1.5 text-[12px] font-semibold text-primary-foreground shadow-sm transition active:scale-95"
        >
          New
        </button>
      </div>

      {/* Tabs */}
      <div className="mx-4 mt-3 grid grid-cols-2 rounded-full bg-black/5 p-1">
        {(["dm", "location"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`relative flex items-center justify-center gap-1.5 rounded-full py-1.5 text-[12.5px] font-semibold transition ${
              tab === t ? "bg-white text-ink shadow" : "text-muted-foreground"
            }`}
          >
            {t === "dm" ? <MessageCircle className="h-3.5 w-3.5" /> : <MapPin className="h-3.5 w-3.5" />}
            {t === "dm" ? "Direct" : "Gatherings"}
          </button>
        ))}
      </div>

      <div className="mt-2 flex-1 overflow-y-auto px-2 py-2">
        {isLoading ? (
          <div className="p-6 text-center text-[13px] text-muted-foreground">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-black/5">
              {tab === "dm" ? <MessageCircle className="h-6 w-6 text-muted-foreground" /> : <MapPin className="h-6 w-6 text-muted-foreground" />}
            </div>
            <p className="text-[14px] font-semibold text-ink">
              {tab === "dm" ? "No conversations yet" : "No gathering chats"}
            </p>
            <p className="mt-1 text-[12px] text-muted-foreground">
              {tab === "dm"
                ? "Message a mutual friend to start a chat."
                : "Join or host a gathering — a chat auto-opens for everyone going."}
            </p>
          </div>
        ) : (
          <ul className="flex flex-col">
            {filtered.map((c) => (
              <ConvItem key={c.id} c={c} onOpen={() => onOpen(c.id)} />
            ))}
          </ul>
        )}
      </div>

      <ComposeDialog open={composeOpen} onOpenChange={setComposeOpen} onOpenConv={(id) => { setComposeOpen(false); onOpen(id); }} />
    </div>
  );
}

function ConvItem({ c, onOpen }: { c: ConversationSummary; onOpen: () => void }) {
  const { user } = useUser();
  const other = c.type === "dm" ? c.members.find((m) => m.user_id !== user?.id) : null;
  const title =
    c.type === "location"
      ? c.title || "Gathering"
      : other?.profile?.display_name || (other?.profile?.username ? `@${other.profile.username}` : "Direct message");
  const avatarUrl = c.type === "dm" ? other?.profile?.avatar_url : null;
  const initials = (title || "?").slice(0, 2).toUpperCase();

  return (
    <li>
      <button
        onClick={onOpen}
        className="group flex w-full items-start gap-3 rounded-2xl px-3 py-3 text-left transition hover:bg-black/[0.04]"
      >
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-cover bg-center text-[13px] font-semibold text-white ring-2 ring-white"
          style={{
            backgroundImage: avatarUrl
              ? `url(${avatarUrl})`
              : c.type === "location"
                ? "linear-gradient(135deg, oklch(0.75 0.14 55), oklch(0.55 0.12 40))"
                : "linear-gradient(135deg, oklch(0.68 0.08 70), oklch(0.5 0.045 55))",
          }}
        >
          {!avatarUrl && (c.type === "location" ? <MapPin className="h-5 w-5" /> : initials)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <p className="truncate text-[14px] font-semibold text-ink">{title}</p>
            <span className="shrink-0 text-[10.5px] text-muted-foreground">
              {formatDistanceToNowStrict(new Date(c.last_message_at), { addSuffix: false })}
            </span>
          </div>
          <div className="mt-0.5 flex items-center gap-2">
            <p className="line-clamp-1 flex-1 text-[12.5px] text-muted-foreground">
              {c.last_body || (c.type === "location" ? `${c.members.length} going` : "Say hi 👋")}
            </p>
            {c.unread > 0 && (
              <span className="shrink-0 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-white">
                {c.unread}
              </span>
            )}
          </div>
        </div>
      </button>
    </li>
  );
}

// ============ CHAT VIEW ============
function ChatView({ convId, onBack }: { convId: string; onBack: () => void }) {
  const { user } = useUser();
  const { data: convs = [] } = useConversations(user?.id);
  const conv = convs.find((c) => c.id === convId);
  const { data: msgs = [] } = useMessages(convId);
  const send = useSendMessage(convId);
  const markRead = useMarkConvRead(convId, user?.id);
  const leave = useLeaveConv();
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [membersOpen, setMembersOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    markRead.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [convId, msgs.length]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [msgs.length]);

  useEffect(() => {
    if (!file) {
      setFilePreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setFilePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  if (!conv) return <div className="p-6 text-center text-sm text-muted-foreground">Loading…</div>;

  const other = conv.type === "dm" ? conv.members.find((m) => m.user_id !== user?.id) : null;
  const title =
    conv.type === "location"
      ? conv.title || "Gathering"
      : other?.profile?.display_name || (other?.profile?.username ? `@${other.profile.username}` : "Direct");
  const subtitle =
    conv.type === "location"
      ? `${conv.members.length} going${conv.expires_at ? ` · closes ${formatDistanceToNowStrict(new Date(conv.expires_at), { addSuffix: true })}` : ""}`
      : other?.profile?.username
        ? `@${other.profile.username}`
        : "";

  function pickFile(f: File | null) {
    if (!f) return;
    const MAX = 25 * 1024 * 1024;
    if (f.size > MAX) {
      toast.error("File too large (max 25MB)");
      return;
    }
    if (!f.type.startsWith("image/") && !f.type.startsWith("video/")) {
      toast.error("Only images and videos");
      return;
    }
    setFile(f);
  }

  async function handleSend() {
    const body = text.trim();
    const f = file;
    if (!body && !f) return;
    setText("");
    setFile(null);
    try {
      await send.mutateAsync({ body, file: f });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to send");
      setText(body);
      setFile(f);
    }
  }


  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-black/5 px-3 py-3">
        <button onClick={onBack} className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-black/5">
          <ChevronLeft className="h-5 w-5 text-ink" />
        </button>
        <button
          onClick={() => setMembersOpen(true)}
          className="flex min-w-0 flex-1 items-center gap-2.5 rounded-xl px-2 py-1 text-left hover:bg-black/[0.03]"
        >
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cover bg-center text-white"
            style={{
              backgroundImage: other?.profile?.avatar_url
                ? `url(${other.profile.avatar_url})`
                : conv.type === "location"
                  ? "linear-gradient(135deg, oklch(0.75 0.14 55), oklch(0.55 0.12 40))"
                  : "linear-gradient(135deg, oklch(0.68 0.08 70), oklch(0.5 0.045 55))",
            }}
          >
            {conv.type === "location" && <MapPin className="h-4 w-4" />}
          </div>
          <div className="min-w-0">
            <p className="truncate text-[14.5px] font-semibold text-ink">{title}</p>
            {subtitle && <p className="truncate text-[11px] text-muted-foreground">{subtitle}</p>}
          </div>
        </button>
        <button onClick={() => setMembersOpen(true)} className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-black/5">
          <Users className="h-4.5 w-4.5 text-ink" />
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-3">
        {msgs.length === 0 ? (
          <div className="mt-10 text-center text-[13px] text-muted-foreground">
            {conv.type === "location" ? "Say hi to your fellow travellers." : "Say something nice."}
          </div>
        ) : (
          <ul className="flex flex-col gap-1.5">
            {msgs.map((m, i) => {
              const mine = m.sender_id === user?.id;
              const prev = msgs[i - 1];
              const showName = conv.type === "location" && !mine && prev?.sender_id !== m.sender_id;
              const sender = conv.members.find((mm) => mm.user_id === m.sender_id);
              return (
                <li key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                  <div className="max-w-[75%]">
                    {showName && (
                      <p className="mb-0.5 pl-3 text-[10.5px] font-medium text-muted-foreground">
                        {sender?.profile?.display_name || sender?.profile?.username || "Member"}
                      </p>
                    )}
                    {m.media_url && m.signed_url && (
                      <div
                        className={`mb-1 overflow-hidden rounded-2xl border border-black/5 bg-black/[0.04] ${
                          mine ? "ml-auto" : ""
                        }`}
                        style={{ maxWidth: 260 }}
                      >
                        {m.media_type === "video" ? (
                          <video
                            src={m.signed_url}
                            controls
                            playsInline
                            className="block max-h-80 w-full bg-black object-contain"
                          />
                        ) : (
                          <a href={m.signed_url} target="_blank" rel="noreferrer">
                            <img
                              src={m.signed_url}
                              alt="attachment"
                              className="block max-h-80 w-full object-cover"
                              loading="lazy"
                            />
                          </a>
                        )}
                      </div>
                    )}
                    {m.body && (
                      <div
                        className={`whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2 text-[14px] leading-snug ${
                          mine ? "bg-primary text-primary-foreground" : "bg-black/[0.06] text-ink"
                        }`}
                      >
                        {m.body}
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="border-t border-black/5 bg-white/50 p-3 backdrop-blur-xl">
        <AnimatePresence>
          {file && filePreview && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="mb-2 flex items-center gap-2 rounded-2xl border border-black/10 bg-white/70 p-2 shadow-sm"
            >
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-black/5">
                {file.type.startsWith("video/") ? (
                  <video src={filePreview} className="h-full w-full object-cover" muted playsInline />
                ) : (
                  <img src={filePreview} alt="preview" className="h-full w-full object-cover" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12.5px] font-medium text-ink">{file.name}</p>
                <p className="text-[11px] text-muted-foreground">
                  {file.type.startsWith("video/") ? "Video" : "Photo"} · {(file.size / 1024 / 1024).toFixed(1)} MB
                </p>
              </div>
              <button
                onClick={() => setFile(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-black/5"
                aria-label="Remove attachment"
              >
                <X className="h-4 w-4 text-ink" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="flex items-end gap-2 rounded-full border border-black/10 bg-white px-2 py-1.5 shadow-sm">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            className="hidden"
            onChange={(e) => {
              pickFile(e.target.files?.[0] ?? null);
              e.target.value = "";
            }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={send.isPending}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink/70 transition hover:bg-black/5 active:scale-95 disabled:opacity-40"
            aria-label="Attach photo or video"
          >
            <Paperclip className="h-4 w-4" />
          </button>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            rows={1}
            placeholder={file ? "Add a caption…" : "Message"}
            className="max-h-32 flex-1 resize-none bg-transparent py-1.5 text-[14px] outline-none placeholder:text-muted-foreground"
          />
          <button
            onClick={handleSend}
            disabled={(!text.trim() && !file) || send.isPending}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition active:scale-95 disabled:opacity-40"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>


      <MembersSheet
        open={membersOpen}
        onOpenChange={setMembersOpen}
        conv={conv}
        onLeave={async () => {
          if (!user) return;
          await leave.mutateAsync({ conversationId: conv.id, userId: user.id });
          toast.success("Left conversation");
          setMembersOpen(false);
          onBack();
        }}
      />
    </div>
  );
}

// ============ MEMBERS ============
function MembersSheet({
  open,
  onOpenChange,
  conv,
  onLeave,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  conv: ConversationSummary;
  onLeave: () => void;
}) {
  const { user } = useUser();
  const remove = useRemoveMember();
  const iAmOwner = conv.members.some((m) => m.user_id === user?.id && m.role === "owner");

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full max-w-sm border-l border-white/40 bg-white/85 p-0 backdrop-blur-2xl"
        style={{ WebkitBackdropFilter: "blur(28px) saturate(1.5)" }}
      >
        <div className="border-b border-black/5 px-5 py-4">
          <h3 className="text-[16px] font-semibold text-ink">
            {conv.type === "location" ? "Gathering members" : "Chat details"}
          </h3>
          <p className="text-[11.5px] text-muted-foreground">{conv.members.length} member{conv.members.length === 1 ? "" : "s"}</p>
        </div>
        <div className="max-h-[calc(100dvh-160px)] overflow-y-auto px-2 py-2">
          <ul className="flex flex-col">
            {conv.members.map((m) => (
              <MemberRow2
                key={m.id}
                m={m}
                iAmOwner={iAmOwner}
                isMe={m.user_id === user?.id}
                onRemove={async () => {
                  await remove.mutateAsync({ conversationId: conv.id, userId: m.user_id });
                  toast.success("Removed from chat");
                }}
              />
            ))}
          </ul>
        </div>
        <div className="border-t border-black/5 p-4">
          <button
            onClick={onLeave}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-black/5 py-2.5 text-[13px] font-semibold text-ink transition hover:bg-black/10"
          >
            <LogOut className="h-4 w-4" />
            Leave chat
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function MemberRow2({
  m,
  iAmOwner,
  isMe,
  onRemove,
}: {
  m: MemberRow;
  iAmOwner: boolean;
  isMe: boolean;
  onRemove: () => void;
}) {
  const initials = (m.profile?.display_name || m.profile?.username || "?").slice(0, 2).toUpperCase();
  const canRemove = iAmOwner && !isMe && m.role !== "owner";
  return (
    <li className="flex items-center gap-3 rounded-2xl px-3 py-2.5">
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cover bg-center text-[12px] font-semibold text-white"
        style={{
          backgroundImage: m.profile?.avatar_url
            ? `url(${m.profile.avatar_url})`
            : "linear-gradient(135deg, oklch(0.68 0.08 70), oklch(0.5 0.045 55))",
        }}
      >
        {!m.profile?.avatar_url && initials}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13.5px] font-semibold text-ink">
          {m.profile?.display_name || m.profile?.username || "User"} {isMe && <span className="text-muted-foreground">(you)</span>}
        </p>
        <p className="text-[11px] text-muted-foreground">
          {m.role === "owner" ? "Host · owner" : m.profile?.username ? `@${m.profile.username}` : "Member"}
        </p>
      </div>
      {canRemove && (
        <button
          onClick={onRemove}
          className="flex items-center gap-1 rounded-full bg-black/5 px-2.5 py-1 text-[11.5px] font-medium text-ink transition hover:bg-red-500/10 hover:text-red-600"
        >
          <UserMinus className="h-3.5 w-3.5" />
          Remove
        </button>
      )}
    </li>
  );
}

// ============ COMPOSE (start DM) ============
function ComposeDialog({
  open,
  onOpenChange,
  onOpenConv,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onOpenConv: (id: string) => void;
}) {
  const { user } = useUser();
  const { data: mutuals = [], isLoading } = useMutualFollowers(user?.id);
  const startDM = useStartDM();
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return mutuals;
    return mutuals.filter(
      (p) => (p.username ?? "").toLowerCase().includes(s) || (p.display_name ?? "").toLowerCase().includes(s),
    );
  }, [mutuals, q]);

  async function start(uid: string) {
    try {
      const id = await startDM.mutateAsync(uid);
      onOpenConv(id);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not start chat");
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full max-w-sm border-l border-white/40 bg-white/85 p-0 backdrop-blur-2xl"
        style={{ WebkitBackdropFilter: "blur(28px) saturate(1.5)" }}
      >
        <div className="flex items-center justify-between border-b border-black/5 px-5 py-4">
          <div>
            <h3 className="text-[16px] font-semibold text-ink">New message</h3>
            <p className="text-[11.5px] text-muted-foreground">Only mutual friends can be messaged</p>
          </div>
          <button onClick={() => onOpenChange(false)} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-black/5">
            <X className="h-4 w-4 text-ink" />
          </button>
        </div>
        <div className="px-4 pt-3">
          <div className="flex items-center gap-2 rounded-full bg-black/5 px-3 py-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search friends"
              className="flex-1 bg-transparent text-[13.5px] outline-none placeholder:text-muted-foreground"
            />
          </div>
        </div>
        <div className="mt-2 max-h-[calc(100dvh-160px)] overflow-y-auto px-2 py-2">
          {isLoading ? (
            <div className="p-6 text-center text-[13px] text-muted-foreground">Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-[13.5px] font-semibold text-ink">No mutual friends yet</p>
              <p className="mt-1 text-[12px] text-muted-foreground">
                Follow someone and once they follow you back, you can message them.
              </p>
            </div>
          ) : (
            <ul className="flex flex-col">
              {filtered.map((p) => {
                const initials = (p.display_name || p.username || "?").slice(0, 2).toUpperCase();
                return (
                  <li key={p.id}>
                    <button
                      onClick={() => start(p.id)}
                      className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition hover:bg-black/[0.04]"
                    >
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-cover bg-center text-[12px] font-semibold text-white"
                        style={{
                          backgroundImage: p.avatar_url
                            ? `url(${p.avatar_url})`
                            : "linear-gradient(135deg, oklch(0.68 0.08 70), oklch(0.5 0.045 55))",
                        }}
                      >
                        {!p.avatar_url && initials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13.5px] font-semibold text-ink">{p.display_name || p.username || "User"}</p>
                        {p.username && <p className="truncate text-[11px] text-muted-foreground">@{p.username}</p>}
                      </div>
                      <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
