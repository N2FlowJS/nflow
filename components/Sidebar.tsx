import React, { useMemo, useState } from "react";
import * as Icons from "lucide-react";
import nodeRegistry from "../node-registry";

type NodeTemplate = {
  label: string;
  type: string;
  icon: any;
  color: string;
  category?: string;
  bundle?: string;
};

const prettifyLabel = (typeName: string) => {
  const withoutComp = typeName.replace(/Component$/, "").replace(/_/g, " ");
  const spaced = withoutComp.replace(/([a-z0-9])([A-Z])/g, "$1 $2");
  return spaced.replace(/\b([a-z])/g, (s) => s.toUpperCase());
};

const CATEGORY_COLOR: Record<string, string> = {
  llm: "text-purple-400",
  tool: "text-amber-500",
  input: "text-green-400",
  output: "text-cyan-400",
  template: "text-slate-400",
  logic: "text-pink-400",
  other: "text-yellow-400",
  agent: "text-cyber-secondary",
};

export function Sidebar({
  onAddNode,
}: {
  onAddNode: (type: string, label: string) => void;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem("cyber-node-favorites");
    return saved ? JSON.parse(saved) : [];
  });

  const nodeTemplates: NodeTemplate[] = useMemo(() => {
    return Object.entries(nodeRegistry).map(([type, entry]) => {
      const iconName = entry?.icon || "Star";
      const IconComponent =
        (Icons as Record<string, unknown>)[iconName] as React.ComponentType<Record<string, unknown>> || Icons.Star;
      const label = prettifyLabel(type);
      const category = entry?.category || "";
      const color = CATEGORY_COLOR[category] || "text-gray-400";
      return {
        label,
        type,
        icon: IconComponent,
        color,
        category,
        bundle: category,
      };
    });
  }, []);

  const toggleFavorite = (e: React.MouseEvent, type: string) => {
    e.stopPropagation();
    const newFavorites = favorites.includes(type)
      ? favorites.filter((f) => f !== type)
      : [...favorites, type];
    setFavorites(newFavorites);
    localStorage.setItem("cyber-node-favorites", JSON.stringify(newFavorites));
  };

  const onDragStart = (
    event: React.DragEvent,
    nodeType: string,
    nodeLabel: string,
  ) => {
    event.dataTransfer.setData(
      "application/reactflow",
      JSON.stringify({ type: nodeType, label: nodeLabel }),
    );
    event.dataTransfer.effectAllowed = "move";
  };

  const categories = ["Core", "Tools", "Logic"];
  const filteredNodes = useMemo(() => {
    return nodeTemplates.filter((n) => {
      const matchesSearch =
        n.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.type.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !activeCategory || n.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [nodeTemplates, searchTerm, activeCategory]);

  const groupedNodes = useMemo(() => {
    return Object.entries(
      filteredNodes.reduce(
        (acc, node) => {
          const bundle = node.bundle || "Others";
          if (!acc[bundle]) acc[bundle] = [] as NodeTemplate[];
          acc[bundle].push(node);
          return acc;
        },
        {} as Record<string, NodeTemplate[]>,
      ),
    ).sort(([bundleA], [bundleB]) => bundleA.localeCompare(bundleB));
  }, [filteredNodes]);

  const favoriteNodes = useMemo(() => {
    return nodeTemplates.filter((n) => favorites.includes(n.type));
  }, [nodeTemplates, favorites]);

  return (
    <div className="w-64 border-r border-cyber-border bg-cyber-panel/50 backdrop-blur-md p-4 flex flex-col gap-4 z-10 overflow-y-auto custom-scrollbar">
      <div>
        <h3 className="text-[10px] font-bold text-cyber-primary uppercase tracking-[0.2em] mb-3">
          Node Library
        </h3>

        <div className="relative mb-3">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icons.Search size={12} className="text-gray-500" />
          </div>
          <input
            type="text"
            className="w-full bg-black/50 border border-white/10 rounded-lg pl-8 pr-3 py-2 text-[11px] text-white focus:border-cyber-primary outline-none transition-colors"
            placeholder="Search nodes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {favoriteNodes.length > 0 && !searchTerm && (
          <div className="mb-6">
            <div className="text-[9px] font-bold text-yellow-500 uppercase tracking-[0.15em] mb-2 px-1 border-b border-yellow-500/20 pb-1 flex items-center gap-2">
              <Icons.Star size={10} fill="currentColor" /> Favorites
            </div>
            <div className="grid grid-cols-1 gap-2">
              {favoriteNodes.map((node) => (
                <div
                  key={`fav-${node.type}`}
                  draggable
                  onDragStart={(e) => onDragStart(e, node.type, node.label)}
                  onClick={() => onAddNode(node.type, node.label)}
                  className="group flex items-center gap-3 p-3 bg-yellow-500/5 border border-yellow-500/10 rounded-xl hover:bg-yellow-500/10 hover:border-yellow-500/20 transition-all text-left cursor-grab active:cursor-grabbing"
                >
                  <div className={`p-2 rounded-lg bg-black/40 ${node.color}`}>
                    <node.icon size={18} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-gray-200">
                      {node.label}
                    </span>
                    <span className="text-[9px] text-gray-500 font-mono uppercase">
                      {node.bundle}
                    </span>
                  </div>
                  <button
                    onClick={(e) => toggleFavorite(e, node.type)}
                    className="ml-auto text-yellow-500 hover:scale-110 transition-transform"
                  >
                    <Icons.Star size={14} fill="currentColor" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {!searchTerm && (
          <div className="flex gap-1 mb-3 flex-wrap">
            <button
              onClick={() => setActiveCategory(null)}
              className={`px-2 py-1 text-[9px] font-bold uppercase rounded-md transition-colors ${
                activeCategory === null
                  ? "bg-cyber-primary text-black"
                  : "bg-white/5 text-gray-400 hover:bg-white/10"
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() =>
                  setActiveCategory(cat === activeCategory ? null : cat)
                }
                className={`px-2 py-1 text-[9px] font-bold uppercase rounded-md transition-colors ${
                  activeCategory === cat
                    ? "bg-cyber-primary text-black"
                    : "bg-white/5 text-gray-400 hover:bg-white/10"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        <div className="flex flex-col gap-6">
          {groupedNodes.map(([bundle, nodes]) => (
            <div key={bundle}>
              <div className="text-[9px] font-bold text-cyber-primary/80 uppercase tracking-[0.15em] mb-2 px-1 border-b border-cyber-primary/20 pb-1">
                {bundle}
              </div>
              <div className="grid grid-cols-1 gap-2">
                {nodes.map((node) => (
                  <div
                    key={node.type}
                    draggable
                    onDragStart={(e) => onDragStart(e, node.type, node.label)}
                    onClick={() => onAddNode(node.type, node.label)}
                    className="group flex items-center gap-3 p-3 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 hover:border-white/20 transition-all text-left cursor-grab active:cursor-grabbing"
                  >
                    <div
                      className={`p-2 rounded-lg bg-black/40 ${node.color} group-hover:scale-110 transition-transform`}
                    >
                      <node.icon size={18} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-gray-200">
                        {node.label}
                      </span>
                      <span className="text-[9px] text-gray-500 font-mono uppercase">
                        {node.bundle || node.category}
                      </span>
                    </div>
                    <button
                      onClick={(e) => toggleFavorite(e, node.type)}
                      className={`ml-auto transition-all ${
                        favorites.includes(node.type)
                          ? "text-yellow-500 hover:scale-110"
                          : "text-gray-500 hover:text-yellow-500 opacity-0 group-hover:opacity-100 hover:scale-110"
                      }`}
                    >
                      <Icons.Star
                        size={14}
                        fill={
                          favorites.includes(node.type)
                            ? "currentColor"
                            : "none"
                        }
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {filteredNodes.length === 0 && (
            <div className="text-center py-4 text-[10px] text-gray-500 italic">
              No nodes found matching "{searchTerm}"
            </div>
          )}
        </div>
      </div>

      <div className="mt-auto p-4 bg-cyber-primary/5 border border-cyber-primary/10 rounded-xl">
        <p className="text-[10px] text-cyber-primary leading-relaxed font-mono">
          DRAG OR CLICK TO ADD NODES · {nodeTemplates.length} AVAILABLE
        </p>
      </div>
    </div>
  );
}

export default Sidebar;
