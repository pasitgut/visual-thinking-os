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
  Heart,
  Target,
  Wrench,
  Beaker,
  ShieldCheck,
  ThumbsDown,
  AlertTriangle,
  Database,
  Activity,
  Variable,
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
      "border-blue-500/30 bg-gradient-to-br from-blue-600 to-indigo-700 text-white dark:border-blue-400/30 dark:from-blue-600 dark:to-indigo-800 shadow-[0_20px_50px_rgba(59,130,246,0.35)]",
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
  // Design Thinking
  empathize: {
    type: "empathize",
    label: "1. เข้าใจผู้ใช้ (Empathize)",
    icon: Heart,
    color: "pink",
    description: "มุมมองผู้ใช้ ปัญหา ความรู้สึก หรือข้อมูลสัมภาษณ์",
    className:
      "border-rose-400 bg-rose-50 text-rose-700 dark:border-rose-500 dark:bg-rose-900/20 dark:text-rose-300",
  },
  define: {
    type: "define",
    label: "2. นิยามปัญหา (Define)",
    icon: Target,
    color: "yellow",
    description: "ปัญหาหลัก (Problem Statement) หรือ POV",
    className:
      "border-orange-400 bg-orange-50 text-orange-700 dark:border-orange-500 dark:bg-orange-900/20 dark:text-orange-300",
  },
  ideate: {
    type: "ideate",
    label: "3. คิดไอเดีย (Ideate)",
    icon: Lightbulb,
    color: "yellow",
    description: "การระดมสมอง ทางเลือก หรือแนวทางแก้ไขปัญหา",
    className:
      "border-amber-400 bg-amber-50 text-amber-700 dark:border-amber-500 dark:bg-amber-900/20 dark:text-amber-300",
  },
  prototype: {
    type: "prototype",
    label: "4. ต้นแบบ (Prototype)",
    icon: Wrench,
    color: "purple",
    description: "แบบร่าง, wireframe, หรือ workflow จำลองแนวคิด",
    className:
      "border-indigo-400 bg-indigo-50 text-indigo-700 dark:border-indigo-500 dark:bg-indigo-900/20 dark:text-indigo-300",
  },
  test: {
    type: "test",
    label: "5. ทดสอบ (Test)",
    icon: Beaker,
    color: "green",
    description: "ผลการทดสอบ, feedback จากผู้ใช้ หรือสมมติฐานการวัดผล",
    className:
      "border-emerald-400 bg-emerald-50 text-emerald-700 dark:border-emerald-500 dark:bg-emerald-900/20 dark:text-emerald-300",
  },
  // Critical Thinking
  claim: {
    type: "claim",
    label: "ข้อเรียกร้อง (Claim)",
    icon: Gavel,
    color: "blue",
    description: "ใจความสำคัญ หรือข้อสรุปที่ต้องการพิสูจน์",
    className:
      "border-sky-400 bg-sky-50 text-sky-700 dark:border-sky-500 dark:bg-sky-900/20 dark:text-sky-300",
  },
  premise: {
    type: "premise",
    label: "หลักการ (Premise)",
    icon: Layers,
    color: "purple",
    description: "ข้อสนับสนุนขั้นต้น หรือเหตุผลรองรับข้อสรุป",
    className:
      "border-slate-400 bg-slate-50 text-slate-700 dark:border-slate-500 dark:bg-slate-900/20 dark:text-slate-300",
  },
  evidence: {
    type: "evidence",
    label: "หลักฐาน (Evidence)",
    icon: ShieldCheck,
    color: "green",
    description: "ข้อมูลเชิงประจักษ์ สถิติ หรือแหล่งอ้างอิงที่เชื่อถือได้",
    className:
      "border-blue-400 bg-blue-50 text-blue-700 dark:border-blue-500 dark:bg-blue-900/20 dark:text-blue-300",
  },
  assumption: {
    type: "assumption",
    label: "ข้อสมมติฐาน (Assumption)",
    icon: HelpCircle,
    color: "purple",
    description: "สิ่งที่ทึกทักเอาเอง หรือข้อตกลงเบื้องหลังที่ยังไม่ได้พิสูจน์",
    className:
      "border-violet-400 bg-violet-50 text-violet-700 dark:border-violet-500 dark:bg-violet-900/20 dark:text-violet-300",
  },
  objection: {
    type: "objection",
    label: "ข้อโต้แย้ง (Objection)",
    icon: ThumbsDown,
    color: "pink",
    description: "ข้อคัดค้าน หรือความเห็นต่างที่ลดความน่าเชื่อถือของเหตุผล",
    className:
      "border-red-400 bg-red-50 text-red-700 dark:border-red-500 dark:bg-red-900/20 dark:text-red-300",
  },
  fallacy: {
    type: "fallacy",
    label: "เหตุผลวิบัติ (Fallacy)",
    icon: AlertTriangle,
    color: "yellow",
    description: "การโต้แย้งที่ผิดพลาด หรืออคติทางความคิด (cognitive bias)",
    className:
      "border-amber-500 bg-amber-50 text-amber-800 dark:border-amber-600 dark:bg-amber-900/20 dark:text-amber-300 animate-pulse",
  },
  // Systems Thinking
  stock: {
    type: "stock",
    label: "อ่างสะสม (Stock)",
    icon: Database,
    color: "default",
    description: "ปริมาณสะสมที่เพิ่ม/ลดตามเวลา (เช่น เงินเก็บ, ความสุข)",
    className:
      "border-slate-500 bg-slate-100 text-slate-800 dark:border-slate-400 dark:bg-slate-800 dark:text-slate-200 font-mono",
  },
  flow: {
    type: "flow",
    label: "อัตราไหล (Flow)",
    icon: Activity,
    color: "blue",
    description: "อัตราการเพิ่มหรือลดของ Stock (เช่น รายได้, รายจ่าย)",
    className:
      "border-cyan-500 bg-cyan-50 text-cyan-800 dark:border-cyan-400 dark:bg-cyan-900/20 dark:text-cyan-200",
  },
  variable: {
    type: "variable",
    label: "ตัวแปรเสริม (Variable)",
    icon: Variable,
    color: "purple",
    description: "ตัวแปรภายนอกที่มีผลต่อระบบ หรืออัตราไหล",
    className:
      "border-fuchsia-400 bg-fuchsia-50 text-fuchsia-700 dark:border-fuchsia-500 dark:bg-fuchsia-900/20 dark:text-fuchsia-300",
  },
};
