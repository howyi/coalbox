import React from 'react';
import {CollectionConfig} from "../../../types/config";
import {GRPCProtoSetList} from "../gRPCProtoSet/GRPCProtoSetList";
import {HttpRequestList} from "./HttpRequestList";

type Props = {
    config: CollectionConfig
}

export const CollectionList: React.VFC<Props> = ({config}) => {
    switch (config.type) {
        case "gRPCProtoSet":
            return <GRPCProtoSetList config={config}/>
        case "HttpRequest":
            return <HttpRequestList config={config}/>
    }
}
