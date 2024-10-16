import React, { useState, useEffect, useRef, useMemo } from 'react';

const NetworkDiagram = ({ width = 1000, height = 1000 }) => {
  const [nodes, setNodes] = useState([
    { id: 'C0', name: 'Mission', color: 'red', x: width / 2, y: height / 2 },
    { id: 'C1', name: 'Convenience', color: 'red', x: width / 3, y: height / 3 },
    { id: 'C2', name: 'Decision Making', color: 'red', x: (2 * width) / 3, y: height / 3 },
    { id: 'C3', name: 'Prescribing', color: 'red', x: width / 4, y: (3 * height) / 4 },
    { id: 'C4', name: 'Patient Journey', color: 'red', x: (3 * width) / 4, y: (3 * height) / 4 },
    { id: 'C5', name: 'MCI Assessment', color: 'red', x: (2 * width) / 5, y: (4 * height) / 5 },
    { id: 'C6', name: 'Roundtable', color: 'red', x: (3 * width) / 5, y: (4 * height) / 5 },
    { id: 'C7', name: 'Evaluation Timeline', color: 'red', x: width / 10, y: (2 * height) / 5 },
    { id: 'C8', name: 'HCP and Patient Care', color: 'red', x: (9 * width) / 10, y: (2 * height) / 5 },
    { id: 'C9', name: 'Observation and Learning', color: 'red', x: width / 2, y: height / 10 },
    { id: 'system', name: 'System', color: 'blue', x: (9 * width) / 20, y: (9 * height) / 20 },
    { id: 'health', name: 'Health', color: 'blue', x: (11 * width) / 20, y: (9 * height) / 20 },
    { id: 'protocol', name: 'Protocol', color: 'blue', x: (21 * width) / 40, y: (11 * height) / 20 },
    { id: 'methodist', name: 'Methodist', color: 'blue', x: (19 * width) / 40, y: (11 * height) / 20 },
    { id: 'support', name: 'Support', color: 'blue', x: (9 * width) / 20, y: (21 * height) / 40 },
    { id: 'safety', name: 'Safety', color: 'blue', x: width / 4, y: height / 4 },
    { id: 'kisunla', name: 'Kisunla', color: 'blue', x: (7 * width) / 20, y: height / 4 },
    { id: 'patient', name: 'Patient', color: 'blue', x: (7 * width) / 20, y: (7 * height) / 20 },
    { id: 'leqembi', name: 'Leqembi', color: 'blue', x: width / 4, y: (7 * height) / 20 },
    { id: 'travel', name: 'Travel', color: 'blue', x: (13 * width) / 20, y: height / 4 },
    { id: 'efficacy', name: 'Efficacy', color: 'blue', x: (3 * width) / 4, y: height / 4 },
    { id: 'convenience', name: 'Convenience', color: 'blue', x: (3 * width) / 4, y: (7 * height) / 20 },
    { id: 'hcp', name: 'HCP', color: 'blue', x: (13 * width) / 20, y: (7 * height) / 20 },
    { id: 'risk', name: 'Risk', color: 'blue', x: (3 * width) / 20, y: (11 * height) / 20 },
    { id: 'therapy', name: 'Therapy', color: 'blue', x: width / 4, y: (11 * height) / 20 },
    { id: 'pcp', name: 'PCP', color: 'blue', x: (3 * width) / 4, y: (11 * height) / 20 },
    { id: 'ad', name: 'AD', color: 'blue', x: (17 * width) / 20, y: (11 * height) / 20 },
    { id: 'mci', name: 'MCI', color: 'blue', x: (7 * width) / 20, y: (3 * height) / 4 },
    { id: 'tool', name: 'Tool', color: 'blue', x: (9 * width) / 20, y: (3 * height) / 4 },
    { id: 'assessment', name: 'Assessment', color: 'blue', x: (7 * width) / 20, y: (17 * height) / 20 },
    { id: 'kol', name: 'KOL', color: 'blue', x: (11 * width) / 20, y: (3 * height) / 4 },
    { id: 'perspective', name: 'Perspective', color: 'blue', x: (13 * width) / 20, y: (3 * height) / 4 },
    { id: 'kpis', name: 'KPIs', color: 'blue', x: (13 * width) / 20, y: (17 * height) / 20 },
    { id: 'testing', name: 'Testing', color: 'blue', x: width / 20, y: (7 * height) / 20 },
    { id: 'evaluation', name: 'Evaluation', color: 'blue', x: (3 * width) / 20, y: (7 * height) / 20 },
    { id: 'hcps', name: 'HCPs', color: 'blue', x: (17 * width) / 20, y: (7 * height) / 20 },
    { id: 'coverage', name: 'Coverage', color: 'blue', x: (19 * width) / 20, y: (7 * height) / 20 },
    { id: 'learning', name: 'Learning', color: 'blue', x: (9 * width) / 20, y: width / 20 },
    { id: 'engagement', name: 'Engagement', color: 'blue', x: (11 * width) / 20, y: width / 20 },
    { id: 'rtlls', name: 'RTLLs', color: 'blue', x: width / 2, y: (3 * height) / 20 },
  ]);

  const links = [
    { source: 'C0', target: 'system' },
    { source: 'C0', target: 'health' },
    { source: 'C0', target: 'protocol' },
    { source: 'C0', target: 'methodist' },
    { source: 'C0', target: 'support' },
    { source: 'C1', target: 'safety' },
    { source: 'C1', target: 'kisunla' },
    { source: 'C1', target: 'patient' },
    { source: 'C1', target: 'leqembi' },
    { source: 'C2', target: 'travel' },
    { source: 'C2', target: 'efficacy' },
    { source: 'C2', target: 'convenience' },
    { source: 'C2', target: 'hcp' },
    { source: 'C3', target: 'risk' },
    { source: 'C3', target: 'therapy' },
    { source: 'C3', target: 'patient' },
    { source: 'C3', target: 'protocol' },
    { source: 'C4', target: 'patient' },
    { source: 'C4', target: 'pcp' },
    { source: 'C4', target: 'ad' },
    { source: 'C4', target: 'leqembi' },
    { source: 'C5', target: 'mci' },
    { source: 'C5', target: 'patient' },
    { source: 'C5', target: 'tool' },
    { source: 'C5', target: 'assessment' },
    { source: 'C5', target: 'leqembi' },
    { source: 'C6', target: 'kol' },
    { source: 'C6', target: 'leqembi' },
    { source: 'C6', target: 'perspective' },
    { source: 'C6', target: 'kpis' },
    { source: 'C7', target: 'testing' },
    { source: 'C7', target: 'pcp' },
    { source: 'C7', target: 'evaluation' },
    { source: 'C7', target: 'leqembi' },
    { source: 'C8', target: 'hcps' },
    { source: 'C8', target: 'patient' },
    { source: 'C8', target: 'leqembi' },
    { source: 'C8', target: 'coverage' },
    { source: 'C9', target: 'learning' },
    { source: 'C9', target: 'engagement' },
    { source: 'C9', target: 'rtlls' },
    { source: 'C0', target: 'C1' },
    { source: 'C0', target: 'C2' },
    { source: 'C1', target: 'C2' },
    { source: 'C0', target: 'C3' },
    { source: 'C1', target: 'C3' },
    { source: 'C1', target: 'C4' },
    { source: 'C1', target: 'C5' },
    { source: 'C4', target: 'C5' },
    { source: 'C1', target: 'C6' },
    { source: 'C5', target: 'C6' },
    { source: 'C4', target: 'C7' },
    { source: 'C5', target: 'C8' },
    { source: 'C6', target: 'C8' },
  ];

  const [isDragging, setIsDragging] = useState(false);
  const [draggedNode, setDraggedNode] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);

  // Compute connected node IDs for the selected node
  const connectedNodeIds = useMemo(() => {
    if (!selectedNode) return new Set();

    const connectedIds = new Set();
    connectedIds.add(selectedNode);

    links.forEach(link => {
      if (link.source === selectedNode) {
        connectedIds.add(link.target);
      }
      if (link.target === selectedNode) {
        connectedIds.add(link.source);
      }
    });

    return connectedIds;
  }, [selectedNode, links]);

  useEffect(() => {
    const interval = setInterval(() => {
      setNodes(prevNodes => {
        return prevNodes.map(node => {
          // Skip updating the position of the dragged node
          if (draggedNode && node.id === draggedNode.id) {
            return node;
          }

          let fx = 0,
            fy = 0;

          // Attractive forces from connected edges
          links.forEach(link => {
            if (link.source === node.id || link.target === node.id) {
              const other = prevNodes.find(
                n =>
                  n.id ===
                  (link.source === node.id ? link.target : link.source)
              );
              const dx = other.x - node.x;
              const dy = other.y - node.y;
              const distance = Math.sqrt(dx * dx + dy * dy) + 0.01; // Prevent division by zero
              const force = (distance - 200) * 0.01; // Adjust desired link length
              fx += (dx / distance) * force;
              fy += (dy / distance) * force;
            }
          });

          // Repulsive forces from other nodes
          prevNodes.forEach(otherNode => {
            if (otherNode.id !== node.id) {
              const dx = node.x - otherNode.x;
              const dy = node.y - otherNode.y;
              const distance = Math.sqrt(dx * dx + dy * dy) + 0.01; // Prevent division by zero
              const repulsiveForce = 5000 / (distance * distance); // Adjust strength
              fx += (dx / distance) * repulsiveForce;
              fy += (dy / distance) * repulsiveForce;
            }
          });

          // Centering force
          fx += (width / 2 - node.x) * 0.001;
          fy += (height / 2 - node.y) * 0.001;

          // Limit maximum movement per iteration
          const maxDisplacement = 10;
          const dx = Math.max(-maxDisplacement, Math.min(fx, maxDisplacement));
          const dy = Math.max(-maxDisplacement, Math.min(fy, maxDisplacement));

          // Clamp positions to stay within the viewport
          const newX = Math.max(0, Math.min(width, node.x + dx));
          const newY = Math.max(0, Math.min(height, node.y + dy));

          return {
            ...node,
            x: newX,
            y: newY,
          };
        });
      });
    }, 50);

    return () => clearInterval(interval);
  }, [width, height, links, draggedNode]);

  const handleMouseDown = (event, node) => {
    setIsDragging(true);
    setDraggedNode(node);
  };

  const handleMouseMove = event => {
    if (isDragging && draggedNode) {
      const svg = event.target.closest('svg');
      const pt = svg.createSVGPoint();
      pt.x = event.clientX;
      pt.y = event.clientY;
      const svgP = pt.matrixTransform(svg.getScreenCTM().inverse());

      setNodes(prevNodes =>
        prevNodes.map(node =>
          node.id === draggedNode.id
            ? { ...node, x: svgP.x, y: svgP.y }
            : node
        )
      );
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDraggedNode(null);
  };

  const handleNodeClick = (event, node) => {
    event.stopPropagation();
    setSelectedNode(prevSelected =>
      prevSelected === node.id ? null : node.id
    );
  };

  const handleBackgroundClick = () => {
    setSelectedNode(null);
  };

  return (
    <div className="w-screen h-screen bg-white">
      <svg
        width={width}
        height={height}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleBackgroundClick}
      >
        {links.map((link, index) => {
          const source = nodes.find(node => node.id === link.source);
          const target = nodes.find(node => node.id === link.target);

          let strokeColor = 'black';
          let opacity = 1;

          if (selectedNode) {
            if (
              link.source === selectedNode ||
              link.target === selectedNode
            ) {
              strokeColor = 'black';
              opacity = 1;
            } else {
              strokeColor = 'lightgrey';
              opacity = 0.2;
            }
          }

          return (
            <line
              key={index}
              x1={source.x}
              y1={source.y}
              x2={target.x}
              y2={target.y}
              stroke={strokeColor}
              strokeWidth="1"
              opacity={opacity}
            />
          );
        })}
        {nodes.map(node => {
          let fillColor = node.color;
          let opacity = 0.8;

          if (selectedNode) {
            if (connectedNodeIds.has(node.id)) {
              fillColor = node.color;
              opacity = 0.8;
            } else {
              fillColor = 'lightgrey';
              opacity = 0.2;
            }
          }

          return (
            <g
              key={node.id}
              transform={`translate(${node.x},${node.y})`}
              onMouseDown={event => handleMouseDown(event, node)}
              onClick={event => handleNodeClick(event, node)}
            >
              <circle r="20" fill={fillColor} opacity={opacity} />
              <text
                y="30"
                textAnchor="middle"
                fill="black"
                fontSize="10"
                opacity={opacity}
              >
                {node.name}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};


export default NetworkDiagram;