"use client";

import { Clock, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useReactFlow } from "reactflow";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useTaskStore } from "@/stores/useTaskStore";

export const SearchPalette = () => {
  const { 
    isSearchOpen: isOpen, 
    setSearchOpen: setIsOpen, 
    nodes, 
    selectNode,
    recentNodeIds
  } = useTaskStore();
  const [query, setQuery] = useState("");
  const { setCenter } = useReactFlow();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(!isOpen);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, setIsOpen]);

  const filteredNodes = nodes
    .filter((node) => 
      node.data.title.toLowerCase().includes(query.toLowerCase()) && 
      node.data.title.trim() !== ""
    )
    .slice(0, 8);

  const recentNodes = nodes
    .filter((n) => recentNodeIds.includes(n.id))
    .sort((a, b) => recentNodeIds.indexOf(a.id) - recentNodeIds.indexOf(b.id));

  const handleSelect = (nodeId: string) => {
    const node = nodes.find((n) => n.id === nodeId);
    if (node) {
      selectNode(nodeId);
      setCenter(node.position.x, node.position.y, { duration: 600, zoom: 1.2 });
      setIsOpen(false);
      setQuery("");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px] p-0 gap-0 overflow-hidden border-none shadow-2xl bg-popover text-popover-foreground">
        <DialogHeader className="p-4 border-b bg-muted/30">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search nodes..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="border-none focus-visible:ring-0 bg-transparent h-8 p-0"
              autoFocus
            />
          </div>
        </DialogHeader>
        <div className="max-h-[400px] overflow-y-auto p-2">
          {query === "" && recentNodes.length > 0 && (
            <div className="mb-4">
              <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Clock className="h-3 w-3" />
                Recent
              </div>
              {recentNodes.map((node) => (
                <button
                  key={`recent-${node.id}`}
                  type="button"
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors flex items-center justify-between group"
                  onClick={() => handleSelect(node.id)}
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">
                      {node.data.title}
                    </span>
                    <span className="text-[10px] text-muted-foreground capitalize">
                      {node.data.type || "node"}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {filteredNodes.length > 0 ? (
            <>
              {query !== "" && (
                <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                  Results
                </div>
              )}
              {filteredNodes.map((node) => (
                <button
                  key={node.id}
                  type="button"
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors flex items-center justify-between group"
                  onClick={() => handleSelect(node.id)}
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">
                      {node.data.title}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {node.data.type || "node"} • {node.id.slice(0, 8)}
                    </span>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <kbd className="px-1.5 py-0.5 rounded border bg-muted text-[10px] font-mono">
                      ↵
                    </kbd>
                  </div>
                </button>
              ))}
            </>
          ) : query !== "" && (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No results found
            </div>
          )}

          {query === "" && recentNodes.length === 0 && (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Start typing to search...
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
