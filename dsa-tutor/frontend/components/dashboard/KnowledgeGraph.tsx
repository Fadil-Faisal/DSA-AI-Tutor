'use client';

import { useMemo, useCallback } from 'react';
import ReactFlow, {
  Node, Edge, Background, Controls, Handle, Position,
  NodeProps, BackgroundVariant,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { motion } from 'framer-motion';
import { getConfidenceColor, topicLabel } from '@/lib/utils';
import { Confidence, DSATopic } from '@/types/learner';
import dagre from '@dagrejs/dagre';

// ─── Layout helper ────────────────────────────────────────────────────────
const NODE_W = 120;
const NODE_H = 56;

function getLayouted(nodes: Node[], edges: Edge[]) {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: 'TB', ranksep: 60, nodesep: 40 });
  nodes.forEach((n) => g.setNode(n.id, { width: NODE_W, height: NODE_H }));
  edges.forEach((e) => g.setEdge(e.source, e.target));
  dagre.layout(g);
  return {
    nodes: nodes.map((n) => {
      const pos = g.node(n.id);
      return { ...n, position: { x: pos.x - NODE_W / 2, y: pos.y - NODE_H / 2 } };
    }),
    edges,
  };
}

// ─── Custom Topic Node ────────────────────────────────────────────────────
function TopicNode({ data }: NodeProps) {
  const { label, confidence } = data as { label: string; confidence: number };
  const color = getConfidenceColor(confidence);
  const pct = Math.round(confidence * 100);

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, type: 'spring' }}
      className="rounded-xl border px-3 py-2 text-center cursor-default select-none"
      style={{
        width: NODE_W,
        height: NODE_H,
        borderColor: `${color}50`,
        background: `${color}12`,
        boxShadow: `0 0 16px ${color}25`,
      }}
      title={`${label}: ${pct}%`}
    >
      <Handle type="target" position={Position.Top} style={{ background: color, border: 'none', width: 6, height: 6 }} />
      <div className="text-[11px] font-semibold truncate" style={{ color: '#f8fafc' }}>
        {label}
      </div>
      <div className="text-[10px] font-bold mt-0.5" style={{ color }}>
        {pct}%
      </div>
      <div className="mt-1 h-1 rounded-full bg-[rgba(255,255,255,0.08)] overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
      </div>
      <Handle type="source" position={Position.Bottom} style={{ background: color, border: 'none', width: 6, height: 6 }} />
    </motion.div>
  );
}

const nodeTypes = { topicNode: TopicNode };

// ─── Raw graph structure ──────────────────────────────────────────────────
const RAW_EDGES: [DSATopic, DSATopic][] = [
  ['arrays', 'sorting'], ['arrays', 'searching'], ['arrays', 'strings'],
  ['arrays', 'linked_lists'], ['linked_lists', 'trees'], ['trees', 'graphs'],
  ['trees', 'heaps'], ['arrays', 'dp'], ['recursion', 'dp'], ['recursion', 'trees'],
];

interface KnowledgeGraphProps {
  confidence: Confidence;
}

export function KnowledgeGraph({ confidence }: KnowledgeGraphProps) {
  const { nodes, edges } = useMemo(() => {
    const rawNodes: Node[] = (Object.keys(confidence) as DSATopic[]).map((topic) => ({
      id: topic,
      type: 'topicNode',
      position: { x: 0, y: 0 },
      data: { label: topicLabel(topic), confidence: confidence[topic] },
    }));

    const rawEdges: Edge[] = RAW_EDGES.map(([src, tgt]) => ({
      id: `${src}-${tgt}`,
      source: src,
      target: tgt,
      style: { stroke: 'rgba(148,163,184,0.15)', strokeWidth: 1.5 },
      animated: false,
    }));

    return getLayouted(rawNodes, rawEdges);
  }, [confidence]);

  return (
    <div className="w-full h-[420px] rounded-2xl overflow-hidden border border-[rgba(148,163,184,0.08)] bg-[rgba(6,14,30,0.6)]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        zoomOnScroll={false}
        panOnScroll={false}
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="rgba(148,163,184,0.06)" />
        <Controls showInteractive={false} style={{ background: 'rgba(6,14,30,0.8)', border: '1px solid rgba(148,163,184,0.1)', borderRadius: 8 }} />
      </ReactFlow>
    </div>
  );
}
