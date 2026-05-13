import React, { useMemo, useState } from "react";
import * as Icons from "lucide-react";
import nodeRegistry from "../../back-end/node-registry";
import { prettifyLabel } from "../lib/utils";
import { Input } from "./ui";
import { CyberAction, CyberListItem, CyberSectionLabel } from "./shared/CyberUI";

type NodeTemplate = {
  label: string;
  type: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  category?: string;
  bundle?: string;
};

const SidebarNodeItem = ({
  node,
  isFavorite,
  showFavoriteAction,
  onAddNode,
  onDragStart,
  onToggleFavorite,
}: {
  node: NodeTemplate;
  isFavorite: boolean;
  showFavoriteAction: boolean;
  onAddNode: (type: string, label: string) => void;
  onDragStart: (event: React.DragEvent, nodeType: string, nodeLabel: string) => void;
  onToggleFavorite: (event: React.MouseEvent<HTMLButtonElement>, type: string) => void;
}) => {
  return (
    <CyberListItem
      draggable
      onDragStart={(event) => onDragStart(event, node.type, node.label)}
      onClick={() => onAddNode(node.type, node.label)}
      accentClassName={isFavorite ? "bg-yellow-500" : "bg-cyber-primary"}
      className={`items-center gap-3 rounded p-1.5 ${
        isFavorite ? "hover:bg-yellow-500/10 active:cursor-grabbing" : "hover:bg-white/5 active:cursor-grabbing"
      } cursor-grab`}
      action={
        showFavoriteAction ? (
          <CyberAction
            icon={Icons.Star}
            showLabel={false}
            colorClass={isFavorite ? "text-yellow-500" : "text-white"}
            className={`h-5 w-5 justify-center border-none bg-transparent group-hover/sidebar:block hidden ${
              isFavorite ? "opacity-100" : "opacity-0 group-hover:opacity-40 hover:!opacity-100 hover:text-yellow-500"
            }`}
            onClick={(event) => onToggleFavorite(event, node.type)}
          />
        ) : undefined
      }
    >
      <div className={`shrink-0 flex h-6 w-6 items-center justify-center ${isFavorite ? "text-yellow-500" : "text-white/40 group-hover:text-cyber-primary transition-colors"}`}>
        <node.icon size={14} />
      </div>
      <span className={`truncate flex-1 group-hover/sidebar:block hidden ${isFavorite ? "text-[10px] font-bold text-gray-200" : "text-[10px] font-medium text-gray-400 group-hover:text-white transition-colors"}`}>
        {node.label}
      </span>
    </CyberListItem>
  );
};

export function Sidebar({
  onAddNode,
}: {
  onAddNode: (type: string, label: string) => void;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem("cyber-node-favorites");
    return saved ? JSON.parse(saved) : [];
  });

  const nodeTemplates: NodeTemplate[] = useMemo(() => {
    return Object.entries(nodeRegistry).map(([type, entry]) => {
      const iconName = entry?.icon || "Star";
      const IconComponent =
        ((Icons as Record<string, unknown>)[iconName] as React.ComponentType<
          Record<string, unknown>
        >) || Icons.Star;
      const label = prettifyLabel(type);
      const category = entry?.category || "";
      return {
        label,
        type,
        icon: IconComponent,
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

  const filteredNodes = useMemo(() => {
    return nodeTemplates.filter((n) => {
      return (
        n.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [nodeTemplates, searchTerm]);

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
    <div className="w-14 hover:w-60 border-r border-cyber-border bg-black/60 backdrop-blur-xl transition-all duration-300 ease-in-out flex flex-col z-10 overflow-hidden group/sidebar">
      <div className="p-3 flex flex-col gap-3 min-w-[240px]">
       

        <div className="group-hover/sidebar:block hidden animate-in fade-in duration-500">
          <Input
            icon={Icons.Search}
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-black/40 border-white/5 text-[10px] h-7"
          />
        </div>

        <div className="space-y-4 overflow-y-auto custom-scrollbar flex-1 -mx-1 px-1 h-full">
          {favoriteNodes.length > 0 && !searchTerm && (
            <div className={`space-y-1.5 ${!searchTerm ? 'block' : 'hidden'}`}>
              <CyberSectionLabel
                label="Favs"
                className="hidden group-hover/sidebar:block border-yellow-500/10 text-yellow-500/80"
              />
              <div className="grid grid-cols-1 gap-1">
                {favoriteNodes.map((node) => (
                  <SidebarNodeItem
                    key={`fav-${node.type}`}
                    node={node}
                    isFavorite
                    showFavoriteAction={false}
                    onAddNode={onAddNode}
                    onDragStart={onDragStart}
                    onToggleFavorite={toggleFavorite}
                  />
                ))}
              </div>
            </div>
          )}

          {groupedNodes.map(([bundle, nodes]) => (
            <div key={bundle} className="space-y-1">
              <CyberSectionLabel
                label={bundle}
                className="hidden group-hover/sidebar:block"
              />
              <div className="grid grid-cols-1 gap-0.5">
                {nodes.map((node) => (
                  <SidebarNodeItem
                    key={node.type}
                    node={node}
                    isFavorite={favorites.includes(node.type)}
                    showFavoriteAction
                    onAddNode={onAddNode}
                    onDragStart={onDragStart}
                    onToggleFavorite={toggleFavorite}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
                    

export default Sidebar;
