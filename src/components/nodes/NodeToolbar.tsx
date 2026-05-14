import { format, parseISO } from "date-fns";
import {
  Calendar as CalendarIcon,
  Flame,
  type LucideIcon,
  Pin,
  PinOff,
  Plus,
  Target,
  Trash2,
} from "lucide-react";
import { useRef } from "react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { NODE_REGISTRY } from "@/features/task/nodeRegistry";
import { useDeviceSpec } from "@/hooks/useDeviceSpec";
import { cn } from "@/lib/utils";
import { useTaskStore } from "@/stores/useTaskStore";
import type { TaskColor, TaskType } from "@/types/task";

interface NodeToolbarProps {
  id: string;
  type: TaskType;
  color: TaskColor;
  deadline?: string;
  isPinned?: boolean;
  isImportant?: boolean;
  onAddChild: () => void;
  onDelete: () => void;
  onTypeChange: (type: TaskType) => void;
  onColorChange: (color: TaskColor) => void;
  onTogglePin: () => void;
  onToggleImportance: (isImportant: boolean) => void;
  onDeadlineChange: (deadline: string) => void;
  isRoot?: boolean;
}

const COLORS: { value: TaskColor; class: string }[] = [
  {
    value: "default",
    class: "bg-zinc-200 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700",
  },
  { value: "blue", class: "bg-blue-400 dark:bg-blue-500 border-blue-500" },
  {
    value: "green",
    class: "bg-emerald-400 dark:bg-emerald-500 border-emerald-500",
  },
  {
    value: "purple",
    class: "bg-purple-400 dark:bg-purple-500 border-purple-500",
  },
  { value: "pink", class: "bg-pink-400 dark:bg-pink-500 border-pink-500" },
  { value: "yellow", class: "bg-amber-400 dark:bg-amber-500 border-amber-500" },
];

const TYPES: { value: TaskType; icon: LucideIcon; label: string }[] = [
  { value: "task", icon: NODE_REGISTRY.task.icon, label: "ต้องทำ" },
  { value: "idea", icon: NODE_REGISTRY.idea.icon, label: "ไอเดีย" },
  { value: "problem", icon: NODE_REGISTRY.problem.icon, label: "ปัญหา" },
  { value: "decision", icon: NODE_REGISTRY.decision.icon, label: "สรุปแล้ว" },
  { value: "question", icon: NODE_REGISTRY.question.icon, label: "คำถาม" },
  {
    value: "reference",
    icon: NODE_REGISTRY.reference.icon,
    label: "อ้างอิง",
  },
];

