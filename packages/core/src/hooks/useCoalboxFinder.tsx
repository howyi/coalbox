import React from "react";
import {
    CollectionConfig,
    CollectionId,
    InstanceConfig,
    InstancePath,
    TabConfig,
    TabId,
    TemplatePath
} from "../types/config";
import {useRecoilState} from "recoil";
import {coalboxConfigState} from "./useCoalbox";

export type CoalboxFinder = {
    collectionById: (id: CollectionId) => CollectionConfig | undefined
    instancesByTemplatePath: (path: TemplatePath) => InstanceConfig[]
    instanceByTabId: (id: TabId) => InstanceConfig | undefined
    tabByInstancePath: (path: InstancePath) => TabConfig | undefined
}

export const useCoalboxFinder = (): CoalboxFinder => {
    const [config] = useRecoilState(coalboxConfigState)
    return {
        collectionById: (id) => {
            let collection: CollectionConfig | undefined
            config.workspaces.forEach((ws) => {
                if (collection) {
                    return
                }
                collection = ws.collections.find((c) => {
                    return c.id == id
                })
            })
            return collection
        },
        instancesByTemplatePath: (path) => {
            const instances: InstanceConfig[] = []
            config.workspaces.forEach((ws) => {
                instances.push(...ws.instances.filter((i) => {
                    return compareTemplatePath(i.templatePath, path)
                }))
            })
            return instances
        },
        instanceByTabId: (tabId) => {
            let tab: TabConfig | undefined
            config.workspaces.forEach((ws) => {
                tab = ws.tabs.find((t) => {
                    return t.id == tabId
                })
            })
            if (!tab) {
                return
            }
            let instance: InstanceConfig | undefined
            config.workspaces.forEach((ws) => {
                instance = ws.instances.find((i) => {
                    return compareInstancePath({
                        workspaceId: ws.id,
                        instanceId: i.id
                    }, tab?.instancePath as InstancePath)
                })
            })
            return instance
        },
        tabByInstancePath: (path) => {
            let tab: TabConfig | undefined = undefined
            config.workspaces.forEach((ws) => {
                tab = ws.tabs.find((t) => {
                    return compareInstancePath(t.instancePath, path)
                })
            })
            return tab
        }
    }
}

function objectSort(obj: Object){

    const sorted = Object.entries(obj).sort();

    for(let i in sorted){
        const val = sorted[i][1];
        if(typeof val === "object"){
            sorted[i][1] = objectSort(val);
        }
    }

    return sorted;
}

const compareTemplatePath = (a: TemplatePath, b: TemplatePath): boolean => {
    return JSON.stringify(objectSort(a)) === JSON.stringify(objectSort(b))
}

const compareInstancePath = (a: InstancePath, b: InstancePath): boolean => {
    return JSON.stringify(objectSort(a)) === JSON.stringify(objectSort(b))
}