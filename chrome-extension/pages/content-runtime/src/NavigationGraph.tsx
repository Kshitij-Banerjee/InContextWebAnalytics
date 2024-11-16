import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
interface NavigationStat {
  destination_page_id: number;
  transition_count: number;
  avg_time_between_pages: number;
  destination_url: string;
}
// Extend SimulationNodeDatum to include custom properties
interface CustomNode extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  value?: number; // Make this optional if not all nodes have it
}
export const NavigationGraph: React.FC<{ stats: NavigationStat[] }> = ({ stats }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!stats || !svgRef.current) return;

    // Set dimensions
    const width = 600;
    const height = 400;

    // Clear the SVG
    d3.select(svgRef.current).selectAll('*').remove();

    // Prepare nodes with explicit typing
    const nodes: CustomNode[] = [
      { id: 'current', name: 'Current Page' },
      ...stats.map(stat => ({
        id: stat.destination_url,
        name: stat.destination_url,
        value: stat.transition_count,
      })),
    ];
    const links = stats.map(stat => ({
      source: 'current',
      target: stat.destination_url,
      value: stat.transition_count,
    }));
    // Create the simulation
    const simulation = d3
      .forceSimulation<CustomNode>(nodes) // Pass nodes with the correct type
      .force(
        'link',
        d3
          .forceLink<CustomNode, any>(links)
          .id(d => d.id)
          .distance(150),
      )
      .force('charge', d3.forceManyBody().strength(-200))
      .force('center', d3.forceCenter(width / 2, height / 2));

    // Create the SVG
    const svg = d3.select(svgRef.current).attr('viewBox', `0 0 ${width} ${height}`).style('background', '#f5f5f5');

    // Add links
    const link = svg
      .append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', d => Math.sqrt(d.value));

    // Add nodes
    const node = svg
      .append('g')
      .selectAll<SVGCircleElement, any>('circle') // Explicitly type the selection as SVGCircleElement
      .data(nodes)
      .join('circle')
      .attr('r', d => (d.id === 'current' ? 10 : 5)) // Circle radius
      .attr('fill', d => (d.id === 'current' ? '#007bff' : '#8884d8')) // Fill color
      .on('click', (event: MouseEvent, d: CustomNode) => {
        if (d.id !== 'current') {
          if (window.navigator && 'navigate' in window.navigator) {
            // Use the Navigator API if available
            (window.navigator as any).navigate(d.id).catch((err: unknown) => {
              console.error('Navigation failed:', err);
            });
          } else {
            // Fallback: Use history API for older browsers
            window.history.pushState({}, '', d.id);

            // Simulate a route change
            const event = new Event('popstate');
            window.dispatchEvent(event);
          }
        }
      })
      .call(
        d3
          .drag<SVGCircleElement, any>() // Apply drag behavior to SVGCircleElement
          .on('start', (event: d3.D3DragEvent<SVGCircleElement, any, any>, d: any) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on('drag', (event: d3.D3DragEvent<SVGCircleElement, any, any>, d: any) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on('end', (event: d3.D3DragEvent<SVGCircleElement, any, any>, d: any) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          }),
      );
    // Add labels
    const label = svg
      .append('g')
      .attr('class', 'labels')
      .selectAll('text')
      .data(nodes)
      .join('text')
      .text(d => (d.id === 'current' ? 'Current Page' : d.name))
      .attr('font-size', '10px')
      .attr('dx', 8)
      .attr('dy', '.35em');

    // Tick function
    simulation.nodes(nodes).on('tick', () => {
      link
        .attr('x1', d => (d.source as any).x)
        .attr('y1', d => (d.source as any).y)
        .attr('x2', d => (d.target as any).x)
        .attr('y2', d => (d.target as any).y);

      node.attr('cx', d => d.x!).attr('cy', d => d.y!);

      label.attr('x', d => d.x!).attr('y', d => d.y!);
    });

    simulation.force<d3.ForceLink<any, any>>('link')!.links(links);

    // Drag functions
    function dragStarted(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: any, d: any) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragEnded(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }
  }, [stats]);

  return <svg ref={svgRef} style={{ width: '100%', height: '100%' }} />;
};
