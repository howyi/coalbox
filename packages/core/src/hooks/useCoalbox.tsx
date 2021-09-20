import React from "react";
import {CoalboxConfig, WorkspaceConfig} from "../types/config";
import {CoalboxFinder, useCoalboxFinder} from "./useCoalboxFinder";
import {CoalboxCommand, useCoalboxCommand} from "./useCoalboxCommand";
import {atom, selector, useRecoilState, useRecoilValue} from "recoil";

export type SetConfigType = (config: CoalboxConfig) => void

const initConfig = {workspaces: [], multipleWorkspace: true}

const initWorkspaceConfig = {
    id: "",
    name: "",
    collections: [],
    foregroundTabId: "",
    tabs: [],
    instances: [],
}

export const coalboxConfigState = atom<CoalboxConfig>({
    key: 'coalbox/ConfigState',
    default: initConfig,
    dangerouslyAllowMutability: true // オフにするとオブジェクトのpushが不可能
});

export const coalboxWorkspaceConfigSelector = selector<WorkspaceConfig>({
    key: 'coalbox/WorkspaceConfigSelector',
    get: ({get}) => {
        const config = get(coalboxConfigState);
        const workspaceConfig = config.workspaces.find((w) => {
            return w.id == config.currentWorkspaceId
        })
        if (!workspaceConfig) {
            return initWorkspaceConfig
        }
        return workspaceConfig;
    },
});

type ContextValues = {
    config: CoalboxConfig
    setConfig: SetConfigType
    finder: CoalboxFinder
    command: CoalboxCommand
    currentWorkspace: WorkspaceConfig
}
export const useCoalbox = (): ContextValues => {
    const [config, setConfig] = useRecoilState(coalboxConfigState)
    const workspace = useRecoilValue(coalboxWorkspaceConfigSelector)
    const finder = useCoalboxFinder()
    const command = useCoalboxCommand()
    return {
        config: config,
        setConfig: setConfig,
        finder: finder,
        command: command,
        currentWorkspace: workspace
    }
}