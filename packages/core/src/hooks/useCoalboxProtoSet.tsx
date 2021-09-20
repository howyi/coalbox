import React from "react";
import {CollectionId} from "../types/config";
import {atom, useRecoilState} from "recoil";
import {ProtoSet} from "@coalbox/proto-mapper";

type ProtoSetState = {[id in CollectionId]: ProtoSet}

export const coalboxProtoSetState = atom<ProtoSetState>({
    key: 'coalbox/ProtoSet',
    default: {},
});

export const useCoalboxProtoSet = () => {
    return useRecoilState(coalboxProtoSetState)
}