import React, { forwardRef } from "react";
import { Popover } from "@component/popover/popover";
import { MAIN_POPOVER_KEY, usePopover } from "@app/context/popover-context";
import { PopoverHeader } from "@component/popover/popover-header";
import { Padding } from "@component/ui/padding";
import { Flex } from "@component/ui/flex";
import { Label } from "@component/ui/label";
import { PopoverContent } from "@component/popover/popover-content";
import { useTabs } from "@app/context/tabs/tabs-context";
import { Tabs } from "@component/tabs/tabs";
import { Tab } from "@component/tabs/tab";
import { TabPanel } from "@component/tabs/tab-panel";
import { Fill, Slot } from "@wordpress/components";
import { SubTab } from "@app/context/tabs/types";
import { useTabConfig } from "@app/hooks/use-tab-config";
import { useFilteredData } from "@app/context/filter-context";
import { CloseButton } from "@component/ui/close-button";
import { Resizable } from "@libs/resizable/resizable";
import { Draggable } from "@libs/draggable/draggable";

export const MainPopover = forwardRef<HTMLDivElement>( (_, ref ) => {
    const { toggle: mainToggle } = usePopover( MAIN_POPOVER_KEY );
    const { tabs, setTab, setSubTab, activeTab } = useTabs();
    const { data } = useFilteredData();
    const { shouldShowData } = useTabConfig();

    return (
        <Popover ref={ ref } id={ MAIN_POPOVER_KEY }>
            <Resizable>
                <PopoverHeader>
                    <Draggable>
                        <Padding>
                            <Flex>
                                <Label text="Dev Debug"/>
                                <CloseButton onClick={ mainToggle } />
                            </Flex>
                        </Padding>
                    </Draggable>
                </PopoverHeader>

                <PopoverContent>
                    <Padding>
                        <Tabs
                            variant="tab"
                            className="tabs"
                            indicatorClassName="tabs-indicator"
                            extraChildren={ <Slot name={ getSubTabSlotName( activeTab )  } /> }
                        >
                            {
                                tabs.map( ( { id, title, subTabs }: any ) => (
                                    <Tab
                                        key={ id }
                                        label={ title }
                                        onClick={ () => setTab( id ) }
                                    >
                                        {
                                            shouldShowData?.( data ) && (
                                                <Fill key={ id } name={ getSubTabSlotName( id ) } >
                                                    <SubTabs key={ id } subTabs={ subTabs } setSubTab={ setSubTab } />
                                                </Fill>
                                            )
                                        }
                                    </Tab>
                                ) )
                            }
                        </Tabs>

                        <TabPanel />
                    </Padding>
                </PopoverContent>
            </Resizable>
        </Popover>
    )
} )

const SubTabs = ( { subTabs, setSubTab }: { subTabs: SubTab[]; setSubTab: ( id: string ) => void } ) => {

    if ( subTabs.length === 0 ) {
        return null;
    }

    return (
        <Tabs
            variant="sub-tab"
            className="sub-tabs"
            indicatorClassName="sub-tabs-indicator"
        >
            { subTabs.map( ( { id, label } ) => (
                <Tab key={ id } label={ label } onClick={ () => setSubTab( id ) }/>
            ) ) }
        </Tabs>
    )
}

const getSubTabSlotName = ( name: string ) => {
    return `${ name }-sub-tab`;
}

{/*<TabHeaders/>*/}
{/*<Sections />*/}
{/*descriptive of what its doing or contain in the content */}
//
{/*/!*        /!*<Fill key={ id } name={ getSubTabSlotName( id ) } >*!/*!/*/}
{/*/!*        /!*    <SubTabs key={ id } subTabs={ subTabs } setSubTab={ setSubTab } />*!/*!/*/}
{/*/!*        /!*</Fill>*!/*!/*/}
{/*    </div>*/}
{/*    /!*May be a variant received by the Tabs and with enhanced children pass the variant to manipulate the classes with the variant*!/*/}
