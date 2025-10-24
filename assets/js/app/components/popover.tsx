import { usePopover } from "../context/popover-context";
import Tabs from "./tabs";

export const Popover = () => {
    const popover = usePopover();

    if ( ! popover.isOpen ) {
        return null;
    }

    return (
        <div className="dev-debug-tool-popover">
            <Tabs />
        </div>
    );
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
            {/*<div className="dev-debug-tool-content">*/}
            {/*    <div className="dev-debug-tool-tab-content active" data-tab="database">*/}
            {/*        <div className="dev-debug-tool-actions">*/}
            {/*            <button className="dev-debug-tool-refresh" data-tab="database">*/}
            {/*                <i className="eicon-sync"></i> Refresh*/}
            {/*            </button>*/}
            {/*            <button className="dev-debug-tool-copy" data-tab="database">*/}
            {/*                <i className="eicon-copy"></i> ${ elementorDebugTool.strings.copyToClipboard }*/}
            {/*            </button>*/}
            {/*            <button className="dev-debug-tool-export" data-tab="database">*/}
            {/*                <i className="eicon-download"></i> ${ elementorDebugTool.strings.exportJson }*/}
            {/*            </button>*/}
            {/*        </div>*/}
            {/*        <div className="dev-debug-tool-json-container">*/}
            {/*            <pre className="dev-debug-tool-json" id="database-json"></pre>*/}
            {/*        </div>*/}
            {/*    </div>*/}
            {/*    <div className="dev-debug-tool-tab-content" data-tab="editor">*/}
            {/*        <div className="dev-debug-tool-actions">*/}
            {/*            <button className="dev-debug-tool-refresh" data-tab="editor">*/}
            {/*                <i className="eicon-sync"></i> Refresh*/}
            {/*            </button>*/}
            {/*            <button className="dev-debug-tool-copy" data-tab="editor">*/}
            {/*                <i className="eicon-copy"></i> ${ elementorDebugTool.strings.copyToClipboard }*/}
            {/*            </button>*/}
            {/*            <button className="dev-debug-tool-export" data-tab="editor">*/}
            {/*                <i className="eicon-download"></i> ${ elementorDebugTool.strings.exportJson }*/}
            {/*            </button>*/}
            {/*        </div>*/}
            {/*        <div className="dev-debug-tool-json-container">*/}
            {/*            <pre className="dev-debug-tool-json" id="editor-json"></pre>*/}
            {/*        </div>*/}
            {/*    </div>*/}
            {/*</div>*/}
        // </div>
    // );
}
