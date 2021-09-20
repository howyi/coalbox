import React from 'react';
import {GrpcRequestTemplatePath, GrpcRequestValue, InstanceConfig, TabConfig, TabId} from "../../types/config";
import {GRPCCallArea} from "./gRPCProtoSet/call/gRPCCallArea";
import {CoalboxController} from "../CoalboxWindow";

type Props = {
    instanceConfig?: InstanceConfig
    tabConfig: TabConfig
    controller: CoalboxController
}

export const CallArea: React.VFC<Props> = (props) => {
    switch (props.instanceConfig?.value.type) {
        case "GrpcRequest":
            return <GRPCCallArea
                tabConfig={props.tabConfig}
                instanceConfig={props.instanceConfig as InstanceConfig<GrpcRequestValue, GrpcRequestTemplatePath>}
                controller={props.controller}
            />
        case "HttpRequest":
            break
    }
    return <>INSTANCE NOT FOUND</>
}
