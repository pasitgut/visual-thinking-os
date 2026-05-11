import { 
  Lightbulb, 
  CheckCircle2, 
  AlertCircle, 
  Gavel, 
  HelpCircle, 
  BookOpen, 
  CircleDot,
  Layers,
  Circle
} from "lucide-react";
import { TaskType, TaskColor } from "@/types/task";

export interface NodeRegistryEntry {
  type: TaskType;
  label: string;
  icon: any;
  color: TaskColor;
  description: string;
  className: string;
}

export const NODE_REGISTRY: Record<TaskType, NodeRegistryEntry> = {
  root: {
    type: "root",
    label: "Root",
    icon: CircleDot,
    color: "blue",
    description: "Main project goal or starting point",
    className: "border-blue-500 bg-blue-500 text-white dark:border-blue-400 dark:bg-blue-600",
  },
  parent: {
    type: "parent",
    label: "Parent",
    icon: Layers,
    color: "purple",
    description: "Major category or milestone",
    className: "border-purple-400 bg-purple-50 text-purple-700 dark:border-purple-500 dark:bg-purple-900/20 dark:text-purple-300",
  },
  child: {
    type: "child",
    label: "General",
    icon: Circle,
    color: "default",
    description: "Standard task or sub-item",
    className: "border-zinc-300 bg-zinc-50 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  },
  idea: {
    type: "idea",
    label: "Idea",
    icon: Lightbulb,
    color: "yellow",
    description: "Creative spark or potential feature",
    className: "border-amber-400 bg-amber-50 text-amber-700 dark:border-amber-500 dark:bg-amber-900/20 dark:text-amber-300",
  },
  task: {
    type: "task",
    label: "Action",
    icon: CheckCircle2,
    color: "green",
    description: "Actionable item to be completed",
    className: "border-emerald-400 bg-emerald-50 text-emerald-700 dark:border-emerald-500 dark:bg-emerald-900/20 dark:text-emerald-300",
  },
  problem: {
    type: "problem",
    label: "Issue",
    icon: AlertCircle,
    color: "pink",
    description: "Blocker, bug, or concern",
    className: "border-pink-400 bg-pink-50 text-pink-700 dark:border-pink-500 dark:bg-pink-900/20 dark:text-pink-300",
  },
  decision: {
    type: "decision",
    label: "Decision",
    icon: Gavel,
    color: "purple",
    description: "Concluded choice or policy",
    className: "border-indigo-400 bg-indigo-50 text-indigo-700 dark:border-indigo-500 dark:bg-indigo-900/20 dark:text-indigo-300",
  },
  question: {
    type: "question",
    label: "Question",
    icon: HelpCircle,
    color: "blue",
    description: "Uncertainty or area for research",
    className: "border-sky-400 bg-sky-50 text-sky-700 dark:border-sky-500 dark:bg-sky-900/20 dark:text-sky-300",
  },
  reference: {
    type: "reference",
    label: "Reference",
    icon: BookOpen,
    color: "default",
    description: "Documentation or background info",
    className: "border-zinc-400 bg-zinc-50 text-zinc-600 dark:border-zinc-500 dark:bg-zinc-900/20 dark:text-zinc-400",
  },
};
