import React, {ReactNode} from 'react';
import {
    gRPCProtoSetConfig,
    GrpcRequestTemplatePath, GrpcRequestValue,
    InstanceConfig,
    InstanceId,
} from "../../../types/config";
import {useCoalbox} from "../../../hooks/useCoalbox";
import {ProtoServiceMethod} from "@coalbox/proto-mapper";
import {defaultTabName} from "../../../const/default";
import {StyledTreeItem} from "../list/StyledTreeItem";

type Props = {
    config: gRPCProtoSetConfig
    fileName: string
    serviceName: string
    methodName: string
    method: ProtoServiceMethod
}

export const GRPCProtoSetListTemplate: React.VFC<Props> = (props) => {
    const {config, currentWorkspace} = useCoalbox()
    const [defaultInstance, setDefaultInstance] = React.useState<InstanceConfig>()
    const [additionalInstances, setAdditionalInstances] = React.useState<InstanceConfig[]>([])

    const {finder, command} = useCoalbox()

    const templatePath: GrpcRequestTemplatePath = {
        workspaceId: currentWorkspace.id,
        collectionId: props.config.id,
        protoFilename: props.fileName,
        serviceName: props.serviceName,
        methodName: props.methodName,
    }

    React.useEffect(() => {
        const instances = finder.instancesByTemplatePath(templatePath)
        let currentInstanceCount = defaultInstance ? 1 : 0
        currentInstanceCount += additionalInstances.length
        if (instances.length === currentInstanceCount) {
            return
        }
        if (instances.length < 1) {
            setDefaultInstance(undefined)
            setAdditionalInstances([])
        }
        if (instances.length == 1) {
            setDefaultInstance(instances[0])
            setAdditionalInstances([])
        }
        if (instances.length > 1) {
            setDefaultInstance(instances[0])
            setAdditionalInstances(instances.filter((i) => {
                return instances[0].id != i.id
            }))
        }
    }, [currentWorkspace.collections])

    const defaultValue = (): string => {
        console.log('METHOD', props.method.request.serialize({}))
        console.log('METHOD2', props.method.request.deserialize(Buffer.from("")))
        const deserialized = props.method.request.deserialize(Buffer.from(""))
        return JSON.stringify(deserialized, null , "\t")
    }

    const handleClickTemplate = () => {
        if (!defaultInstance) {
            const value: GrpcRequestValue = {
                type: 'GrpcRequest',
                body: defaultValue(),
            }
            command.newInstance(currentWorkspace.id, {
                templatePath: templatePath,
                value: value,
                name: props.methodName,
            }, true, true)
        } else if (defaultInstance) {
            focus(defaultInstance.id)
        }
    }

    const focus = (instanceId: InstanceId) => {
        const tab = finder.tabByInstancePath({
            workspaceId: currentWorkspace.id,
            instanceId: instanceId
        })
        if (tab) {
            command.focusTab(currentWorkspace.id, tab.id)
        } else {
            command.newTab({
                isPopUp: false,
                instancePath: {
                    workspaceId: currentWorkspace.id,
                    instanceId: instanceId
                }
            }, true)
        }
    }

    const handleDoubleClickTemplate = () => {
        // const value: GrpcRequestValue = {
        //     type: 'GrpcRequest',
        //     body: defaultValue(),
        // }
        // command.newInstance(currentWorkspace.id, {
        //     templatePath: templatePath,
        //     value: value,
        // }, true, true)
    }

    const handleClickInstance = (id: InstanceId) => {
        focus(id)
    }

    return <StyledTreeItem
        nodeId={props.config.id + '.' + props.fileName + '.' + props.serviceName + '.'+ props.methodName}
        labelText={props.methodName}
        onClick={() => {handleClickTemplate()}}
        onDoubleClick={() => {handleDoubleClickTemplate()}}
    >
        {additionalInstances.map((i) => {
            return <StyledTreeItem
                nodeId={props.config.id + '.' + props.fileName + '.' + props.serviceName + '.'+ props.methodName + '.' + i.id}
                labelText={'└ ' + (i.name ?? defaultTabName)}
                key={i.id}
                onClick={() => {handleClickInstance(i.id)}}
            />
        })}
    </StyledTreeItem>
}
