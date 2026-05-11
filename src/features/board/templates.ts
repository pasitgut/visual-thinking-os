import { v4 as uuidv4 } from "uuid";
import { TaskNode, TaskStatus, TaskType, TaskColor } from "@/types/task";
import { Edge } from "reactflow";

export interface BoardTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  nodes: Omit<TaskNode, "data"> & { data: any }[];
  edges: Edge[];
}

const generateIds = (count: number) =>
  Array.from({ length: count }, () => uuidv4());

export const BOARD_TEMPLATES: BoardTemplate[] = [
  {
    id: "project-planning",
    name: "Project Planning",
    description: "Structure your next big project from goals to tasks.",
    icon: "📋",
    nodes: [
      {
        id: "root",
        type: "task",
        position: { x: 0, y: 0 },
        data: {
          title: "🚀 New Project Goal",
          status: "todo",
          type: "root",
          color: "blue",
          depth: 0,
        },
      },
      {
        id: "p1",
        type: "task",
        position: { x: -200, y: 150 },
        data: {
          title: "🎨 Design & UX",
          status: "todo",
          type: "parent",
          color: "pink",
          depth: 1,
        },
      },
      {
        id: "p2",
        type: "task",
        position: { x: 0, y: 150 },
        data: {
          title: "💻 Development",
          status: "todo",
          type: "parent",
          color: "purple",
          depth: 1,
        },
      },
      {
        id: "p3",
        type: "task",
        position: { x: 200, y: 150 },
        data: {
          title: "📣 Marketing",
          status: "todo",
          type: "parent",
          color: "yellow",
          depth: 1,
        },
      },
      {
        id: "c1",
        type: "task",
        position: { x: -200, y: 300 },
        data: {
          title: "Create Wireframes",
          status: "todo",
          type: "child",
          color: "default",
          depth: 2,
        },
      },
      {
        id: "c2",
        type: "task",
        position: { x: 0, y: 300 },
        data: {
          title: "Setup Database",
          status: "todo",
          type: "child",
          color: "default",
          depth: 2,
        },
      },
      {
        id: "c3",
        type: "task",
        position: { x: 200, y: 300 },
        data: {
          title: "Social Media Plan",
          status: "todo",
          type: "child",
          color: "default",
          depth: 2,
        },
      },
    ],
    edges: [
      { id: "e-root-p1", source: "root", target: "p1" },
      { id: "e-root-p2", source: "root", target: "p2" },
      { id: "e-root-p3", source: "root", target: "p3" },
      { id: "e-p1-c1", source: "p1", target: "c1" },
      { id: "e-p2-c2", source: "p2", target: "c2" },
      { id: "e-p3-c3", source: "p3", target: "c3" },
    ],
  },
  {
    id: "study-roadmap",
    name: "Study Roadmap",
    description: "Master a new skill with a clear step-by-step path.",
    icon: "🎓",
    nodes: [
      {
        id: "root",
        type: "task",
        position: { x: 0, y: 0 },
        data: {
          title: "📚 Learning Path",
          status: "todo",
          type: "root",
          color: "green",
          depth: 0,
        },
      },
      {
        id: "p1",
        type: "task",
        position: { x: -150, y: 150 },
        data: {
          title: "🌱 Fundamentals",
          status: "todo",
          type: "parent",
          color: "default",
          depth: 1,
        },
      },
      {
        id: "p2",
        type: "task",
        position: { x: 150, y: 150 },
        data: {
          title: "🛠️ Advanced Topics",
          status: "todo",
          type: "parent",
          color: "purple",
          depth: 1,
        },
      },
      {
        id: "c1",
        type: "task",
        position: { x: -150, y: 300 },
        data: {
          title: "Read basic docs",
          status: "todo",
          type: "child",
          color: "default",
          depth: 2,
        },
      },
      {
        id: "c2",
        type: "task",
        position: { x: 150, y: 300 },
        data: {
          title: "Build a project",
          status: "todo",
          type: "child",
          color: "default",
          depth: 2,
        },
      },
    ],
    edges: [
      { id: "e-root-p1", source: "root", target: "p1" },
      { id: "e-root-p2", source: "root", target: "p2" },
      { id: "e-p1-c1", source: "p1", target: "c1" },
      { id: "e-p2-c2", source: "p2", target: "c2" },
    ],
  },
  {
    id: "startup-mvp",
    name: "Startup MVP",
    description: "Define your Lean Startup core features and validation.",
    icon: "🚀",
    nodes: [
      {
        id: "root",
        type: "task",
        position: { x: 0, y: 0 },
        data: {
          title: "💡 MVP Definition",
          status: "todo",
          type: "root",
          color: "blue",
          depth: 0,
        },
      },
      {
        id: "p1",
        type: "task",
        position: { x: -150, y: 150 },
        data: {
          title: "🔍 Problem / Solution",
          status: "todo",
          type: "parent",
          color: "pink",
          depth: 1,
        },
      },
      {
        id: "p2",
        type: "task",
        position: { x: 150, y: 150 },
        data: {
          title: "🧱 Core Features",
          status: "todo",
          type: "parent",
          color: "purple",
          depth: 1,
        },
      },
      {
        id: "c1",
        type: "task",
        position: { x: -150, y: 300 },
        data: {
          title: "User interviews",
          status: "todo",
          type: "child",
          color: "default",
          depth: 2,
        },
      },
      {
        id: "c2",
        type: "task",
        position: { x: 150, y: 300 },
        data: {
          title: "Landing page",
          status: "todo",
          type: "child",
          color: "default",
          depth: 2,
        },
      },
    ],
    edges: [
      { id: "e-root-p1", source: "root", target: "p1" },
      { id: "e-root-p2", source: "root", target: "p2" },
      { id: "e-p1-c1", source: "p1", target: "c1" },
      { id: "e-p2-c2", source: "p2", target: "c2" },
    ],
  },
  {
    id: "weekly-planning",
    name: "Weekly Planning",
    description: "Organize your week with clear daily focus areas.",
    icon: "📅",
    nodes: [
      {
        id: "root",
        type: "task",
        position: { x: 0, y: 0 },
        data: {
          title: "📅 Weekly Focus",
          status: "todo",
          type: "root",
          color: "yellow",
          depth: 0,
        },
      },
      {
        id: "p1",
        type: "task",
        position: { x: -300, y: 150 },
        data: {
          title: "Monday",
          status: "todo",
          type: "parent",
          color: "blue",
          depth: 1,
        },
      },
      {
        id: "p2",
        type: "task",
        position: { x: -100, y: 150 },
        data: {
          title: "Tuesday",
          status: "todo",
          type: "parent",
          color: "default",
          depth: 1,
        },
      },
      {
        id: "p3",
        type: "task",
        position: { x: 100, y: 150 },
        data: {
          title: "Wednesday",
          status: "todo",
          type: "parent",
          color: "default",
          depth: 1,
        },
      },
      {
        id: "p4",
        type: "task",
        position: { x: 300, y: 150 },
        data: {
          title: "Thursday",
          status: "todo",
          type: "parent",
          color: "default",
          depth: 1,
        },
      },
      {
        id: "p5",
        type: "task",
        position: { x: 500, y: 150 },
        data: {
          title: "Friday",
          status: "todo",
          type: "parent",
          color: "green",
          depth: 1,
        },
      },
    ],
    edges: [
      { id: "e-root-p1", source: "root", target: "p1" },
      { id: "e-root-p2", source: "root", target: "p2" },
      { id: "e-root-p3", source: "root", target: "p3" },
      { id: "e-root-p4", source: "root", target: "p4" },
      { id: "e-root-p5", source: "root", target: "p5" },
    ],
  },
];

export const prepareTemplate = (template: BoardTemplate) => {
  const idMap: Record<string, string> = {};

  // Create a new set of IDs to avoid collisions
  template.nodes.forEach((node) => {
    idMap[node.id] = node.id === "root" ? "root" : uuidv4();
  });

  const nodes = template.nodes.map((node) => ({
    ...node,
    id: idMap[node.id],
    data: { ...node.data },
  }));

  const edges = template.edges.map((edge) => ({
    ...edge,
    id: `e-${idMap[edge.source]}-${idMap[edge.target]}`,
    source: idMap[edge.source],
    target: idMap[edge.target],
  }));

  return { nodes, edges };
};
