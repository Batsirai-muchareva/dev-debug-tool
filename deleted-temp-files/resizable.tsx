// import * as React from "react";
// import { PropsWithChildren } from "react";
// import { useState, useRef } from 'react';
//
// type Props = PropsWithChildren & {
//     width: number;
//     height: number;
// };
// // initialX = 100, initialY = 100
//
// export function Resizable( { children, width = 400, height = 300 }: Props ) {
//   const [size, setSize] = useState( { width, height } );
// //   const [position, setPosition] = useState({ x: initialX, y: initialY });
//   const resizing = useRef( null );
//   const startPos = useRef({ width: 0, height: 0 });
//
//   const handleMouseDown = (e: any, direction: any) => {
//     e.preventDefault();
//     resizing.current = direction;
//     (startPos as any).current = {
//     //   x: e.clientX,
//     //   y: e.clientY,
//       width: size.width,
//       height: size.height,
//     //   posX: position.x,
//     //   posY: position.y
//     };
//
//     document.addEventListener('mousemove', handleMouseMove);
//     document.addEventListener('mouseup', handleMouseUp);
//   };
//
//   const handleMouseMove = (e: any) => {
//     if ( ! resizing.current ) return;
//
//     // const dx = e.clientX - startPos.current.x;
//     // const dy = e.clientY - startPos.current.y;
//     const dir = resizing.current as any;
//
//     let newWidth = startPos.current.width;
//     let newHeight = startPos.current.height;
//     // let newX = (startPos.current as any).posX;
//     // let newY = (startPos.current as any).posY;
//
//     if (dir.includes('e')) newWidth = Math.max(100, startPos.current.width + dx );
//     if (dir.includes('w')) {
//       newWidth = Math.max(100, startPos.current.width - dx );
//       newX = (startPos.current as any).posX + (startPos.current.width - newWidth);
//     }
//     if (dir.includes('s')) newHeight = Math.max(100, startPos.current.height + dy);
//     if (dir.includes('n')) {
//       newHeight = Math.max(100, startPos.current.height - dy);
//       newY = (startPos.current as any).posY + (startPos.current.height - newHeight);
//     }
//
//     setSize({ width: newWidth, height: newHeight });
//     // setPosition({ x: newX, y: newY });
//   };
//
//   const handleMouseUp = () => {
//     resizing.current = null;
//     document.removeEventListener('mousemove', handleMouseMove);
//     document.removeEventListener('mouseup', handleMouseUp);
//   };
//
//   return (
//     <div
//       className="dev-debug__popover"
//       style={{
//         width: `${size.width}px`,
//         height: `${size.height}px`,
//         // left: `${position.x}px`,
//         // top: `${position.y}px`
//       }}
//     >
//       <div className="box-content">
//         {children}
//       </div>
//
//       {/* Corner Handles */}
//       <div className="resize-handle" style={{ top: -6, left: -6, cursor: 'nw-resize' }}
//            onMouseDown={(e) => handleMouseDown(e, 'nw')} />
//       <div className="resize-handle" style={{ top: -6, right: -6, cursor: 'ne-resize' }}
//            onMouseDown={(e) => handleMouseDown(e, 'ne')} />
//       <div className="resize-handle" style={{ bottom: -6, left: -6, cursor: 'sw-resize' }}
//            onMouseDown={(e) => handleMouseDown(e, 'sw')} />
//       <div className="resize-handle" style={{ bottom: -6, right: -6, cursor: 'se-resize' }}
//            onMouseDown={(e) => handleMouseDown(e, 'se')} />
//
//       {/* Edge Handles */}
//       <div className="resize-edge" style={{ top: 0, left: 8, right: 8, height: 8, cursor: 'n-resize' }}
//            onMouseDown={(e) => handleMouseDown(e, 'n')} />
//       <div className="resize-edge" style={{ bottom: 0, left: 8, right: 8, height: 8, cursor: 's-resize' }}
//            onMouseDown={(e) => handleMouseDown(e, 's')} />
//       <div className="resize-edge" style={{ left: 0, top: 8, bottom: 8, width: 8, cursor: 'w-resize' }}
//            onMouseDown={(e) => handleMouseDown(e, 'w')} />
//       <div className="resize-edge" style={{ right: 0, top: 8, bottom: 8, width: 8, cursor: 'e-resize' }}
//            onMouseDown={(e) => handleMouseDown(e, 'e')} />
//     </div>
//   );
// }
//
// // Demo showing how to use it
// // export default function App() {
// //   return (
// //     <>
// //       <style>{`
//
// //       `}</style>
//
// //       <div className="resize-container">
// //         {/* Example 1: Resizable container with custom content */}
// //         <ResizableWrapper initialWidth={400} initialHeight={300} initialX={50} initialY={50}>
// //           <div className="my-content">
// //             <h2>My Custom Content</h2>
// //             <p>This is your content inside a resizable wrapper!</p>
// //             <p>You can put anything here:</p>
// //             <ul>
// //               <li>Forms</li>
// //               <li>Images</li>
// //               <li>Text</li>
// //               <li>Components</li>
// //             </ul>
// //           </div>
// //         </ResizableWrapper>
//
// //         {/* Example 2: Another resizable container */}
// //         <ResizableWrapper initialWidth={300} initialHeight={200} initialX={500} initialY={100}>
// //           <div className="my-content">
// //             <h2>Another Container</h2>
// //             <p>You can have multiple resizable containers!</p>
// //           </div>
// //         </ResizableWrapper>
// //       </div>
// //     </>
// //   );
// // }
