"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useTaskStore } from "@/stores/useTaskStore";
import { 
  X, 
  Trash2, 
  ChevronRight, 
  Plus, 
  Link as LinkIcon, 
  CheckSquare, 
  FileText,
  ExternalLink,
  MoreVertical,
  Calendar,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import ReactMarkdown from "react-markdown";
import { TaskStatus, ChecklistItem, TaskLink } from "@/types/task";
import { v4 as uuidv4 } from "uuid";
import debounce from "lodash/debounce";

export const TaskDetailPanel = () => {
  const { 
    nodes, 
    selectedNodeIds, 
    isDetailPanelOpen, 
    setDetailPanelOpen, 
    updateNodeTitle,
    updateNodeStatus,
    updateNodeContent,
    deleteNode
  } = useTaskStore();

  const selectedNode = nodes.find(n => n.id === selectedNodeIds[0]);
  const [activeTab, setActiveTab] = useState<"notes" | "checklist" | "links">("notes");

  // Local state for debounced updates
  const [localNotes, setLocalNotes] = useState("");

  useEffect(() => {
    if (selectedNode) {
      setLocalNotes(selectedNode.data.content?.notes || "");
    }
  }, [selectedNode?.id]);

  const debouncedUpdateNotes = useCallback(
    debounce((id: string, notes: string) => {
      updateNodeContent(id, { notes });
    }, 1000),
    []
  );

  if (!selectedNode || !isDetailPanelOpen) return null;

  const handleNotesChange = (val: string) => {
    setLocalNotes(val);
    debouncedUpdateNotes(selectedNode.id, val);
  };

  const addChecklistItem = () => {
    const newItem: ChecklistItem = {
      id: uuidv4(),
      text: "",
      completed: false
    };
    const currentList = selectedNode.data.content?.checklist || [];
    updateNodeContent(selectedNode.id, { checklist: [...currentList, newItem] });
  };

  const toggleChecklistItem = (itemId: string) => {
    const currentList = selectedNode.data.content?.checklist || [];
    const newList = currentList.map(item => 
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );
    updateNodeContent(selectedNode.id, { checklist: newList });
  };

  const updateChecklistItem = (itemId: string, text: string) => {
    const currentList = selectedNode.data.content?.checklist || [];
    const newList = currentList.map(item => 
      item.id === itemId ? { ...item, text } : item
    );
    updateNodeContent(selectedNode.id, { checklist: newList });
  };

  const deleteChecklistItem = (itemId: string) => {
    const currentList = selectedNode.data.content?.checklist || [];
    const newList = currentList.filter(item => item.id !== itemId);
    updateNodeContent(selectedNode.id, { checklist: newList });
  };

  const addLink = () => {
    const newLink: TaskLink = {
      id: uuidv4(),
      url: "",
      title: ""
    };
    const currentLinks = selectedNode.data.content?.links || [];
    updateNodeContent(selectedNode.id, { links: [...currentLinks, newLink] });
  };

  const updateLink = (linkId: string, updates: Partial<TaskLink>) => {
    const currentLinks = selectedNode.data.content?.links || [];
    const newLinks = currentLinks.map(link => 
      link.id === linkId ? { ...link, ...updates } : link
    );
    updateNodeContent(selectedNode.id, { links: newLinks });
  };

  const deleteLink = (linkId: string) => {
    const currentLinks = selectedNode.data.content?.links || [];
    const newLinks = currentLinks.filter(link => link.id !== linkId);
    updateNodeContent(selectedNode.id, { links: newLinks });
  };

  return (
    <div className={cn(
      "fixed top-0 right-0 h-screen w-full sm:w-[450px] bg-background border-l z-[110] shadow-2xl transition-transform duration-300 ease-in-out transform flex flex-col",
      isDetailPanelOpen ? "translate-x-0" : "translate-x-full"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon-sm" 
            onClick={() => setDetailPanelOpen(false)}
            className="rounded-full"
          >
            <X className="h-5 w-5" />
          </Button>
          <span className="font-bold text-sm uppercase tracking-widest text-muted-foreground">Task Details</span>
        </div>
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon-sm" 
            onClick={() => {
              deleteNode(selectedNode.id);
              setDetailPanelOpen(false);
            }}
            className="text-destructive hover:bg-destructive/10 rounded-full"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
        {/* Title and Status */}
        <div className="p-6 space-y-4">
          <input
            className="text-2xl font-bold bg-transparent border-none p-0 focus:ring-0 w-full outline-none"
            value={selectedNode.data.title}
            onChange={(e) => updateNodeTitle(selectedNode.id, e.target.value)}
            placeholder="Untitled Task"
          />
          
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground font-medium">Status</span>
              <select 
                value={selectedNode.data.status}
                onChange={(e) => updateNodeStatus(selectedNode.id, e.target.value as TaskStatus)}
                className="bg-muted px-2 py-1 rounded-md border-none text-xs font-bold uppercase cursor-pointer"
              >
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
            <div className="h-4 w-[1px] bg-border" />
            <div className="flex items-center gap-2 text-muted-foreground text-xs">
              <Clock className="h-3 w-3" />
              <span>Created {format(selectedNode.data.createdAt || Date.now(), "MMM dd, HH:mm")}</span>
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <div className="flex border-b px-6">
          <TabButton 
            active={activeTab === "notes"} 
            onClick={() => setActiveTab("notes")}
            icon={<FileText className="h-4 w-4" />}
            label="Notes"
          />
          <TabButton 
            active={activeTab === "checklist"} 
            onClick={() => setActiveTab("checklist")}
            icon={<CheckSquare className="h-4 w-4" />}
            label="Checklist"
          />
          <TabButton 
            active={activeTab === "links"} 
            onClick={() => setActiveTab("links")}
            icon={<LinkIcon className="h-4 w-4" />}
            label="Links"
          />
        </div>

        {/* Tab Content */}
        <div className="flex-1 p-6">
          {activeTab === "notes" && (
            <div className="h-full flex flex-col gap-4">
              <textarea
                className="flex-1 min-h-[300px] bg-muted/20 p-4 rounded-xl border border-transparent focus:border-primary/20 focus:bg-background transition-all outline-none resize-none font-sans text-sm leading-relaxed"
                placeholder="Write your notes here (Markdown supported)..."
                value={localNotes}
                onChange={(e) => handleNotesChange(e.target.value)}
              />
              {localNotes && (
                <div className="mt-4 p-4 bg-muted/10 rounded-xl border">
                  <span className="text-[10px] font-bold uppercase text-muted-foreground mb-2 block">Preview</span>
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown>{localNotes}</ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "checklist" && (
            <div className="flex flex-col gap-3">
              {(selectedNode.data.content?.checklist || []).map((item) => (
                <div key={item.id} className="group flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={() => toggleChecklistItem(item.id)}
                    className="h-4 w-4 rounded border-muted-foreground/30 text-primary focus:ring-primary"
                  />
                  <input
                    className={cn(
                      "flex-1 bg-transparent border-none p-0 text-sm focus:ring-0 outline-none",
                      item.completed && "text-muted-foreground line-through"
                    )}
                    value={item.text}
                    onChange={(e) => updateChecklistItem(item.id, e.target.value)}
                    placeholder="List item..."
                  />
                  <Button 
                    variant="ghost" 
                    size="icon-sm" 
                    className="opacity-0 group-hover:opacity-100 h-7 w-7 rounded-full text-muted-foreground hover:text-destructive"
                    onClick={() => deleteChecklistItem(item.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
              <Button 
                variant="ghost" 
                className="w-full justify-start gap-2 text-muted-foreground hover:text-primary mt-2 h-9"
                onClick={addChecklistItem}
              >
                <Plus className="h-4 w-4" />
                Add Item
              </Button>
            </div>
          )}

          {activeTab === "links" && (
            <div className="flex flex-col gap-4">
              {(selectedNode.data.content?.links || []).map((link) => (
                <div key={link.id} className="group flex flex-col gap-2 p-3 bg-muted/30 rounded-xl border border-transparent hover:border-border transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1">
                      <LinkIcon className="h-3 w-3 text-muted-foreground" />
                      <input
                        className="bg-transparent border-none p-0 text-sm font-semibold focus:ring-0 outline-none w-full"
                        value={link.title}
                        onChange={(e) => updateLink(link.id, { title: e.target.value })}
                        placeholder="Link Title"
                      />
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon-sm" 
                      className="opacity-0 group-hover:opacity-100 h-7 w-7 rounded-full text-muted-foreground hover:text-destructive"
                      onClick={() => deleteLink(link.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      className="flex-1 bg-transparent border-none p-0 text-xs text-muted-foreground focus:ring-0 outline-none"
                      value={link.url}
                      onChange={(e) => updateLink(link.id, { url: e.target.value })}
                      placeholder="https://..."
                    />
                    {link.url && (
                      <a 
                        href={link.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary/80"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
              <Button 
                variant="ghost" 
                className="w-full justify-start gap-2 text-muted-foreground hover:text-primary h-9"
                onClick={addLink}
              >
                <Plus className="h-4 w-4" />
                Add Link
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const TabButton = ({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: any; label: string }) => (
  <button 
    onClick={onClick}
    className={cn(
      "flex items-center gap-2 py-4 px-2 border-b-2 transition-all relative cursor-pointer",
      active 
        ? "border-primary text-primary font-bold" 
        : "border-transparent text-muted-foreground hover:text-foreground"
    )}
  >
    {icon}
    <span className="text-xs uppercase tracking-widest">{label}</span>
  </button>
);
