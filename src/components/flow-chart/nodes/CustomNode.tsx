import { Tooltip as MuiTooltip, Box, Typography } from '@mui/material';
import React, { useEffect, useRef } from 'react';
import { Handle, Position } from 'reactflow';

import { logInfo } from '../../../services/logger';
import { nodeTypeColors, getStatusColor, uiColors } from '../../../theme/colors';
import { CustomNodeProps, handlePositions } from '../types';
import {
  getEventTypeIcon,
  getEventTypeDescription,
  formatStatus,
  getStatusDescription,
  hexToRgb,
} from '../utils/helpers';

/**
 * Custom node component for flow chart
 */
const CustomNode: React.FC<CustomNodeProps> = ({ id, data, selected, nodeHandles }) => {
  // Debug log
  useEffect(() => {
    logInfo(`[DEBUG] Node ${id} status: ${data.status} isCurrent: ${data.isCurrent}`);
  }, [id, data.status, data.isCurrent]);

  const nodeRef = useRef<HTMLDivElement>(null);
  const nodeColor =
    data.type && data.type in nodeTypeColors ? nodeTypeColors[data.type as keyof typeof nodeTypeColors] : '#3b82f6';
  const eventType = data.eventType as 'contract' | 'ao' | 'relayer' | undefined;

  // Get status based on current step or fallback to node's status
  const status = data.status || 'NEW';
  const isCurrent = data.isCurrent || false;

  // Debug log for status changes
  useEffect(() => {
    if (status) {
      logInfo(`[DEBUG] Node ${id} status updated to: ${status} (color: ${getStatusColor(status)})`);
    }
  }, [id, status]);

  const eventIcon = getEventTypeIcon(eventType);
  const statusColor = getStatusColor(status);

  const nodeColorRgb = hexToRgb(nodeColor);
  const handles = nodeHandles[id] || {};

  // Node tooltip content
  const nodeTooltipContent = (
    <Box
      sx={{
        p: 1,
        maxWidth: 250,
        backgroundColor: isCurrent ? `rgba(${nodeColorRgb}, 0.25)` : undefined,
        border: isCurrent ? `1px solid rgba(${nodeColorRgb}, 0.5)` : undefined,
        borderRadius: '6px',
      }}
    >
      <Typography
        variant="subtitle2"
        sx={{
          fontWeight: 600,
          mb: 0.5,
          color: isCurrent ? nodeColor : undefined,
        }}
      >
        {data.label}
      </Typography>
      {data.type && (
        <Typography variant="body2" sx={{ mb: 0.5 }}>
          <Box component="span" sx={{ opacity: 0.7 }}>
            Type:
          </Box>{' '}
          {data.type.charAt(0).toUpperCase() + data.type.slice(1)}
        </Typography>
      )}
      {status && (
        <Typography variant="body2" sx={{ mb: 0.5 }}>
          <Box component="span" sx={{ opacity: 0.7 }}>
            Status:
          </Box>{' '}
          {formatStatus(status)}
        </Typography>
      )}
      {status && (
        <Typography variant="body2" sx={{ mb: 0.5, fontSize: '0.9em', opacity: 0.9 }}>
          {getStatusDescription(status, data.statusTooltips)}
        </Typography>
      )}
      {data.timestamp && (
        <Typography variant="body2" sx={{ mb: 0.5 }}>
          <Box component="span" sx={{ opacity: 0.7 }}>
            Time:
          </Box>{' '}
          {new Date(data.timestamp).toLocaleTimeString()}
        </Typography>
      )}
      {data.tooltip && (
        <Typography
          variant="body2"
          sx={{ mt: 1, fontSize: '0.9em', borderTop: '1px solid rgba(255,255,255,0.2)', pt: 1 }}
        >
          {data.tooltip}
        </Typography>
      )}
      {data.apiEndpoints && data.apiEndpoints.length > 0 && (
        <Box sx={{ mt: 1, pt: 1, borderTop: '1px solid rgba(255,255,255,0.2)' }}>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5, fontSize: '0.9em' }}>
            API Endpoints:
          </Typography>
          {data.apiEndpoints.map((endpoint, index) => (
            <Typography key={index} variant="body2" sx={{ fontSize: '0.85em', ml: 1 }}>
              • {endpoint}
            </Typography>
          ))}
        </Box>
      )}
      {data.processFlow && (
        <Box sx={{ mt: 1, pt: 1, borderTop: data.apiEndpoints ? 'none' : '1px solid rgba(255,255,255,0.2)' }}>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5, fontSize: '0.9em' }}>
            Process Flow:
          </Typography>
          <Typography variant="body2" sx={{ fontSize: '0.85em', ml: 1 }}>
            {data.processFlow}
          </Typography>
        </Box>
      )}
      {data.txHash && (
        <Typography
          variant="body2"
          sx={{ fontFamily: 'monospace', fontSize: 12, wordBreak: 'break-all', mt: 1, opacity: 0.8 }}
        >
          <Box component="span" sx={{ opacity: 0.7 }}>
            TX:
          </Box>{' '}
          {data.txHash}
        </Typography>
      )}
    </Box>
  );

  // Event type icon tooltip content
  const iconTooltipContent = eventType ? (
    <Box sx={{ p: 1, maxWidth: 200 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
        {eventType.replace('-', ' ').toUpperCase()}
      </Typography>
      <Typography variant="body2">{getEventTypeDescription(eventType)}</Typography>
    </Box>
  ) : null;

  // Status tooltip content with dynamic styling based on node status
  const statusTooltipContent = (
    <Box
      sx={{
        p: 1.25,
        maxWidth: 250,
        backgroundColor: isCurrent ? `rgba(${nodeColorRgb}, 0.25)` : undefined,
        border: isCurrent ? `1px solid rgba(${nodeColorRgb}, 0.5)` : undefined,
        borderRadius: '6px',
      }}
    >
      <Typography
        variant="subtitle1"
        sx={{
          fontWeight: 700,
          mb: 0.75,
          color: statusColor,
          fontSize: '1.1em',
          textShadow: isCurrent ? '0 1px 2px rgba(0,0,0,0.3)' : 'none',
        }}
      >
        Status: {formatStatus(status)}
      </Typography>
      <Typography variant="body2" sx={{ mb: 1, lineHeight: 1.4 }}>
        {getStatusDescription(status, data.statusTooltips)}
      </Typography>
      {data.timestamp && (
        <Typography variant="body2" sx={{ mt: 1, fontSize: '0.85em', opacity: 0.8 }}>
          {new Date(data.timestamp).toLocaleString()}
        </Typography>
      )}
    </Box>
  );

  return (
    <div
      ref={nodeRef}
      className={`react-flow__node-default ${isCurrent ? 'active-node' : ''}`}
      style={{
        // TypeScript-friendly way to set CSS variables
        ...({ '--node-color': nodeColor } as React.CSSProperties),
        borderColor: isCurrent ? `rgba(${nodeColorRgb}, 0.9)` : `rgba(${nodeColorRgb}, 0.3)`,
        backgroundColor: `rgba(${nodeColorRgb}, ${isCurrent ? 0.25 : 0.1})`,
        boxShadow: isCurrent ? `0 0 12px 3px rgba(${nodeColorRgb}, 0.6)` : 'none',
        transition: 'all 0.3s ease',
        borderWidth: '2px',
        borderRadius: '8px',
        padding: '10px',
        width: '220px',
        minHeight: '80px',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        color: '#fff',
        fontSize: '12px',
        fontWeight: 600,
        fontFamily: 'Inter, sans-serif',
        cursor: 'pointer',
      }}
    >
      {/* Info icon for node tooltip */}
      <MuiTooltip
        title={nodeTooltipContent}
        placement="right"
        arrow
        enterDelay={300}
        PopperProps={{
          disablePortal: true,
          modifiers: [{ name: 'offset', options: { offset: [0, 8] } }],
        }}
        componentsProps={{
          tooltip: {
            sx: {
              // Use dynamic background only when active
              backgroundColor: isCurrent ? 'transparent' : 'rgba(30, 41, 59, 0.95)',
              color: 'white',
              padding: '0', // Remove default padding to allow our custom Box to control padding
              borderRadius: '6px',
              fontSize: '13px',
              maxWidth: '300px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
              border: isCurrent ? 'none' : '1px solid rgba(255,255,255,0.1)',
              '& .MuiTooltip-arrow': {
                color: isCurrent ? `rgba(${nodeColorRgb}, 0.25)` : 'rgba(30, 41, 59, 0.95)',
              },
            },
          },
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 4,
            left: 4,
            fontSize: '0.8em',
            lineHeight: 1,
            opacity: 0.7,
            cursor: 'help',
            zIndex: 10,
          }}
        >
          ℹ️
        </Box>
      </MuiTooltip>

      {/* Event type icon in top-right corner with tooltip */}
      {eventIcon && (
        <MuiTooltip
          title={iconTooltipContent}
          placement="right"
          arrow
          enterDelay={100}
          PopperProps={{
            disablePortal: true,
            modifiers: [{ name: 'offset', options: { offset: [0, 8] } }],
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: 4,
              right: 4,
              fontSize: '0.9em',
              lineHeight: 1,
              opacity: 0.9,
              cursor: 'help',
              zIndex: 10,
            }}
          >
            {eventIcon.icon}
          </Box>
        </MuiTooltip>
      )}

      {/* Render handles on correct sides */}
      {Object.entries(handles).map(([side, enabled]) =>
        enabled ? (
          <Handle
            key={side}
            type="source"
            position={handlePositions[side as keyof typeof handlePositions]}
            id={side}
            style={{
              background:
                data.type && data.type in nodeTypeColors
                  ? nodeTypeColors[data.type as keyof typeof nodeTypeColors]
                  : '#3b82f6',
              width: 10,
              height: 10,
              borderRadius: 5,
              zIndex: 2,
            }}
          />
        ) : null
      )}
      {Object.entries(handles).map(([side, enabled]) =>
        enabled ? (
          <Handle
            key={`${side}-target`}
            type="target"
            position={handlePositions[side as keyof typeof handlePositions]}
            id={side}
            style={{
              background:
                data.type && data.type in nodeTypeColors
                  ? nodeTypeColors[data.type as keyof typeof nodeTypeColors]
                  : '#3b82f6',
              width: 10,
              height: 10,
              borderRadius: 5,
              zIndex: 2,
            }}
          />
        ) : null
      )}

      {/* Node label and subtitle */}
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="body1">{data.label}</Typography>
        {data.details && (
          <Typography
            variant="caption"
            sx={{ display: 'block', mt: 0.5, fontSize: '0.8em', color: 'rgba(255, 255, 255, 0.8)' }}
          >
            {data.details}
          </Typography>
        )}
      </Box>

      {/* Status badge with tooltip */}
      {status && (
        <MuiTooltip
          title={statusTooltipContent}
          placement="bottom"
          arrow
          enterDelay={100}
          PopperProps={{
            disablePortal: true,
            modifiers: [{ name: 'offset', options: { offset: [0, 8] } }],
          }}
          componentsProps={{
            tooltip: {
              sx: {
                backgroundColor: isCurrent ? 'transparent' : 'rgba(30, 41, 59, 0.95)',
                color: 'white',
                padding: '0',
                borderRadius: '6px',
                fontSize: '13px',
                maxWidth: '300px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
                border: isCurrent ? 'none' : '1px solid rgba(255,255,255,0.1)',
                '& .MuiTooltip-arrow': {
                  color: isCurrent ? `rgba(${nodeColorRgb}, 0.25)` : 'rgba(30, 41, 59, 0.95)',
                },
              },
            },
          }}
        >
          <Box
            sx={{
              // position: 'absolute',
              // bottom: 2,
              // left: '50%',
              // transform: 'translateX(-50%)',
              fontSize: '0.7em',
              px: 1,
              py: 0.25,
              borderRadius: 3,
              // justifyContent: 'center',
              bgcolor: statusColor,
              color: '#000000',
              whiteSpace: 'nowrap',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              fontWeight: 700,
              cursor: 'help',
              // width: '100%',
              zIndex: 5,
            }}
          >
            {formatStatus(status)}
          </Box>
        </MuiTooltip>
      )}
    </div>
  );
};

export default CustomNode;
