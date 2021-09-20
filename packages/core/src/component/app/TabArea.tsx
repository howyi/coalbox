import React, {MouseEventHandler} from 'react';
import {Tabs, Tab, styled, Box, IconButton} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import {useCoalbox} from "../../hooks/useCoalbox";
import {CollectionConfig, InstanceConfig, TabId} from "../../types/config";
import {TOP_BAR_HEIGHT} from "../CoalboxApp";
import {CallArea} from "./CallArea";
import {defaultTabName} from "../../const/default";
import {CoalboxController} from "../CoalboxWindow";

type Props = {
    controller: CoalboxController
}

interface StyledTabsProps {
    children?: React.ReactNode;
    value: number;
    onChange: (event: React.SyntheticEvent, newValue: number) => void;
}

const StyledTabs = styled((props: StyledTabsProps) => (
    <Tabs
        {...props}
        variant={"scrollable"}
        scrollButtons={"auto"}
        TabIndicatorProps={{ children: <span className="MuiTabs-indicatorSpan" /> }}
    />
))({
    minHeight: '38px',
    maxHeight: '38px',
    '& .MuiTabs-indicator': {
        display: 'flex',
        justifyContent: 'center',
        backgroundColor: 'transparent',
    },
    '& .MuiTabs-indicatorSpan': {
        // maxWidth: 40,
        width: '100%',
        backgroundColor: '#5ee77e',
    },
});

interface StyledTabProps {
    label: React.ReactNode;
}

const StyledTab = styled((props: StyledTabProps) => (
    <Tab disableRipple {...props} />
))(({ theme }) => ({
    textTransform: 'none',
    fontWeight: theme.typography.fontWeightRegular,
    fontSize: theme.typography.pxToRem(15),
    marginRight: theme.spacing(0),
    // color: 'rgba(255, 255, 255, 0.7)',
    '&.Mui-selected': {
        color: theme.palette.text.primary,
        backgroundColor: 'rgba(95,228,193,0.32)',
    },
    '&.Mui-focusVisible': {
        backgroundColor: 'rgba(100, 95, 228, 0.32)',
    },
    padding: '0 10px',
    minWidth: '0'
}));

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

const TabPanel: React.VFC<TabPanelProps> = (props) => {
    const { children, value, index, ...other } = props;

    return (
        <Box hidden={value !== index} flex={'1'} width={'100%'} overflow={'scroll'}>
            {value === index && children}
        </Box>
    );
}

export const TabArea: React.VFC<Props> = (props) => {
    const [value, setValue] = React.useState(0);
    const {config, currentWorkspace, command, finder} = useCoalbox()
    const [tabIdMap, setTabIdMap] = React.useState<{[value in number]: TabId}>({})
    const [instanceConfigMap, setInstanceConfigMap] = React.useState<InstanceConfig[]>()
    const [collections, setCollections] = React.useState<CollectionConfig[]>()

    React.useEffect(() => {
        const newValueMap: {[value in number]: TabId} = {}
        setInstanceConfigMap(currentWorkspace.instances)
        currentWorkspace.tabs.forEach((t, i) => {
            newValueMap[i] = t.id
            if (t.id === currentWorkspace.foregroundTabId) {
                setValue(i)
            }
        })
        setTabIdMap(newValueMap)
    }, [currentWorkspace])

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        command.focusTab(currentWorkspace.id, tabIdMap[newValue])
        setValue(newValue);
    };

    const handleClose = (event: Parameters<MouseEventHandler>[0], tabId: TabId) => {
        command.closeTab(currentWorkspace.id, tabId)
        event.stopPropagation()
    };

    return <Box display={'flex'} flexDirection="column" height={'100%'}>
        <Box borderBottom={1} borderColor={'divider'} flex={`0 0 ${TOP_BAR_HEIGHT}`} height={TOP_BAR_HEIGHT}>

        <StyledTabs value={value} onChange={handleChange} aria-label="basic tabs example">
            {currentWorkspace.tabs.map((t)=> {
                const instance = instanceConfigMap?.find((inst) => {
                    return t.instancePath.instanceId === inst.id
                })
                return <StyledTab
                    key={t.id}
                    // label={instance?.name ?? defaultTabName}
                    label={<Box display={'flex'} flexDirection="row">
                        <Box flex={`1`}>
                            {instance?.name ?? defaultTabName}
                        </Box>
                        <Box flex={`0 0 10px`} margin={'-5px 0 0 5px'}>
                            <IconButton
                                size={'small'}
                                color={'inherit'}
                                onClick={(e) => {
                                    handleClose(e, t.id)
                                }}
                            ><CloseIcon fontSize={'inherit'}/></IconButton>
                        </Box>
                    </Box>}
                />
            })}
        </StyledTabs>
        </Box>
        {currentWorkspace.tabs.map((t, i)=> {
            const instance = instanceConfigMap?.find((inst) => {
                return t.instancePath.instanceId === inst.id
            })
            return <TabPanel value={value} index={i} key={i}>
                <CallArea
                    tabConfig={t}
                    instanceConfig={instance}
                    controller={props.controller}
                />
            </TabPanel>
        })}
    </Box>
}
