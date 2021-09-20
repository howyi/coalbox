export type WorkspaceId = string
export type CollectionId = string
export type TabId = string
export type InstanceId = string

export type CoalboxConfig = {
    workspaces: WorkspaceConfig[]
    currentWorkspaceId?: WorkspaceId
}

export type WorkspaceConfig = {
    id: WorkspaceId
    name: string
    collections: CollectionConfig[]
    foregroundTabId?: TabId
    tabs: TabConfig[]
    instances: InstanceConfig[]
}

export type TabConfig = {
    id: TabId
    isPopUp: boolean
    instancePath: InstancePath
}

export type InstancePath = {
    workspaceId: WorkspaceId
    instanceId: InstanceId
}

export type TemplatePath = GrpcRequestTemplatePath | HttpRequestTemplatePath;

export type GrpcRequestTemplatePath = {
    workspaceId: WorkspaceId
    collectionId: CollectionId
    protoFilename: string
    serviceName: string
    methodName: string
}

export type HttpRequestTemplatePath = {
    workspaceId: WorkspaceId
    collectionId: CollectionId
}

export type InstanceConfig<T = GrpcRequestValue | HttpRequestValue, U = TemplatePath> = {
    id: InstanceId
    templatePath: U
    value: T
    name?: string
}

export type GrpcRequestValue = {
    type: 'GrpcRequest'
    body: string
}

export type HttpRequestValue = {
    type: 'HttpRequest'
    body: string
    method: string
}

export type CollectionType = 'gRPCProtoSet'
    | 'HttpRequest'
    | 'HttpRequestGroup'
    | 'Swagger'
    | 'GraphQLSet'

export type CollectionConfig = gRPCProtoSetConfig | HttpRequestConfig

export type BaseCollectionConfig = {
    id: CollectionId
    type: CollectionType
    name: string
}

export type Endpoint = {
    url: string
    serverCertificate: boolean
}

export type gRPCProtoSetConfig = BaseCollectionConfig & {
    type: "gRPCProtoSet"
    endpoint: Endpoint
    filePaths: string[]
    importPaths: string[]
    metadata: string
}

export type HttpRequestConfig = BaseCollectionConfig & {
    type: "HttpRequest"
    endpoint: Endpoint
}