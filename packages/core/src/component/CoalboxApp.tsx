import React, {useState} from 'react';
import {Box} from "@mui/material";
import {WorkspaceArea} from "./app/WorkspaceArea";
import {ListArea} from "./app/ListArea";
import {TabArea} from "./app/TabArea";
import {useCoalbox} from "../hooks/useCoalbox";
import {CoalboxController} from "./CoalboxWindow";

type Props = {
    controller: CoalboxController
}

export const SIDE_BAR_WIDTH = '250px'
export const TOP_BAR_HEIGHT = '38px'

export const CoalboxApp: React.VFC<Props> = (props) => {

    const [sidebarOpen, setSidebarOpen] = useState(true)
    const {currentWorkspace} = useCoalbox()

    return <Box display={'flex'} flexDirection="row" height={'100%'} width={'100%'} fontSize={'14px'}>
            {sidebarOpen &&
            <Box flex={`0 0 ${SIDE_BAR_WIDTH}`} overflow={'hidden'} borderRight={1} borderColor={'divider'}>
                <Box display={'flex'} flexDirection="column" width={'100%'} height={'100%'}>
                    <Box borderBottom={1} borderColor={'divider'} flex={`0 0 ${TOP_BAR_HEIGHT}`} height={TOP_BAR_HEIGHT}>
                        <WorkspaceArea workspaceName={currentWorkspace.name}/>
                    </Box>
                    <Box flex={'1'} overflow={'scroll'} sx={{overflowX: 'hidden'}}>
                        <ListArea />
                    </Box>
                </Box>
            </Box>
            }
            <Box flex={'0'}>
                {/* TODO Movable */}
            </Box>
            <Box flex={'1'} width={'100%'} height={'100%'} overflow={'hidden'}>
                <TabArea controller={props.controller} />
            </Box>
        </Box>
}
