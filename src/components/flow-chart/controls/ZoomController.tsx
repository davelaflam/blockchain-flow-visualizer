import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Node, ReactFlowInstance } from 'reactflow';

import { logDebug, logInfo, logWarn, logError } from '../../../services/logger';
import { ZoomControllerProps } from '../types';

// Helper function to detect if device is iPad or tablet
const isTabletDevice = () => {
  // Check for iPad specifically in the user agent
  const isIPad = navigator.userAgent.match(/iPad/i) !== null;

  // Check for iPad in modern iPadOS that reports as desktop
  const isIPadOS =
    navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1 && !navigator.userAgent.match(/iPhone/i);

  // General tablet detection (imperfect but helpful)
  const isTablet = /Tablet|iPad/i.test(navigator.userAgent) || (window.innerWidth >= 768 && window.innerWidth <= 1366);

  return isIPad || isIPadOS || isTablet;
};

export const ZoomController: React.FC<ZoomControllerProps> = ({ rfInstance, nodes, step, stepHighlightMap }) => {
  const [isZooming, setIsZooming] = useState(false);
  const zoomTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevStepRef = useRef(step);

  // Function to smoothly zoom to active nodes
  const zoomToActiveNodes = useCallback(() => {
    if (!rfInstance || !nodes.length) return;

    // Lock the zooming state to prevent overlapping animations
    setIsZooming(true);

    // Get active nodes from current step
    const currentHighlight = stepHighlightMap[step] || { nodes: [], edges: [] };
    let activeNodeIds = [...currentHighlight.nodes];

    // Also include nodes with isCurrent flag
    nodes.forEach(node => {
      if (node.data?.isCurrent && !activeNodeIds.includes(node.id)) {
        activeNodeIds.push(node.id);
      }
    });

    // If no active nodes, fitView to show entire graph
    if (!activeNodeIds.length) {
      rfInstance.fitView({ padding: 0.2, duration: 800, maxZoom: 1.2 });
      releaseZoomLock();
      return;
    }

    // Get bounding box of active nodes
    const activeNodePositions = [];
    for (const node of nodes) {
      if (activeNodeIds.includes(node.id)) {
        activeNodePositions.push({
          x: node.position.x,
          y: node.position.y,
          width: node.width || 180,
          height: node.height || 60,
        });
      }
    }

    if (!activeNodePositions.length) {
      releaseZoomLock();
      return;
    }

    // Calculate bounding box
    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;
    activeNodePositions.forEach(pos => {
      minX = Math.min(minX, pos.x);
      minY = Math.min(minY, pos.y);
      maxX = Math.max(maxX, pos.x + pos.width);
      maxY = Math.max(maxY, pos.y + pos.height);
    });

    // Calculate center point
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    // Calculate width and height with some padding
    const width = maxX - minX;
    const height = maxY - minY;

    // Get the container dimensions
    const container = document.querySelector('.react-flow');
    const viewportWidth = container?.clientWidth || 1000;
    const viewportHeight = container?.clientHeight || 600;

    // Calculate the ideal zoom level with proper padding
    // Add more padding for multiple nodes to show context
    // Use less padding for iPad/tablets to prevent excessive zooming out
    const isTablet = isTabletDevice();

    // Adjust padding based on device type
    const padding = isTablet
      ? Math.min(0.5, 0.15 + 0.03 * activeNodePositions.length) // Less padding for tablets
      : Math.min(0.8, 0.2 + 0.05 * activeNodePositions.length); // Original padding for desktops

    const paddedWidth = width * (1 + padding);
    const paddedHeight = height * (1 + padding);

    const zoomX = viewportWidth / paddedWidth;
    const zoomY = viewportHeight / paddedHeight;

    // Use the smaller zoom to ensure everything fits
    // Higher minimum zoom for tablets to prevent zooming out too far
    const minZoom = isTablet ? 0.7 : 0.5;
    const maxZoom = isTablet ? 1.5 : 1.2; // Allow slightly more zoom on tablets

    // Calculate zoom with device-specific constraints
    const zoom = Math.max(minZoom, Math.min(zoomX, zoomY, maxZoom));

    // Apply the viewport change with a smooth transition
    rfInstance.setViewport(
      {
        x: viewportWidth / 2 - centerX * zoom,
        y: viewportHeight / 2 - centerY * zoom,
        zoom: zoom,
      },
      { duration: 800 }
    ); // Longer duration = smoother transition

    // Release zoom lock after animation completes
    releaseZoomLock();
  }, [rfInstance, nodes, step, stepHighlightMap]);

  // Helper to release the zoom lock after animation
  const releaseZoomLock = () => {
    if (zoomTimeout.current) clearTimeout(zoomTimeout.current);
    zoomTimeout.current = setTimeout(() => {
      setIsZooming(false);
    }, 850); // Slightly longer than animation duration
  };

  // Initialize the step ref on first render
  useEffect(() => {
    // Set the initial value but don't trigger a zoom yet
    prevStepRef.current = step;
    logDebug('Initial zoom controller step', { step });
  }, [step]); // Added step to dependency array

  // Explicitly watch for step changes to trigger zoom
  useEffect(() => {
    // Skip if no flow instance or first render
    if (!rfInstance) return;

    // Don't trigger on first render (when the previous step is the same as current)
    const isFirstRender = prevStepRef.current === step;
    logDebug('Step changed', { from: prevStepRef.current, to: step, isFirstRender });

    // If it's not the first render, trigger the zoom animation
    if (!isFirstRender) {
      // First update the ref
      prevStepRef.current = step;

      // Add a small delay to allow step highlights to update
      setTimeout(() => {
        logDebug('Triggering zoom for step', { step });
        // Force the zoom to happen regardless of state
        zoomToActiveNodes();
      }, 50); // Very short delay
    } else {
      // For first render, just update the ref
      prevStepRef.current = step;
    }
  }, [step, rfInstance, zoomToActiveNodes]);

  // Perform initial zoom when component mounts
  useEffect(() => {
    if (!rfInstance) return;

    const isTablet = isTabletDevice();

    // Initial view fitting with delay to ensure the flow is rendered
    // Use tablet-specific padding for better initial view
    setTimeout(() => {
      logDebug('Performing initial fit view', { isTablet });
      rfInstance.fitView({
        padding: isTablet ? 0.15 : 0.2, // Less padding for tablets
        duration: 400,
        minZoom: isTablet ? 0.7 : 0.5, // Higher minimum zoom for tablets
        maxZoom: isTablet ? 1.5 : 1.2, // Higher maximum zoom for tablets
      });
    }, 200);
  }, [rfInstance]);

  return null; // This is a logic-only component, no UI
};
