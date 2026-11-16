import { Barcode, Send } from "lucide-react";
import { MOCK_CONVERSATIONS, type ConversationItem } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface ChatTabProps {
  selectedConv: ConversationItem;
  onSelectConv: (conv: ConversationItem) => void;
  chatMessage: string;
  setChatMessage: (v: string) => void;
  triggerToast: (msg: string) => void;
  onOpenPos: () => void;
}

/** Tab bo tro: Hop thu hoi thoai — danh sach hoi thoai + khung chat (mock). */
export function ChatTab({
  selectedConv,
  onSelectConv,
  chatMessage,
  setChatMessage,
  triggerToast,
  onOpenPos,
}: ChatTabProps) {
  return (
    <div className="h-[calc(100vh-140px)] flex bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
      <div className="w-80 border-r border-slate-200 dark:border-slate-700 flex flex-col shrink-0">
        <div className="p-3 border-b border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300">
          Hội Thoại Mới Nhất
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
          {MOCK_CONVERSATIONS.map((c) => (
            <div
              key={c.id}
              onClick={() => onSelectConv(c)}
              className={`p-3.5 cursor-pointer transition-colors ${
                selectedConv.id === c.id ? "bg-emerald-50/70 border-l-4 border-blue-600" : "hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-800"
              }`}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900 dark:text-slate-100">{c.customerName}</span>
                <span className="text-xs text-slate-400">{c.lastTime}</span>
              </div>
              <div className="text-xs text-emerald-600 font-semibold mt-0.5">{c.platform}</div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-1">{c.lastMessage}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Chat View */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50/50 dark:bg-slate-800/50">
        <div className="h-14 px-5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between shrink-0">
          <div>
            <h3 className="font-bold text-xs text-slate-900 dark:text-slate-100">{selectedConv.customerName}</h3>
            <p className="text-xs text-slate-400">Kênh: {selectedConv.platform}</p>
          </div>
          <Button
                        onClick={onOpenPos}
                        size="sm"
                        className="px-3 py-1.5 rounded-lg font-semibold"
                      >
            <Barcode className="w-3.5 h-3.5" />
            <span>Mở POS Chốt Đơn</span>
                      </Button>
        </div>

        <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
          <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm max-w-md">
            <div className="text-slate-800 dark:text-slate-200">{selectedConv.lastMessage}</div>
            <div className="text-xs text-slate-400 mt-1 text-right">{selectedConv.lastTime}</div>
          </div>
        </div>

        <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 flex gap-2">
          <Input
            type="text"
            value={chatMessage}
            onChange={(e) => setChatMessage(e.target.value)}
            placeholder="Nhập tin nhắn trả lời khách hàng..."
            className="flex-1 focus:ring-1 focus:ring-blue-500"
          />
          <Button
                        onClick={() => {
                          if (!chatMessage.trim()) return;
                          triggerToast("Đã gửi tin nhắn phản hồi thành công!");
                          setChatMessage("");
                        }}
                        className="px-4 py-2"
                      >
            <Send className="w-3.5 h-3.5" />
            <span>Gửi</span>
                      </Button>
        </div>
      </div>
    </div>
  );
}
