import React, { useState, useMemo, useRef } from 'react';
import {
  Network,
  ZoomIn,
  ZoomOut,
  Maximize2,
  BookOpen,
  Layers,
  Tag,
  Filter,
  Search,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { ResearchItem, ResearchCategory } from '../types/research';
import { playTactileClick } from '../utils/sound';

interface ResearchMapViewProps {
  papers: ResearchItem[];
  onOpenPaperInReader: (paper: ResearchItem) => void;
  onOpenPaperDetail: (paper: ResearchItem) => void;
}

interface GraphNode {
  id: string;
  type: 'category' | 'paper' | 'tag';
  label: string;
  subLabel?: string;
  x: number;
  y: number;
  radius: number;
  color: string;
  paper?: ResearchItem;
}

interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: 'category-paper' | 'paper-tag';
}

export const ResearchMapView: React.FC<ResearchMapViewProps> = ({
  papers,
  onOpenPaperInReader,
  onOpenPaperDetail,
}) => {
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);

  // Categories present in the dataset
  const uniqueCategories = useMemo(() => {
    const set = new Set<string>();
    papers.forEach((p) => set.add(p.category));
    return Array.from(set);
  }, [papers]);

  // Compute graph nodes and edges
  const { nodes, edges } = useMemo(() => {
    const calculatedNodes: GraphNode[] = [];
    const calculatedEdges: GraphEdge[] = [];

    const width = 1100;
    const height = 750;
    const centerX = width / 2;
    const centerY = height / 2;

    // Filter papers
    const activePapers = papers.filter((p) => {
      const matchCat =
        selectedCategoryFilter === 'ALL' || p.category === selectedCategoryFilter;
      const matchSearch =
        !searchQuery ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });

    // 1. Category Hub Nodes arranged in a circle
    const catPositions: Record<string, { x: number; y: number }> = {};
    const visibleCategories = Array.from(new Set(activePapers.map((p) => p.category)));
    const catAngleStep = (2 * Math.PI) / (visibleCategories.length || 1);
    const catRadius = 240;

    visibleCategories.forEach((cat, index) => {
      const angle = index * catAngleStep - Math.PI / 2;
      const x = centerX + Math.cos(angle) * catRadius;
      const y = centerY + Math.sin(angle) * catRadius;
      catPositions[cat] = { x, y };

      calculatedNodes.push({
        id: `cat-${cat}`,
        type: 'category',
        label: cat,
        x,
        y,
        radius: 26,
        color: '#1F3FB0',
      });
    });

    // 2. Paper Nodes clustered around their category hubs
    const papersPerCategory: Record<string, ResearchItem[]> = {};
    activePapers.forEach((p) => {
      if (!papersPerCategory[p.category]) papersPerCategory[p.category] = [];
      papersPerCategory[p.category].push(p);
    });

    // Color palette for reading status
    const statusColors: Record<string, string> = {
      reading: '#1F3FB0',
      completed: '#2E7D32',
      to_read: '#D97706',
      inbox: '#78716C',
      paused: '#9333EA',
    };

    Object.entries(papersPerCategory).forEach(([cat, catPapers]) => {
      const hub = catPositions[cat] || { x: centerX, y: centerY };
      const paperCount = catPapers.length;
      const pRadius = 120;
      const pAngleStep = (2 * Math.PI) / (paperCount || 1);

      catPapers.forEach((paper, pIdx) => {
        const pAngle = pIdx * pAngleStep;
        // Jitter slightly for organic feel
        const jitterX = Math.sin(pIdx * 3.7) * 15;
        const jitterY = Math.cos(pIdx * 2.3) * 15;
        const px = hub.x + Math.cos(pAngle) * pRadius + jitterX;
        const py = hub.y + Math.sin(pAngle) * pRadius + jitterY;

        const paperNodeId = `paper-${paper.id}`;
        calculatedNodes.push({
          id: paperNodeId,
          type: 'paper',
          label: paper.title,
          subLabel: `${paper.year} • ${paper.readingStatus || 'inbox'}`,
          x: px,
          y: py,
          radius: 14,
          color: statusColors[paper.readingStatus || 'inbox'] || '#141414',
          paper,
        });

        // Edge between category hub and paper
        calculatedEdges.push({
          id: `edge-${cat}-${paper.id}`,
          source: `cat-${cat}`,
          target: paperNodeId,
          type: 'category-paper',
        });
      });
    });

    return { nodes: calculatedNodes, edges: calculatedEdges };
  }, [papers, selectedCategoryFilter, searchQuery]);

  // Handle pan interactions
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPanOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const resetView = () => {
    playTactileClick();
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
    setSelectedNode(null);
  };

  // Connected nodes map for highlighting
  const connectedNodeIds = useMemo(() => {
    const active = hoveredNode || selectedNode;
    if (!active) return new Set<string>();

    const connected = new Set<string>([active.id]);
    edges.forEach((e) => {
      if (e.source === active.id) connected.add(e.target);
      if (e.target === active.id) connected.add(e.source);
    });
    return connected;
  }, [hoveredNode, selectedNode, edges]);

  return (
    <div className="min-h-screen bg-[#EDEBE6] text-[#141414] pb-20 select-none">
      {/* Header bar */}
      <div className="border-b border-[#141414]/10 bg-[#EDEBE6]/90 backdrop-blur-md sticky top-0 z-20 px-8 py-5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs uppercase tracking-widest text-[#1F3FB0] font-medium flex items-center gap-1.5">
                <Network className="w-3.5 h-3.5" />
                CONCEPTUAL TOPOGRAPHY
              </span>
              <span className="text-[#141414]/30 text-xs">/</span>
              <span className="font-mono text-xs uppercase tracking-wider text-[#141414]/50">
                INTERACTIVE CITATION & TOPIC MAP
              </span>
            </div>
            <h1 className="font-serif text-3xl font-light tracking-tight text-[#141414]">
              Research Map
            </h1>
          </div>

          {/* Quick controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#141414]/40 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search node or paper..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-white border border-[#141414]/20 font-sans text-xs text-[#141414] focus:outline-none focus:border-[#1F3FB0] w-48"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-[#141414]/50" />
              <select
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                className="bg-white border border-[#141414]/20 font-mono text-xs px-2.5 py-1.5 text-[#141414] focus:outline-none focus:border-[#1F3FB0] cursor-pointer"
              >
                <option value="ALL">All Categories</option>
                {uniqueCategories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Zoom buttons */}
            <div className="flex items-center border border-[#141414]/20 bg-white">
              <button
                onClick={() => setZoomLevel((z) => Math.min(z + 0.15, 2.2))}
                className="p-1.5 hover:bg-[#141414]/5 text-[#141414]/70 hover:text-[#141414] transition-colors border-r border-[#141414]/10 cursor-pointer"
                title="Zoom in"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setZoomLevel((z) => Math.max(z - 0.15, 0.5))}
                className="p-1.5 hover:bg-[#141414]/5 text-[#141414]/70 hover:text-[#141414] transition-colors border-r border-[#141414]/10 cursor-pointer"
                title="Zoom out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={resetView}
                className="p-1.5 hover:bg-[#141414]/5 text-[#141414]/70 hover:text-[#141414] transition-colors cursor-pointer"
                title="Reset view"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 pt-6">
        {/* Canvas & Sidebar layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Map Canvas Area */}
          <div
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            className={`lg:col-span-8 bg-[#FAF9F5] border border-[#141414]/15 relative overflow-hidden h-[680px] shadow-sm ${
              isDragging ? 'cursor-grabbing' : 'cursor-grab'
            }`}
          >
            {/* Background grid watermark */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none opacity-30"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path
                    d="M 40 0 L 0 0 0 40"
                    fill="none"
                    stroke="#141414"
                    strokeWidth="0.5"
                    strokeOpacity="0.2"
                  />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid-pattern)" />
            </svg>

            {/* Interactive SVG Graph */}
            <svg
              className="w-full h-full"
              viewBox="0 0 1100 750"
              style={{
                transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
                transformOrigin: 'center center',
                transition: isDragging ? 'none' : 'transform 0.15s ease-out',
              }}
            >
              {/* Edges */}
              <g className="edges">
                {edges.map((edge) => {
                  const sourceNode = nodes.find((n) => n.id === edge.source);
                  const targetNode = nodes.find((n) => n.id === edge.target);
                  if (!sourceNode || !targetNode) return null;

                  const isHighlighted =
                    connectedNodeIds.has(edge.source) && connectedNodeIds.has(edge.target);

                  return (
                    <line
                      key={edge.id}
                      x1={sourceNode.x}
                      y1={sourceNode.y}
                      x2={targetNode.x}
                      y2={targetNode.y}
                      stroke={isHighlighted ? '#1F3FB0' : '#141414'}
                      strokeWidth={isHighlighted ? 2 : 0.8}
                      strokeOpacity={isHighlighted ? 0.9 : 0.15}
                      strokeDasharray={edge.type === 'paper-tag' ? '4 3' : undefined}
                    />
                  );
                })}
              </g>

              {/* Nodes */}
              <g className="nodes">
                {nodes.map((node) => {
                  const isHovered = hoveredNode?.id === node.id;
                  const isSelected = selectedNode?.id === node.id;
                  const isConnected = connectedNodeIds.has(node.id);
                  const dim =
                    (hoveredNode || selectedNode) && !isConnected ? 'opacity-30' : 'opacity-100';

                  if (node.type === 'category') {
                    return (
                      <g
                        key={node.id}
                        transform={`translate(${node.x}, ${node.y})`}
                        className={`cursor-pointer transition-opacity ${dim}`}
                        onMouseEnter={() => setHoveredNode(node)}
                        onMouseLeave={() => setHoveredNode(null)}
                        onClick={() => {
                          playTactileClick();
                          setSelectedNode(node);
                        }}
                      >
                        <circle
                          r={node.radius}
                          fill="#FFFFFF"
                          stroke={isHovered || isSelected ? '#1F3FB0' : '#141414'}
                          strokeWidth={isHovered || isSelected ? 3 : 1.5}
                        />
                        <circle r={node.radius - 6} fill="#1F3FB0" fillOpacity="0.12" />
                        <text
                          textAnchor="middle"
                          dy=".3em"
                          fontSize="9"
                          fontFamily="IBM Plex Mono"
                          fontWeight="600"
                          fill="#1F3FB0"
                        >
                          HUB
                        </text>
                        <text
                          textAnchor="middle"
                          y={node.radius + 14}
                          fontSize="10"
                          fontFamily="Inter Tight, sans-serif"
                          fontWeight="600"
                          fill="#141414"
                          letterSpacing="0.04em"
                        >
                          {node.label}
                        </text>
                      </g>
                    );
                  }

                  // Paper node
                  return (
                    <g
                      key={node.id}
                      transform={`translate(${node.x}, ${node.y})`}
                      className={`cursor-pointer transition-opacity ${dim}`}
                      onMouseEnter={() => setHoveredNode(node)}
                      onMouseLeave={() => setHoveredNode(null)}
                      onClick={() => {
                        playTactileClick();
                        setSelectedNode(node);
                      }}
                    >
                      <circle
                        r={node.radius}
                        fill="#FFFFFF"
                        stroke={isHovered || isSelected ? '#1F3FB0' : node.color}
                        strokeWidth={isHovered || isSelected ? 2.5 : 1.5}
                      />
                      <circle r={node.radius - 4} fill={node.color} fillOpacity="0.8" />
                      <text
                        x={node.radius + 6}
                        y={3}
                        fontSize="9.5"
                        fontFamily="Newsreader, serif"
                        fill="#141414"
                        className="select-none"
                        style={{ pointerEvents: 'none' }}
                      >
                        {node.label.length > 28 ? node.label.slice(0, 26) + '...' : node.label}
                      </text>
                    </g>
                  );
                })}
              </g>
            </svg>

            {/* Bottom floating legend */}
            <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm border border-[#141414]/15 px-3 py-2 flex items-center gap-4 text-[10px] font-mono text-[#141414]/70">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#1F3FB0] inline-block" />
                Reading
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#2E7D32] inline-block" />
                Completed
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#D97706] inline-block" />
                To Read
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#78716C] inline-block" />
                Inbox
              </span>
            </div>
          </div>

          {/* Right Inspector Drawer */}
          <div className="lg:col-span-4 space-y-5">
            {selectedNode && selectedNode.paper ? (
              <div className="bg-[#E7E4DC] border border-[#141414]/15 p-6 animate-fadeIn">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-[#1F3FB0] font-semibold">
                    SELECTED NODE • PAPER
                  </span>
                  <span className="font-mono text-xs text-[#141414]/50">
                    {selectedNode.paper.year}
                  </span>
                </div>

                <h3 className="font-serif text-xl font-light text-[#141414] leading-snug mb-3">
                  {selectedNode.paper.title}
                </h3>

                <p className="font-sans text-xs text-[#141414]/60 mb-4 leading-relaxed">
                  {selectedNode.paper.abstract
                    ? selectedNode.paper.abstract.slice(0, 180) + '...'
                    : 'No abstract available.'}
                </p>

                <div className="space-y-2 py-3 border-y border-[#141414]/10 mb-4 font-mono text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#141414]/50">FIELD:</span>
                    <span className="text-[#141414] font-medium">{selectedNode.paper.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#141414]/50">STATUS:</span>
                    <span className="uppercase text-[#1F3FB0] font-semibold">
                      {selectedNode.paper.readingStatus || 'inbox'}
                    </span>
                  </div>
                  {selectedNode.paper.importance && (
                    <div className="flex justify-between">
                      <span className="text-[#141414]/50">IMPORTANCE:</span>
                      <span className="text-[#141414]">★ {selectedNode.paper.importance}/5</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      if (selectedNode.paper) onOpenPaperInReader(selectedNode.paper);
                    }}
                    className="w-full bg-[#141414] text-white hover:bg-[#1F3FB0] transition-colors p-2.5 font-mono text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    Read
                  </button>
                  <button
                    onClick={() => {
                      if (selectedNode.paper) onOpenPaperDetail(selectedNode.paper);
                    }}
                    className="w-full bg-white border border-[#141414]/20 hover:border-[#1F3FB0] text-[#141414] transition-colors p-2.5 font-mono text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Details
                  </button>
                </div>
              </div>
            ) : selectedNode && selectedNode.type === 'category' ? (
              <div className="bg-[#E7E4DC] border border-[#141414]/15 p-6 animate-fadeIn">
                <span className="font-mono text-[10px] uppercase tracking-widest text-[#1F3FB0] font-semibold block mb-2">
                  SELECTED NODE • RESEARCH FIELD
                </span>
                <h3 className="font-serif text-2xl font-light text-[#141414] mb-3">
                  {selectedNode.label}
                </h3>
                <p className="font-sans text-xs text-[#141414]/70 mb-4 leading-relaxed">
                  Central intellectual nexus connecting all empirical studies, literature reviews,
                  and methodological papers published in this research domain.
                </p>
                <div className="font-mono text-xs text-[#141414]/60">
                  Papers clustered:{' '}
                  <span className="font-semibold text-[#141414]">
                    {papers.filter((p) => p.category === selectedNode.label).length}
                  </span>
                </div>
              </div>
            ) : (
              <div className="bg-[#FAF9F5] border border-[#141414]/15 p-6 text-center">
                <Network className="w-8 h-8 text-[#141414]/30 mx-auto mb-3" />
                <h4 className="font-serif text-base text-[#141414] mb-1">
                  Interactive Node Inspector
                </h4>
                <p className="font-sans text-xs text-[#141414]/60 leading-relaxed">
                  Click any paper or category hub in the topography to inspect bibliographic
                  metadata, connections, and quick reading actions.
                </p>
              </div>
            )}

            {/* Topography Stats */}
            <div className="bg-[#E7E4DC] border border-[#141414]/15 p-5">
              <span className="font-mono text-xs uppercase tracking-widest text-[#141414]/60 block mb-3">
                Topological Overview
              </span>
              <div className="space-y-2 font-mono text-xs">
                <div className="flex justify-between py-1 border-b border-[#141414]/10">
                  <span className="text-[#141414]/60">Active Nodes:</span>
                  <span className="font-medium">{nodes.length}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#141414]/10">
                  <span className="text-[#141414]/60">Relational Edges:</span>
                  <span className="font-medium">{edges.length}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#141414]/10">
                  <span className="text-[#141414]/60">Research Hubs:</span>
                  <span className="font-medium">{uniqueCategories.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
