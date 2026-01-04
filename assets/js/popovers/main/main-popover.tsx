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
import { TabContent } from "@component/tabs/tab-content";
import { Fill, Slot } from "@wordpress/components";
import { SubTab } from "@app/context/tabs/types";
import { useTabConfig } from "@app/hooks/use-tab-config";
import { useFilteredData } from "@app/context/filter-context";
import { CloseButton } from "@component/ui/close-button";
import { Resizable } from "@libs/resizable/resizable";
import { Draggable } from "@libs/draggable/draggable";
import { ActiveTabContent } from "./active-tab-content";
import { Toolbar } from "@component/toolbar";

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
                        <Tabs variant="tab">
                            {
                                tabs.map( ( { id, title, subTabs }: any, index ) => (
                                    <Tab
                                        key={ id }
                                        id={ id }
                                        label={ title }
                                        onClick={ () => setTab( id ) }
                                        active={ activeTab === id }
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

                        <Slot name={ getSubTabSlotName( activeTab )  } />

                        <TabContent active={ true }>
                            <Toolbar />
                            <ActiveTabContent />
                        </TabContent>
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
        <Tabs variant="sub-tab">
            { subTabs.map( ( { id, label } ) => (
                <Tab id={ id } key={ id } label={ label } onClick={ () => setSubTab( id ) }/>
            ) ) }
        </Tabs>
    )
}

const getSubTabSlotName = ( name: string ) => {
    return `${ name }-sub-tab`;
}
