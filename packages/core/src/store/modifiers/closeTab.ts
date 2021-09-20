import {CoalboxConfig, TabConfig, TabId, WorkspaceConfig, WorkspaceId} from "../../types/config";
import {getWorkspace} from "../queries/getWorkspace";

export const closeTab = (
    config: CoalboxConfig,
    workspaceId: WorkspaceId,
    tabId: TabId
): void => {
    const w = getWorkspace(config, workspaceId)
    const tabIndex = moveNextTab(w, tabId)
    w.tabs.splice(tabIndex, 1)
}

const moveNextTab = (
    workspace: WorkspaceConfig,
    tabId: TabId
): number => {
    let currentTabIndex: number | undefined
    workspace.tabs.forEach((t, i) => {
        if (t.id === tabId) {
            currentTabIndex = i
        }
    })
    if (currentTabIndex === undefined) {
        throw new Error('tab not found')
    }

    if (workspace.foregroundTabId == tabId) {
        const leftTab = workspace.tabs?.[currentTabIndex - 1]
        if (leftTab) {
            workspace.foregroundTabId = leftTab.id
            return currentTabIndex
        }
        const rightTab = workspace.tabs?.[currentTabIndex + 1]
        if (rightTab) {
            workspace.foregroundTabId = rightTab.id
            return currentTabIndex
        }
        workspace.foregroundTabId = undefined
    }
    return currentTabIndex
}