/**
 * 마인드맵 시각화 컴포넌트
 * D3.js를 사용한 Force-directed layout 기반 마인드맵
 */

import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { MindMapNode, ViewMode } from '../../types';
import { getColorByProfitLoss, getNodeSize } from '../../services/portfolioTransform';

interface MindMapViewProps {
  data: MindMapNode;
  viewMode: ViewMode;
  width?: number;
  height?: number;
  onNodeClick?: (node: MindMapNode) => void;
}

export default function MindMapView({
  data,
  viewMode,
  width = 1200,
  height = 800,
  onNodeClick,
}: MindMapViewProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedNode, setSelectedNode] = useState<MindMapNode | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; node: MindMapNode } | null>(null);

  useEffect(() => {
    if (!svgRef.current || !data) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // 전체 노드와 링크를 평면화
    const nodes: MindMapNode[] = [];
    const links: Array<{ source: MindMapNode; target: MindMapNode }> = [];

    function flattenNode(node: MindMapNode, parent?: MindMapNode) {
      nodes.push(node);
      if (parent) {
        links.push({ source: parent, target: node });
      }
      if (node.children) {
        node.children.forEach(child => flattenNode(child, node));
      }
    }

    flattenNode(data);

    // 노드 크기 계산
    const totalValue = data.value || 1;
    nodes.forEach(node => {
      const size = getNodeSize(node, totalValue);
      node.radius = size;
    });

    // Force simulation 설정
    const simulation = d3
      .forceSimulation<MindMapNode>(nodes)
      .force(
        'link',
        d3
          .forceLink<MindMapNode, { source: MindMapNode; target: MindMapNode }>(links)
          .id(d => d.id)
          .distance(d => {
            // 루트 노드와의 거리
            if (d.source.id === 'root' || d.target.id === 'root') {
              return 150;
            }
            // 카테고리와 종목 간 거리
            return 100;
          })
      )
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide<MindMapNode>().radius(d => (d.radius || 20) + 10));

    // 루트 노드를 중앙에 고정
    const rootNode = nodes.find(n => n.id === 'root');
    if (rootNode) {
      rootNode.fx = width / 2;
      rootNode.fy = height / 2;
    }

    // SVG 그룹 생성
    const g = svg.append('g');

    // 줌/팬 기능
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', event => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom as never);

    // 링크 그리기
    const link = g
      .append('g')
      .attr('class', 'links')
      .selectAll<SVGLineElement, { source: MindMapNode; target: MindMapNode }>('line')
      .data(links)
      .enter()
      .append('line')
      .attr('stroke', '#9CA3AF')
      .attr('stroke-width', 2)
      .attr('stroke-opacity', 0.6);

    // 노드 그리기
    const node = g
      .append('g')
      .attr('class', 'nodes')
      .selectAll<SVGGElement, MindMapNode>('g')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', 'node')
      .call(
        d3
          .drag<SVGGElement, MindMapNode>()
          .on('start', dragStarted)
          .on('drag', dragged)
          .on('end', dragEnded)
      )
      .on('click', (event, d) => {
        event.stopPropagation();
        setSelectedNode(d);
        onNodeClick?.(d);
      })
      .on('mouseover', (event, d) => {
        const [x, y] = d3.pointer(event, svgRef.current);
        setTooltip({ x, y, node: d });
      })
      .on('mouseout', () => {
        setTooltip(null);
      });

    // 노드 원 그리기
    node
      .append('circle')
      .attr('r', d => d.radius || 20)
      .attr('fill', d => getColorByProfitLoss(d.profitLossRate))
      .attr('stroke', '#FFFFFF')
      .attr('stroke-width', 2)
      .attr('opacity', d => (selectedNode?.id === d.id ? 1 : 0.8))
      .style('cursor', 'pointer');

    // 노드 텍스트
    node
      .append('text')
      .text(d => {
        if (d.type === 'root') return d.name;
        if (d.type === 'category') return d.name;
        return d.name.length > 8 ? d.name.substring(0, 8) + '...' : d.name;
      })
      .attr('text-anchor', 'middle')
      .attr('dy', d => (d.radius || 20) + 15)
      .attr('font-size', d => {
        if (d.type === 'root') return '14px';
        if (d.type === 'category') return '12px';
        return '10px';
      })
      .attr('font-weight', d => (d.type === 'root' ? 'bold' : 'normal'))
      .attr('fill', '#111827')
      .style('pointer-events', 'none');

    // 시뮬레이션 업데이트
    simulation.on('tick', () => {
      link
        .attr('x1', d => {
          const source = d.source as MindMapNode;
          return source.x || 0;
        })
        .attr('y1', d => {
          const source = d.source as MindMapNode;
          return source.y || 0;
        })
        .attr('x2', d => {
          const target = d.target as MindMapNode;
          return target.x || 0;
        })
        .attr('y2', d => {
          const target = d.target as MindMapNode;
          return target.y || 0;
        });

      node.attr('transform', d => `translate(${d.x || 0},${d.y || 0})`);
    });

    function dragStarted(event: d3.D3DragEvent<SVGGElement, MindMapNode, unknown>) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      const subject = event.subject as MindMapNode;
      subject.fx = subject.x;
      subject.fy = subject.y;
    }

    function dragged(event: d3.D3DragEvent<SVGGElement, MindMapNode, unknown>) {
      const subject = event.subject as MindMapNode;
      subject.fx = event.x;
      subject.fy = event.y;
    }

    function dragEnded(event: d3.D3DragEvent<SVGGElement, MindMapNode, unknown>) {
      if (!event.active) simulation.alphaTarget(0);
      // 드래그 후 자유롭게 이동 가능하도록
      // event.subject.fx = null;
      // event.subject.fy = null;
    }

    // 정리 함수
    return () => {
      simulation.stop();
    };
  }, [data, viewMode, width, height, selectedNode, onNodeClick]);

  return (
    <div className="relative w-full h-full">
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="border border-gray-200 rounded-lg bg-white"
      />
      {tooltip && (
        <div
          className="absolute bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-10 pointer-events-none"
          style={{
            left: tooltip.x + 10,
            top: tooltip.y - 10,
            transform: 'translateY(-100%)',
          }}
        >
          <div className="font-semibold text-sm text-text-primary">{tooltip.node.name}</div>
          {tooltip.node.type === 'stock' && (
            <>
              <div className="text-xs text-text-secondary mt-1">
                가치: {tooltip.node.value.toLocaleString('ko-KR')}원
              </div>
              {tooltip.node.profitLoss !== undefined && (
                <div
                  className={`text-xs mt-1 ${
                    (tooltip.node.profitLossRate || 0) >= 0
                      ? 'text-primary-green'
                      : 'text-primary-red'
                  }`}
                >
                  {tooltip.node.profitLoss >= 0 ? '+' : ''}
                  {tooltip.node.profitLoss.toLocaleString('ko-KR')}원 (
                  {tooltip.node.profitLossRate?.toFixed(2)}%)
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
