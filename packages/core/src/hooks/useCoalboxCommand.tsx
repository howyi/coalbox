import React from "react";
import {
    CoalboxConfig, CollectionConfig, CollectionId, gRPCProtoSetConfig, GrpcRequestTemplatePath, GrpcRequestValue,
    InstanceConfig,
    InstanceId,
    TabConfig,
    TabId,
    TemplatePath,
    WorkspaceConfig,
    WorkspaceId
} from "../types/config";
import {coalboxConfigState, SetConfigType} from "./useCoalbox";
import {randomId} from "../utils/random";
import {useRecoilState} from "recoil";
import {closeTab} from "../store/modifiers/closeTab";

export type CoalboxCommand = {
    newInstance: (workspaceId: WorkspaceId, instance: Omit<InstanceConfig, 'id'>, newTab: boolean, focus: boolean) => void
    newTab: (tab: Omit<TabConfig, 'id'>, focus: boolean) => TabConfig
    focusTab: (workspaceId: WorkspaceId, tabId: TabId) => void
    closeTab: (workspaceId: WorkspaceId, tabId: TabId) => void
    updateCollection: (collection: gRPCProtoSetConfig) => void
    updateInstance: (instance: InstanceConfig<GrpcRequestValue, GrpcRequestTemplatePath>) => void
}

export const useCoalboxCommand = (): CoalboxCommand => {
    const [config, setConfig] = useRecoilState(coalboxConfigState)

    const configDeepCopy = (): CoalboxConfig => {
        return JSON.parse(JSON.stringify(config))
    }

    const workspace = (config: CoalboxConfig, id: WorkspaceId): WorkspaceConfig => {
        const w = config.workspaces.find((w) => {
            return w.id === id
        })
        if (!w) {
            throw Error ('workspace not found')
        }
        return w
    }

    const collection = (config: CoalboxConfig, id: CollectionId): CollectionConfig => {
        let found: CollectionConfig | undefined = undefined
        config.workspaces.forEach((w) => {
            if (found) {
                return
            }
            found = w.collections.find((c) => {
                return c.id === id
            })
        })
        if (!found) {
            throw Error ('collection not found')
        }
        return found
    }

    const instance = (config: CoalboxConfig, id: InstanceId): InstanceConfig => {
        let found: InstanceConfig | undefined = undefined
        config.workspaces.forEach((w) => {
            if (found) {
                return
            }
            found = w.instances.find((c) => {
                return c.id === id
            })
        })
        if (!found) {
            throw Error ('instance not found')
        }
        return found
    }

    return {
        newInstance: (workspaceId, instance, newTab, focus) => {
            const newConfig = configDeepCopy()
            const w = workspace(newConfig, workspaceId)

            const instanceId = randomId()
            const newInstanceConfig: InstanceConfig = {
                id: instanceId,
                ...instance
            }
            w.instances.push(newInstanceConfig)
            if (newTab) {
                const tabId = randomId()
                const newTabConfig: TabConfig = {
                    id: tabId,
                    isPopUp: false,
                    instancePath: {
                        workspaceId: workspaceId,
                        instanceId: instanceId
                    }
                }
                w.tabs.push(newTabConfig)
                if (focus) {
                    w.foregroundTabId = tabId
                }
            }
            setConfig(newConfig)
            return
        },
        newTab: (tab, focus) => {
            const newConfig = configDeepCopy()
            const w = workspace(newConfig, tab.instancePath.workspaceId)

            const tabId = randomId()
            const newTabConfig: TabConfig = {
                id: tabId,
                ...tab
            }
            w.tabs.push(newTabConfig)
            if (focus) {
                w.foregroundTabId = tabId
            }
            setConfig(newConfig)
            return newTabConfig
        },
        focusTab: (workspaceId: WorkspaceId,  tabId: TabId) => {
            const newConfig = configDeepCopy()
            const w = workspace(newConfig, workspaceId)

            // TODO isPopUp = trueのときはウィンドウにfocus
            w.foregroundTabId = tabId
            setConfig(newConfig)
        },
        closeTab: (workspaceId: WorkspaceId,  tabId: TabId) => {
            const newConfig = configDeepCopy()
            closeTab(newConfig, workspaceId, tabId)
            setConfig(newConfig)
        },
        updateCollection: (newCollection) => {
            const newConfig = configDeepCopy()
            const c = collection(newConfig, newCollection.id) as gRPCProtoSetConfig
            c.endpoint = newCollection.endpoint
            c.metadata = newCollection.metadata
            setConfig(newConfig)
        },
        updateInstance: (newInstance) => {
            const newConfig = configDeepCopy()
            const i = instance(newConfig, newInstance.id) as InstanceConfig<GrpcRequestValue, GrpcRequestTemplatePath>
            i.value = newInstance.value
            i.name = newInstance.name
            setConfig(newConfig)
        }
    }
}