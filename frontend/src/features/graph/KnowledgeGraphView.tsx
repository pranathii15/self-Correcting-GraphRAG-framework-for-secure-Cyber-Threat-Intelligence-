import React, { useState } from 'react';
import {
  Share2,
  Search,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Info,
  Shield,
  Layers,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { GraphEvidence } from '../../types/api';

interface GraphNode {
  id: string;
  label: string;
  type: 'Malware' | 'Tool' | 'Platform' | 'Actor' | 'Category';
  x: number;
  y: number;
  description: string;
}

interface GraphLink {
  source: string;
  target: string;
  relation: string;
}

const DEFAULT_NODES: GraphNode[] = [
  { id: 'lockbit', label: 'LockBit', type: 'Malware', x: 400, y: 250, description: 'Core Ransomware-as-a-Service (RaaS) encryptor and operation.' },
  { id: 'stealbit', label: 'StealBit', type: 'Tool', x: 230, y: 160, description: 'Proprietary exfiltration tool paired with LockBit for double extortion.' },
  { id: 'ransomware', label: 'Ransomware', type: 'Category', x: 400, y: 90, description: 'Primary malware category utilizing ChaCha20 + Curve25519 encryption.' },
  { id: 'esxi', label: 'VMware ESXi', type: 'Platform', x: 570, y: 160, description: 'Enterprise hypervisor targeted by LockBit Linux/ESXi variants.' },
  { id: 'linux', label: 'Linux', type: 'Platform', x: 580, y: 350, description: 'Operating system platform targeted for enterprise storage & cloud encryption.' },
  { id: 'affiliates', label: 'Affiliates', type: 'Actor', x: 230, y: 350, description: 'Third-party criminal operators recruited to conduct intrusions and deployments.' },
];

const DEFAULT_LINKS: GraphLink[] = [
  { source: 'lockbit', target: 'stealbit', relation: 'uses' },
  { source: 'lockbit', target: 'ransomware', relation: 'is a' },
  { source: 'lockbit', target: 'esxi', relation: 'targets' },
  { source: 'lockbit', target: 'linux', relation: 'targets' },
  { source: 'lockbit', target: 'affiliates', relation: 'recruits' },
];

interface KnowledgeGraphViewProps {
  liveEvidence?: GraphEvidence[];
  onInvestigateEntity?: (entityName: string) => void;
}

export const KnowledgeGraphView: React.FC<KnowledgeGraphViewProps> = ({
  liveEvidence = [],
  onInvestigateEntity,
}) => {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>('lockbit');

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.15, 2.2));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.15, 0.6));
  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setSelectedNodeId('lockbit');
  };

  const selectedNode = DEFAULT_NODES.find((n) => n.id === selectedNodeId);

  const getNodeColor = (type: GraphNode['type']) => {
    switch (type) {
      case 'Malware':
        return { fill: '#ECEBFF', stroke: '#625FEF', text: '#292C33', dot: '#625FEF' };
      case 'Tool':
        return { fill: '#EAF3FF', stroke: '#3B82F6', text: '#292C33', dot: '#3B82F6' };
      case 'Platform':
        return { fill: '#E8F6EF', stroke: '#3BAA78', text: '#292C33', dot: '#3BAA78' };
      case 'Actor':
        return { fill: '#FFF6DF', stroke: '#D9A441', text: '#292C33', dot: '#D9A441' };
      default:
        return { fill: '#FAFAFC', stroke: '#9A9DA6', text: '#292C33', dot: '#737782' };
    }
  };

  const matchedNodeIds = searchQuery.trim()
    ? DEFAULT_NODES.filter((n) => n.label.toLowerCase().includes(searchQuery.toLowerCase())).map((n) => n.id)
    : [];

  return (
    <div className="flex-1 h-[calc(100vh-3.5rem)] flex flex-col md:flex-row overflow-hidden bg-[#F7F8FA] relative">
      {/* Central Canvas Area */}
      <div className="flex-1 h-full flex flex-col justify-between overflow-hidden relative">
        {/* Top Controls Bar */}
        <div className="p-4 sm:p-5 border-b border-[#E7E8ED] bg-white/70 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 z-10">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-[#292C33]">Knowledge Graph</h2>
              <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-[#FAFAFC] border border-[#E7E8ED] text-[#737782]">
                Illustrative graph
              </span>
            </div>
            <p className="text-xs text-[#737782]">
              Explore relationships between threat entities and operational tooling
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Search entity */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#9A9DA6] absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search entity..."
                className="pl-8 pr-3 py-1.5 bg-[#F7F8FA] border border-[#E7E8ED] rounded-xl text-xs text-[#292C33] placeholder-[#9A9DA6] focus:outline-none focus:border-[#625FEF]/50 transition-colors w-40 sm:w-48"
              />
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center bg-white border border-[#E7E8ED] rounded-xl p-0.5 shadow-2xs">
              <button
                onClick={handleZoomIn}
                className="p-1.5 text-[#737782] hover:text-[#292C33] hover:bg-[#F3F4F7] rounded-lg transition-colors"
                title="Zoom in"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleZoomOut}
                className="p-1.5 text-[#737782] hover:text-[#292C33] hover:bg-[#F3F4F7] rounded-lg transition-colors"
                title="Zoom out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleReset}
                className="p-1.5 text-[#737782] hover:text-[#292C33] hover:bg-[#F3F4F7] rounded-lg transition-colors"
                title="Reset view"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Informational Callout Bar per Section 30 & 52 */}
        <div className="px-5 py-2 bg-[#FAFAFC] border-b border-[#E7E8ED] text-[11px] text-[#737782] flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-[#625FEF]" />
            <span>
              Illustrative graph · Live Neo4j GraphRAG activates during investigations when graph triples are returned by FastAPI backend.
            </span>
          </div>
          <span className="font-mono text-[10px] text-[#9A9DA6]">
            Zoom: {Math.round(zoom * 100)}%
          </span>
        </div>

        {/* SVG Graph Canvas */}
        <div className="flex-1 w-full h-full relative overflow-hidden bg-white select-none">
          {/* Subtle grid background */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.35]"
            style={{
              backgroundImage:
                'radial-gradient(circle, #E7E8ED 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />

          <svg
            className="w-full h-full cursor-grab active:cursor-grabbing"
            viewBox="0 0 800 500"
            preserveAspectRatio="xMidYMid meet"
          >
            <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
              <defs>
                <marker
                  id="arrow"
                  viewBox="0 0 10 10"
                  refX="24"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#D0D3DB" />
                </marker>
              </defs>

              {/* Links */}
              {DEFAULT_LINKS.map((link, idx) => {
                const sourceNode = DEFAULT_NODES.find((n) => n.id === link.source);
                const targetNode = DEFAULT_NODES.find((n) => n.id === link.target);
                if (!sourceNode || !targetNode) return null;

                const midX = (sourceNode.x + targetNode.x) / 2;
                const midY = (sourceNode.y + targetNode.y) / 2;

                return (
                  <g key={idx}>
                    <line
                      x1={sourceNode.x}
                      y1={sourceNode.y}
                      x2={targetNode.x}
                      y2={targetNode.y}
                      stroke="#E7E8ED"
                      strokeWidth="2"
                      markerEnd="url(#arrow)"
                    />
                    {/* Relation label */}
                    <rect
                      x={midX - 28}
                      y={midY - 10}
                      width="56"
                      height="20"
                      rx="4"
                      fill="#FFFFFF"
                      stroke="#E7E8ED"
                    />
                    <text
                      x={midX}
                      y={midY + 3.5}
                      textAnchor="middle"
                      fontSize="9"
                      fill="#737782"
                      fontFamily="Inter, sans-serif"
                    >
                      {link.relation}
                    </text>
                  </g>
                );
              })}

              {/* Nodes */}
              {DEFAULT_NODES.map((node) => {
                const isSelected = selectedNodeId === node.id;
                const isMatched = matchedNodeIds.includes(node.id);
                const style = getNodeColor(node.type);

                return (
                  <g
                    key={node.id}
                    transform={`translate(${node.x}, ${node.y})`}
                    onClick={() => setSelectedNodeId(node.id)}
                    className="cursor-pointer transition-transform duration-150 hover:scale-105"
                  >
                    {/* Halo if selected or matched */}
                    {(isSelected || isMatched) && (
                      <circle
                        r="34"
                        fill="none"
                        stroke="#625FEF"
                        strokeWidth="2"
                        strokeDasharray={isMatched ? '3 3' : 'none'}
                        opacity="0.6"
                      />
                    )}

                    <circle
                      r="26"
                      fill={style.fill}
                      stroke={isSelected ? '#625FEF' : style.stroke}
                      strokeWidth={isSelected ? '2.5' : '1.5'}
                    />

                    {/* Node Dot / Icon */}
                    <circle cx="0" cy="-6" r="4" fill={style.dot} />

                    <text
                      y="10"
                      textAnchor="middle"
                      fontSize="10"
                      fontWeight="600"
                      fill={style.text}
                      fontFamily="Inter, sans-serif"
                    >
                      {node.label}
                    </text>
                  </g>
                );
              })}
            </g>
          </svg>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[#E7E8ED] bg-[#FAFAFC] text-[11px] text-[#9A9DA6] flex items-center justify-between">
          <span>{DEFAULT_NODES.length} threat entities · {DEFAULT_LINKS.length} ontology links</span>
          <span>Click an entity to inspect relationships</span>
        </div>
      </div>

      {/* Right Column: Entity Inspector */}
      <div className="w-full md:w-[320px] lg:w-[360px] h-full border-t md:border-t-0 md:border-l border-[#E7E8ED] bg-white flex flex-col justify-between shrink-0 p-5 overflow-y-auto">
        {selectedNode ? (
          <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#F3F4F7]">
              <span className="text-[11px] font-semibold text-[#737782] uppercase tracking-wider">
                Entity Inspector
              </span>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-[#ECEBFF] text-[#625FEF] border border-[#D9D7FF]">
                {selectedNode.type}
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <h3 className="text-lg font-semibold text-[#292C33]">
                {selectedNode.label}
              </h3>
              <p className="text-xs text-[#737782] leading-relaxed mt-1">
                {selectedNode.description}
              </p>
            </div>

            {/* Related Connections */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold text-[#292C33]">
                Direct Graph Connections
              </span>
              <div className="flex flex-col gap-1.5">
                {DEFAULT_LINKS.filter(
                  (l) => l.source === selectedNode.id || l.target === selectedNode.id
                ).map((l, idx) => {
                  const isSource = l.source === selectedNode.id;
                  const otherNodeId = isSource ? l.target : l.source;
                  const otherNode = DEFAULT_NODES.find((n) => n.id === otherNodeId);

                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedNodeId(otherNodeId)}
                      className="p-2.5 bg-[#FAFAFC] hover:bg-[#F3F4F7] border border-[#E7E8ED] rounded-xl flex items-center justify-between text-xs cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="text-[#9A9DA6]">{isSource ? '→' : '←'}</span>
                        <span className="text-[#625FEF] font-mono text-[11px]">{l.relation}</span>
                        <span className="font-medium text-[#292C33] truncate">{otherNode?.label}</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-[#9A9DA6]" />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Action to investigate */}
            {onInvestigateEntity && (
              <div className="pt-2">
                <button
                  onClick={() => onInvestigateEntity(`What is the threat profile and activity for ${selectedNode.label}?`)}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-[#625FEF] hover:bg-[#524FE0] text-white rounded-xl text-xs font-medium shadow-xs transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Investigate {selectedNode.label}</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center text-[#737782]">
            <Share2 className="w-8 h-8 text-[#D0D3DB] mb-2" />
            <h4 className="text-xs font-semibold text-[#292C33]">No entity selected</h4>
            <p className="text-[11px] text-[#9A9DA6] mt-1 max-w-[200px]">
              Select any node on the graph canvas to inspect relationships.
            </p>
          </div>
        )}

        <div className="pt-4 border-t border-[#F3F4F7] text-[10px] text-[#9A9DA6]">
          Neo4j GraphRAG integration ready
        </div>
      </div>
    </div>
  );
};
