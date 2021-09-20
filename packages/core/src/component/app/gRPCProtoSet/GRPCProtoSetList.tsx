import React, {ReactNode} from 'react';
import {gRPCProtoSetConfig, GrpcRequestTemplatePath, InstanceConfig} from "../../../types/config";
import {ListLoadErrorMessage, ListLoadProgress, useListLoader} from "../list/ListLoader";
import * as path from "path";
import {GRPCProtoSetListTemplate} from "./GRPCProtoSetListTemplate";
import {useCoalboxProtoSet} from "../../../hooks/useCoalboxProtoSet";
import {GRPCIcon} from "../../../asset/gRPCIcon";
import {StyledTreeItem} from "../list/StyledTreeItem";
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import AppsIcon from '@mui/icons-material/Apps';
import {ProtoSet} from "@coalbox/proto-mapper";

type Props = {
    config: gRPCProtoSetConfig
}

export const GRPCProtoSetList: React.VFC<Props> = ({config}) => {
    const [protoSet, setProtoSet] = React.useState<ProtoSet>()
    const [protoSetState, setProtoSetState] = useCoalboxProtoSet()

    const load = async () => {
        const newProtoSet = await ProtoSet.loadFromPaths(config.filePaths, config.importPaths)
        setProtoSet(newProtoSet)
    }

    React.useEffect(() => {
        if (protoSet) {
            setProtoSetState({...protoSetState, [config.id]: protoSet})
        }
    }, [protoSet])

    const [isLoading, loadError] = useListLoader(load)

    return <>
        <StyledTreeItem
            nodeId={config.id}
            labelText={config.name}
            labelIcon={GRPCIcon}
        >
        {/*<TreeItem nodeId={config.id} label={config.name}>*/}
            {!isLoading && !loadError && protoSet &&
                <>
                    {protoSet.fileNames.map((fileName) => {
                        return <StyledTreeItem
                            nodeId={config.id + '.' + fileName}
                            labelText={path.parse(fileName).base}
                            key={fileName}
                            labelIcon={InsertDriveFileIcon}
                        >
                            {Object.keys(protoSet.files[fileName].services).map((serviceName) => {
                                const service = protoSet.files[fileName].services[serviceName]
                                return <StyledTreeItem
                                    nodeId={config.id + '.' + fileName + '.' + serviceName}
                                    labelText={serviceName}
                                    key={serviceName}
                                    labelIcon={AppsIcon}
                                >
                                    {Object.keys(service.methods).map((methodName) => {
                                        return <GRPCProtoSetListTemplate
                                            config={config}
                                            fileName={fileName}
                                            serviceName={serviceName}
                                            methodName={methodName}
                                            method={service.methods[methodName]}
                                            key={methodName}
                                        />
                                    })}
                                </StyledTreeItem>
                            })}
                        </StyledTreeItem>
                    })}
                </>
            }
        </StyledTreeItem>
        <ListLoadProgress isLoading={isLoading}/>
        <ListLoadErrorMessage loadError={loadError}/>
    </>
}
