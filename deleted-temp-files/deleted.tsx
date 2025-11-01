// import React, { useState, useRef, useCallback, useEffect } from 'react';
//
// // Types
// const RESIZE_DIRECTIONS = {
//     NORTH_WEST: 'nw',
//     NORTH_EAST: 'ne',
//     SOUTH_WEST: 'sw',
//     SOUTH_EAST: 'se',
//     NORTH: 'n',
//     SOUTH: 's',
//     WEST: 'w',
//     EAST: 'e'
// };
//
// const DEFAULT_CONSTRAINTS = {
//     MIN_WIDTH: 100,
//     MIN_HEIGHT: 100,
//     MAX_WIDTH: Infinity,
//     MAX_HEIGHT: Infinity
// };
//
// // Utility functions
// const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
//
// const calculateNewDimensions = (direction, startState, delta) => {
//     const { x: dx, y: dy } = delta;
//     const { width, height, posX, posY } = startState;
//
//     let newWidth = width;
//     let newHeight = height;
//     let newX = posX;
//     let newY = posY;
//
//     // Horizontal resizing
//     if (direction.includes('e')) {
//         newWidth = width + dx;
//     } else if (direction.includes('w')) {
//         newWidth = width - dx;
//         newX = posX + dx;
//     }
//
//     // Vertical resizing
//     if (direction.includes('s')) {
//         newHeight = height + dy;
//     } else if (direction.includes('n')) {
//         newHeight = height - dy;
//         newY = posY + dy;
//     }
//
//     return { newWidth, newHeight, newX, newY };
// };
//
// const applyConstraints = (dimensions, constraints) => {
//     const { newWidth, newHeight, newX, newY } = dimensions;
//     const { minWidth, minHeight, maxWidth, maxHeight } = constraints;
//
//     const constrainedWidth = clamp(newWidth, minWidth, maxWidth);
//     const constrainedHeight = clamp(newHeight, minHeight, maxHeight);
//
//     return {
//         width: constrainedWidth,
//         height: constrainedHeight,
//         x: newX,
//         y: newY
//     };
// };
//
// // Resize Handle Component
// const ResizeHandle = ({ position, cursor, onMouseDown }) => {
//     const styles = {
//         position: 'absolute',
//         width: '12px',
//         height: '12px',
//         backgroundColor: '#3b82f6',
//         border: '2px solid white',
//         borderRadius: '50%',
//         cursor,
//         zIndex: 10,
//         ...position
//     };
//
//     return (
//         <div
//             className="resize-handle"
//             style={styles}
//             onMouseDown={onMouseDown}
//         />
//     );
// };
//
// // Resize Edge Component
// const ResizeEdge = ({ position, cursor, onMouseDown }) => {
//     const styles = {
//         position: 'absolute',
//         backgroundColor: 'transparent',
//         cursor,
//         zIndex: 9,
//         ...position
//     };
//
//     return (
//         <div
//             className="resize-edge"
//             style={styles}
//             onMouseDown={onMouseDown}
//         />
//     );
// };
//
// // Main Component
// function ResizableWrapper({
//                               children,
//                               initialWidth = 400,
//                               initialHeight = 300,
//                               initialX = 100,
//                               initialY = 100,
//                               minConstraints = [DEFAULT_CONSTRAINTS.MIN_WIDTH, DEFAULT_CONSTRAINTS.MIN_HEIGHT],
//                               maxConstraints = [DEFAULT_CONSTRAINTS.MAX_WIDTH, DEFAULT_CONSTRAINTS.MAX_HEIGHT],
//                               onResizeStart,
//                               onResizeStop
//                           }) {
//     const [size, setSize] = useState({
//         width: initialWidth,
//         height: initialHeight
//     });
//
//     const [position, setPosition] = useState({
//         x: initialX,
//         y: initialY
//     });
//
//     const resizeStateRef = useRef({
//         isResizing: false,
//         direction: null,
//         startPos: { x: 0, y: 0 },
//         startSize: { width: 0, height: 0 },
//         startPosition: { x: 0, y: 0 }
//     });
//
//     const dragStateRef = useRef({
//         isDragging: false,
//         startPos: { x: 0, y: 0 },
//         startPosition: { x: 0, y: 0 }
//     });
//
//     const constraints = {
//         minWidth: minConstraints[0],
//         minHeight: minConstraints[1],
//         maxWidth: maxConstraints[0],
//         maxHeight: maxConstraints[1]
//     };
//
//     const startResize = (e, direction) => {
//         e.preventDefault();
//         e.stopPropagation();
//
//         resizeStateRef.current = {
//             isResizing: true,
//             direction,
//             startPos: { x: e.clientX, y: e.clientY },
//             startSize: { width: size.width, height: size.height },
//             startPosition: { x: position.x, y: position.y }
//         };
//
//         onResizeStart?.();
//     };
//
//     const startDrag = (e) => {
//         // Only start drag if clicking on the container itself, not handles
//         if (e.target.classList.contains('resize-handle') || e.target.classList.contains('resize-edge')) {
//             return;
//         }
//
//         e.preventDefault();
//
//         dragStateRef.current = {
//             isDragging: true,
//             startPos: { x: e.clientX, y: e.clientY },
//             startPosition: { x: position.x, y: position.y }
//         };
//     };
//
//     const handleResize = (e) => {
//         const state = resizeStateRef.current;
//         if (!state.isResizing) return;
//
//         const delta = {
//             x: e.clientX - state.startPos.x,
//             y: e.clientY - state.startPos.y
//         };
//
//         const startState = {
//             width: state.startSize.width,
//             height: state.startSize.height,
//             posX: state.startPosition.x,
//             posY: state.startPosition.y
//         };
//
//         const newDimensions = calculateNewDimensions(state.direction, startState, delta);
//         const constrainedDimensions = applyConstraints(newDimensions, constraints);
//
//         setSize({
//             width: constrainedDimensions.width,
//             height: constrainedDimensions.height
//         });
//
//         setPosition({
//             x: constrainedDimensions.x,
//             y: constrainedDimensions.y
//         });
//     };
//
//     const handleDrag = (e) => {
//         const state = dragStateRef.current;
//         if (!state.isDragging) return;
//
//         const deltaX = e.clientX - state.startPos.x;
//         const deltaY = e.clientY - state.startPos.y;
//
//         setPosition({
//             x: state.startPosition.x + deltaX,
//             y: state.startPosition.y + deltaY
//         });
//     };
//
//     const stopResize = () => {
//         if (resizeStateRef.current.isResizing) {
//             resizeStateRef.current.isResizing = false;
//             onResizeStop?.();
//         }
//     };
//
//     const stopDrag = () => {
//         dragStateRef.current.isDragging = false;
//     };
//
//     useEffect(() => {
//         const handleMouseMove = (e) => {
//             handleResize(e);
//             handleDrag(e);
//         };
//
//         const handleMouseUp = () => {
//             stopResize();
//             stopDrag();
//         };
//
//         document.addEventListener('mousemove', handleMouseMove);
//         document.addEventListener('mouseup', handleMouseUp);
//
//         return () => {
//             document.removeEventListener('mousemove', handleMouseMove);
//             document.removeEventListener('mouseup', handleMouseUp);
//         };
//     }, []);
//
//     const containerStyles = {
//         position: 'absolute',
//         width: `${size.width}px`,
//         height: `${size.height}px`,
//         left: `${position.x}px`,
//         top: `${position.y}px`,
//         border: '2px solid #3b82f6',
//         backgroundColor: 'white',
//         boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
//         borderRadius: '8px',
//         cursor: 'move'
//     };
//
//     const contentStyles = {
//         width: '100%',
//         height: '100%',
//         overflow: 'auto',
//         padding: '16px'
//     };
//
//     const cornerHandles = [
//         { dir: RESIZE_DIRECTIONS.NORTH_WEST, pos: { top: '-6px', left: '-6px' }, cursor: 'nw-resize' },
//         { dir: RESIZE_DIRECTIONS.NORTH_EAST, pos: { top: '-6px', right: '-6px' }, cursor: 'ne-resize' },
//         { dir: RESIZE_DIRECTIONS.SOUTH_WEST, pos: { bottom: '-6px', left: '-6px' }, cursor: 'sw-resize' },
//         { dir: RESIZE_DIRECTIONS.SOUTH_EAST, pos: { bottom: '-6px', right: '-6px' }, cursor: 'se-resize' }
//     ];
//
//     const edgeHandles = [
//         { dir: RESIZE_DIRECTIONS.NORTH, pos: { top: 0, left: '8px', right: '8px', height: '8px' }, cursor: 'n-resize' },
//         { dir: RESIZE_DIRECTIONS.SOUTH, pos: { bottom: 0, left: '8px', right: '8px', height: '8px' }, cursor: 's-resize' },
//         { dir: RESIZE_DIRECTIONS.WEST, pos: { left: 0, top: '8px', bottom: '8px', width: '8px' }, cursor: 'w-resize' },
//         { dir: RESIZE_DIRECTIONS.EAST, pos: { right: 0, top: '8px', bottom: '8px', width: '8px' }, cursor: 'e-resize' }
//     ];
//
//     return (
//         <div style={containerStyles} onMouseDown={startDrag}>
//       <div style={contentStyles}>
//         {children}
//       </div>
//
//             {cornerHandles.map(({ dir, pos, cursor }) => (
//                 <ResizeHandle
//                     key={dir}
//                     position={pos}
//                     cursor={cursor}
//                     onMouseDown={(e) => startResize(e, dir)}
//                 />
//             ))}
//
//             {edgeHandles.map(({ dir, pos, cursor }) => (
//                 <ResizeEdge
//                     key={dir}
//                     position={pos}
//                     cursor={cursor}
//                     onMouseDown={(e) => startResize(e, dir)}
//                 />
//             ))}
//     </div>
//     );
// }
//
// // Demo
// export default function App() {
//     return (
//         <div style={{ width: '100vw', height: '100vh', position: 'relative', backgroundColor: '#f3f4f6' }}>
//       <ResizableWrapper
//           initialWidth={400}
//           initialHeight={300}
//           initialX={100}
//           initialY={100}
//           onResizeStart={() => console.log('Resize started')}
//           onResizeStop={() => console.log('Resize stopped')}
//       >
//         <h2 style={{ margin: '0 0 16px 0', color: '#1f2937' }}>Resizable Component</h2>
//         <p style={{ color: '#6b7280', lineHeight: '1.6' }}>
//           Drag the corner handles or edges to resize this component. Click and drag anywhere else to move it.
//           The code has been refactored following SOLID principles for better maintainability and readability.
//         </p>
//       </ResizableWrapper>
//     </div>
//     );
// }
