import {CoalboxConfig, WorkspaceConfig, WorkspaceId} from "../../types/config";

export const findWorkspace = (
    config: CoalboxConfig,
    workspaceId: WorkspaceId
): WorkspaceConfig | undefined => {
    const w = config.workspaces.find((w) => {
        return w.id === workspaceId
    })
    return w
}

export const getWorkspace = (
    config: CoalboxConfig,
    workspaceId: WorkspaceId
): WorkspaceConfig => {
    const w = findWorkspace(config, workspaceId)
    if (!w) {
        throw Error ('workspace not found')
    }
    return w
}