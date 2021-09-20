import React from 'react';
import {CoalboxConfig, Endpoint} from "../types/config";
import {CoalboxApp} from "./CoalboxApp";
import {RecoilRoot} from "recoil";
import {useCoalbox} from "../hooks/useCoalbox";
import {Metadata} from "@grpc/grpc-js";
import useLocalStorage from "../hooks/useLocalStorage";

export type CoalboxController = {
    configChanged?: () => void
    overrideEndpoint?: () => Endpoint
    overrideGrpcMetadata?: (path: string) => Promise<Metadata>
}

type Props = {
    initConfig: CoalboxConfig
    changeWorkspace: boolean
    addCollection: boolean
    controller: CoalboxController
}

export const CoalboxWindow: React.VFC<Props> = (props) => {
    return <RecoilRoot>
        <CoalboxRecoiledWindow {...props} />
    </RecoilRoot>
}

const CoalboxRecoiledWindow: React.VFC<Props> = (props) => {

    const {config, setConfig} = useCoalbox()
    const [savedConfig, saveConfig] = useLocalStorage<CoalboxConfig>('coalbox_config', props.initConfig)

    React.useEffect(() => {
        setConfig(savedConfig)
    }, [])

    React.useEffect(() => {
        console.log('save', config)
        saveConfig(config)
    }, [config])

    return <>
        {config.currentWorkspaceId &&
            <CoalboxApp controller={props.controller}/>
        }
    </>
}
