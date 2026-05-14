import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  Circle,
  CircleDot,
  Gavel,
  HelpCircle,
  Layers,
  Lightbulb,
  type LucideIcon,
} from "lucide-react";
import type { TaskColor, TaskType } from "@/types/task";

export interface NodeRegistryEntry {
  type: TaskType;
  label: string;
  icon: LucideIcon;
  color: TaskColor;
  description: string;
  className: string;
}

export const NODE_REGISTRY: Record<TaskType, NodeRegistryEntry> = {
  root: {
    type: "root",
    label: "เริ่มตรงนี้",
    icon: CircleDot,
    color: "blue",
    description: "เป้าหมายใหญ่หรือจุดเริ่มต้น",
    className:
      "border-blue-500 bg-blue-500 text-white dark:border-blue-400 dark:bg-blue-600",
  },
  parent: {
    type: "parent",
    label: "หัวข้อหลัก",
    icon: Layers,
    color: "purple",
    description: "หมวดหมู่ใหญ่หรือเป้าหมายย่อย",
    className:
      "border-purple-400 bg-purple-50 text-purple-700 dark:border-purple-500 dark:bg-purple-900/20 dark:text-purple-300",
  },
  child: {
    type: "child",
    label: "ทั่วไป",
    icon: Circle,
    color: "default",
    description: "งานทั่วไปหรือโน้ตย่อย",
    className:
      "border-zinc-300 bg-zinc-50 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  },
  idea: {
    type: "idea",
    label: "ไอเดีย",
    icon: Lightbulb,
    color: "yellow",
    description: "ความคิดเจ๋งๆ หรือสิ่งที่น่าลอง",
    className:
      "border-amber-400 bg-amber-50 text-amber-700 dark:border-amber-500 dark:bg-amber-900/20 dark:text-amber-300",
  },
  task: {
    type: "task",
    label: "ต้องทำ",
    icon: CheckCircle2,
    color: "green",
    description: "งานที่ต้องทำให้เสร็จ",
    className:
      "border-emerald-400 bg-emerald-50 text-emerald-700 dark:border-emerald-500 dark:bg-emerald-900/20 dark:text-emerald-300",
  },
  problem: {
    type: "problem",
    label: "ปัญหา",
    icon: AlertCircle,
    color: "pink",
    description: "สิ่งที่ติดขัด บั๊ก หรือเรื่องที่กังวล",
    className:
      "border-pink-400 bg-pink-50 text-pink-700 dark:border-pink-500 dark:bg-pink-900/20 dark:text-pink-300",
  },
  decision: {
    type: "decision",
    label: "สรุปแล้ว",
    icon: Gavel,
    color: "purple",
    description: "สิ่งที่เลือกแล้วหรือข้อตกลง",
    className:
      "border-indigo-400 bg-indigo-50 text-indigo-700 dark:border-indigo-500 dark:bg-indigo-900/20 dark:text-indigo-300",
  },
  question: {
    type: "question",
    label: "คำถาม",
    icon: HelpCircle,
    color: "blue",
    description: "เรื่องที่ยังไม่แน่ใจหรือต้องไปหาข้อมูลเพิ่ม",
    className:
      "border-sky-400 bg-sky-50 text-sky-700 dark:border-sky-500 dark:bg-sky-900/20 dark:text-sky-300",
  },
  reference: {
    type: "reference",
    label: "อ้างอิง",
    icon: BookOpen,
    color: "default",
    description: "เอกสารหรือข้อมูลประกอบ",
    className:
      "border-zinc-400 bg-zinc-50 text-zinc-600 dark:border-zinc-500 dark:bg-zinc-900/20 dark:text-zinc-400",
  },
};
