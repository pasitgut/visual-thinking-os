import { Node, Edge } from "reactflow";

export type TaskStatus = "todo" | "in-progress" | "done";
export type TaskType = 
  | "root" 
  | "parent" 
  | "child" 
  | "idea" 
  | "task" 
  | "problem" 
  | "decision" 
  | "question" 
  | "reference";

export type InteractionMode = "standard" | "brainstorm";
export type TaskColor =
  | "default"
  | "blue"
  | "green"
  | "purple"
  | "pink"
  | "yellow";

export type RelationshipType =
  | "hierarchy"
  | "related_to"
  | "depends_on"
  | "blocks"
  | "inspired_by";

export type ViewType = "mindmap" | "kanban" | "timeline" | "document";

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface TaskLink {
  id: string;
  url: string;
  title: string;
}

export interface TaskContent {
  notes?: string;
  checklist?: ChecklistItem[];
  links?: TaskLink[];
}

export interface TaskNodeData {
  title: string;
  status: TaskStatus;
  type: TaskType;
  color?: TaskColor;
  depth?: number;
  description?: string;
  content?: TaskContent;
  createdAt?: number;
  updatedAt?: number;
  onAddChild?: (parentId: string) => void;
  onDelete?: (id: string) => void;
  onStatusChange?: (id: string, status: TaskStatus) => void;
  onTitleChange?: (id: string, title: string) => void;
  onTypeChange?: (id: string, type: TaskType) => void;
  onColorChange?: (id: string, color: TaskColor) => void;
}

export interface TaskEdgeData {
  type: RelationshipType;
}

export type TaskNode = Node<TaskNodeData>;
export type TaskEdge = Edge<TaskEdgeData>;

export interface InboxItem {
  id: string;
  text: string;
  createdAt: number;
}
