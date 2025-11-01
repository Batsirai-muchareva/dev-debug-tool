import * as React from "react";
import { Resizable } from "../libs/resizable/resizable";
import { Tabs } from "./tabs/tabs";
import { Draggable } from "../libs/draggable/draggable";
import { usePopover } from "../context/popover-context";

export const POPOVER_SIZES = {
    width: 300,
    height: 400,
};

export const Popover = () => {
    const popover = usePopover();

    if ( ! popover.isOpen ) {
        return null;
    }

    return (
    <Resizable
        initialWidth={ POPOVER_SIZES.width }
        initialHeight={ POPOVER_SIZES.height }>
        <div>
            <Draggable className="dev-debug__popover-header">
                <p>Dev Debug Tool</p>
                <button className="dev-debug-tool-close">
                    <i className="eicon-close"></i>
                </button>
            </Draggable>
            <Tabs />
        </div>
    </Resizable>
    );
};








//      <div className="resize-container">
// {/* Example 1: Resizable container with  initialX={50} initialY={50} custom content */}
// <Resizable width={400} height={300}>
//   <div className="my-content">
//     <h2>My Custom Content</h2>
//     <p>This is your content inside a resizable wrapper!</p>
//     <p>You can put anything here:</p>
//     <ul>
//       <li>Forms</li>
//       <li>Images</li>
//       <li>Text</li>
//       <li>Components</li>8
//     </ul>
//   </div>
// </Resizable>

// Example 2: onMouseDown={ startDrag } Another resizable container initialX={500} initialY={100}





// <div className="dev-debug-tool-popover">
//     <div className="dev-debug-tool-header">
//         <h3>Debug Tool</h3>
//         <button className="dev-debug-tool-close">
//             <i className="eicon-close"></i>
//         </button>
//     </div>
//     <div className="dev-debug-tool-tabs">
//         <button className="dev-debug-tool-tab active" data-tab="database">
//             Database Schema
//         </button>
//         <button className="dev-debug-tool-tab" data-tab="editor">
//             Editor Schema
//         </button>
//     </div>


// </div>
// <Resizable >               <Resizable onResize={ onResize } height={ sizeState.height } width={ sizeState.width } resizeHandles={['n', 'ne', 'e', 's', 'se', 'w', 'nw', 'sw']} axis="both" className="dev-debug__popover">      {/*</Resizable>*/}
//     <Resizable onResize={ onResize } size={{ width: sizeState.width, height: sizeState.height }} className="dev-debug__popover">
//     <Resizable onResize={ onResize } height={ sizeState.height } width={ sizeState.width } className="dev-debug__popover">
//  <ResizableWrapper>
//
//         <div>
//            <div className="dev-debug__popover-header">
//             <h3>Dev Debug Tool</h3>
//             <button className="dev-debug-tool-close">
//                 <i className="eicon-close"></i>
//             </button>
//         </div>
//         <Tabs />
//         </div>
//     </ResizableWrapper>
//
// //
// {/*<div className="dev-debug-tool-content">*/}
// {/*    <div className="dev-debug-tool-tab-content active" data-tab="database">*/}
// {/*        <div className="dev-debug-tool-actions">*/}
// {/*            <button className="dev-debug-tool-refresh" data-tab="database">*/}
// {/*                <i className="eicon-sync"></i> Refresh*/}
// {/*            </button>*/}
// {/*            <button className="dev-debug-tool-copy" data-tab="database">*/}
// {/*                <i className="eicon-copy"></i> ${ elementorDebugTool.strings.copyToClipboard }*/}
// {/*            </button>*/}
// {/*            <button className="dev-debug-tool-export" data-tab="database">*/}
// {/*                <i className="eicon-download"></i> ${ elementorDebugTool.strings.exportJson }*/}
// {/*            </button>*/}
// {/*        </div>*/}
// {/*        <div className="dev-debug-tool-json-container">*/}
// {/*            <pre className="dev-debug-tool-json" id="database-json"></pre>*/}
// {/*        </div>*/}
// {/*    </div>*/}
// {/*    <div className="dev-debug-tool-tab-content" data-tab="editor">*/}
// {/*        <div className="dev-debug-tool-actions">*/}
// {/*            <button className="dev-debug-tool-refresh" data-tab="editor">*/}
// {/*                <i className="eicon-sync"></i> Refresh*/}
// {/*            </button>*/}
// {/*            <button className="dev-debug-tool-copy" data-tab="editor">*/}
// {/*                <i className="eicon-copy"></i> ${ elementorDebugTool.strings.copyToClipboard }*/}
// {/*            </button>*/}
// {/*            <button className="dev-debug-tool-export" data-tab="editor">*/}
// {/*                <i className="eicon-download"></i> ${ elementorDebugTool.strings.exportJson }*/}
// {/*            </button>*/}
// {/*        </div>*/}
// {/*        <div className="dev-debug-tool-json-container">*/}
// {/*            <pre className="dev-debug-tool-json" id="editor-json"></pre>*/}
// {/*        </div>*/}
// {/*    </div>*/}
// {/*</div>*/}
//
// //
// // {/*<div className="dev-debug-tool-content">*/}
// // {/*    <div className="dev-debug-tool-tab-content active" data-tab="database">*/}
// // {/*        <div className="dev-debug-tool-actions">*/}
// // {/*            <button className="dev-debug-tool-refresh" data-tab="database">*/}
// // {/*                <i className="eicon-sync"></i> Refresh*/}
// // {/*            </button>*/}
// // {/*            <button className="dev-debug-tool-copy" data-tab="database">*/}
// // {/*                <i className="eicon-copy"></i> ${ elementorDebugTool.strings.copyToClipboard }*/}
// // {/*            </button>*/}
// // {/*            <button className="dev-debug-tool-export" data-tab="database">*/}
// // {/*                <i className="eicon-download"></i> ${ elementorDebugTool.strings.exportJson }*/}
// // {/*            </button>*/}
// // {/*        </div>*/}
// // {/*        <div className="dev-debug-tool-json-container">*/}
// // {/*            <pre className="dev-debug-tool-json" id="database-json"></pre>*/}
// // {/*        </div>*/}
// // {/*    </div>*/}
// // {/*    <div className="dev-debug-tool-tab-content" data-tab="editor">*/}
// // {/*        <div className="dev-debug-tool-actions">*/}
// // {/*            <button className="dev-debug-tool-refresh" data-tab="editor">*/}
// // {/*                <i className="eicon-sync"></i> Refresh*/}
// // {/*            </button>*/}
// // {/*            <button className="dev-debug-tool-copy" data-tab="editor">*/}
// // {/*                <i className="eicon-copy"></i> ${ elementorDebugTool.strings.copyToClipboard }*/}
// // {/*            </button>*/}
// // {/*            <button className="dev-debug-tool-export" data-tab="editor">*/}
// // {/*                <i className="eicon-download"></i> ${ elementorDebugTool.strings.exportJson }*/}
// // {/*            </button>*/}
// // {/*        </div>*/}
// // {/*        <div className="dev-debug-tool-json-container">*/}
// // {/*            <pre className="dev-debug-tool-json" id="editor-json"></pre>*/}
// // {/*        </div>*/}
// // {/*    </div>*/}
// // {/*</div>*/}