export const NodeToolbar = ({
  id,
  type,
  color,
  onAddChild,
  onDelete,
  onTypeChange,
  onColorChange,
  onTogglePin,
  onToggleImportance,
  onDeadlineChange,
  isRoot,
  isPinned,
  isImportant,
  deadline,
}: NodeToolbarProps) => {
  const { focusNodeId, setFocusNodeId } = useTaskStore();
  const { isMobile } = useDeviceSpec();
  const isFocused = focusNodeId === id;

  const btnClass = isMobile ? "h-10 w-10" : "h-8 w-8";
  const iconClass = isMobile ? "h-5 w-5" : "h-4 w-4";

  const hasDeadline = deadline && deadline !== "No deadline";

  return (
    <div
      role="presentation"
      className={cn(
        "flex items-center gap-1 p-1 bg-background/95 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-300 nodrag nopan pointer-events-auto max-w-[90vw] overflow-x-auto custom-scrollbar",
        isMobile && "gap-2 p-1.5",
      )}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Action Section */}
      <div className="flex items-center gap-1">
        {!isRoot && (
          <button
            type="button"
            className={cn(
              "flex items-center justify-center rounded-lg transition-all active:scale-95",
              btnClass,
              isFocused
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105"
                : "hover:bg-primary/10 text-primary",
            )}
            onClick={(e) => {
              e.stopPropagation();
              setFocusNodeId(isFocused ? null : id);
            }}
            title={isFocused ? "เลิกโฟกัส" : "โฟกัสเฉพาะส่วนนี้"}
          >
            <Target className={iconClass} />
          </button>
        )}

        <button
          type="button"
          className={cn(
            "flex items-center justify-center rounded-lg hover:bg-primary/10 text-primary transition-all active:scale-95",
            btnClass,
          )}
          onClick={(e) => {
            e.stopPropagation();
            onAddChild();
          }}
          title="เพิ่มงานย่อย"
        >
          <Plus className={iconClass} />
        </button>

        {type === "task" && (
          <Popover>
            <PopoverTrigger
              className={cn(
                "flex items-center justify-center rounded-lg transition-all active:scale-95 relative overflow-hidden",
                btnClass,
                hasDeadline
                  ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 shadow-sm"
                  : "hover:bg-blue-50 text-blue-500/60",
              )}
              onPointerDown={(e) => e.stopPropagation()}
              title={hasDeadline ? `กำหนดส่ง: ${deadline}` : "ใส่วันที่"}
            >
              <CalendarIcon className={iconClass} />
            </PopoverTrigger>
            <PopoverContent
              className="w-auto p-0 border-none shadow-2xl"
              align="center"
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col">
                <Calendar
                  mode="single"
                  selected={
                    deadline && deadline !== "No deadline"
                      ? parseISO(deadline)
                      : undefined
                  }
                  onSelect={(date) => {
                    if (date) {
                      onDeadlineChange(format(date, "yyyy-MM-dd"));
                    }
                  }}
                />
                {hasDeadline && (
                  <div className="p-2 border-t border-border bg-muted/50">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeadlineChange("No deadline");
                      }}
                      className="w-full py-1.5 text-[11px] font-bold text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                    >
                      เอาวันที่ออก
                    </button>
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>
        )}

        {!isRoot && (
          <button
            type="button"
            className={cn(
              "flex items-center justify-center rounded-lg transition-all active:scale-95",
              btnClass,
              isPinned
                ? "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 shadow-sm shadow-amber-200/50"
                : "hover:bg-amber-50 text-amber-500/60",
            )}
            onClick={(e) => {
              e.stopPropagation();
              onTogglePin();
            }}
            title={isPinned ? "ปลดเข็มหมุด" : "ปักหมุดไว้ตรงนี้"}
          >
            {isPinned ? (
              <PinOff className={iconClass} />
            ) : (
              <Pin className={iconClass} />
            )}
          </button>
        )}
      </div>

      {!isRoot && (
        <>
          <div className="w-[1px] h-5 bg-zinc-200 dark:bg-zinc-800 mx-0.5" />

          {/* Semantic Type Section */}
          <div className="flex items-center gap-1">
            {TYPES.map((t) => (
              <button
                type="button"
                key={t.value}
                className={cn(
                  "flex items-center justify-center rounded-lg transition-all active:scale-95",
                  btnClass,
                  type === t.value
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105"
                    : "hover:bg-zinc-100 dark:hover:bg-zinc-800 text-muted-foreground",
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  onTypeChange(t.value);
                }}
                title={t.label}
              >
                <t.icon className={iconClass} />
              </button>
            ))}
          </div>

          <div className="w-[1px] h-5 bg-zinc-200 dark:bg-zinc-800 mx-0.5" />

          {/* Color Section */}
          <div
            className={cn("flex items-center gap-1 px-1", isMobile && "gap-2")}
          >
            {COLORS.map((c) => (
              <button
                type="button"
                key={c.value}
                className={cn(
                  "rounded-full border-2 transition-all active:scale-90 hover:scale-125 shadow-sm",
                  isMobile ? "h-7 w-7" : "h-5 w-5",
                  color === c.value
                    ? "ring-2 ring-primary ring-offset-2 dark:ring-offset-zinc-950 scale-110"
                    : "border-transparent",
                  c.class,
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  onColorChange(c.value);
                }}
                title={`Color: ${c.value}`}
              />
            ))}
          </div>

          <div className="w-[1px] h-5 bg-zinc-200 dark:bg-zinc-800 mx-0.5" />

          {/* Importance Toggle */}
          <button
            type="button"
            className={cn(
              "flex items-center justify-center rounded-lg transition-all active:scale-95",
              btnClass,
              isImportant
                ? "bg-amber-500 text-white shadow-lg shadow-amber-500/30 scale-105"
                : "hover:bg-amber-500/10 text-amber-500/60",
            )}
            onClick={(e) => {
              e.stopPropagation();
              onToggleImportance(!isImportant);
            }}
            title={isImportant ? "ลดความสำคัญ" : "เน้นว่าสำคัญ!"}
          >
            <Flame className={cn(iconClass, isImportant && "animate-pulse")} />
          </button>

          <div className="w-[1px] h-5 bg-zinc-200 dark:bg-zinc-800 mx-0.5" />
          <button
            type="button"
            className={cn(
              "flex items-center justify-center rounded-lg hover:bg-destructive/10 text-destructive transition-all active:scale-95",
              btnClass,
            )}
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            title="ลบทิ้งเลย"
          >
            <Trash2 className={iconClass} />
          </button>
        </>
      )}
    </div>
  );
};
