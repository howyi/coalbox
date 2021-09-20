import {ExtraField, ProtoOption} from "./ProtoField";
import {Deserialize, MethodDefinition, Serialize} from "@grpc/proto-loader";
import {ProtoType, ProtoMessageDefinition} from "./ProtoType";

export type ProtoServices = {
    [fullName in string]: ProtoService
}

export type ProtoRequest = {
    isStream: boolean
    typeName: string
    typeLink?: ProtoType
    serialize: Serialize<any>
    deserialize: Deserialize<any>
}

export type ProtoResponse = {
    isStream: boolean
    typeName: string
    typeLink?: ProtoType
    serialize: Serialize<any>
    deserialize: Deserialize<any>
}

export type ProtoServiceMethod = {
    name: string,
    path: string,
    request: ProtoRequest
    response: ProtoResponse
} & ExtraField

type ProtoServiceMethods = { [methodName in string]: ProtoServiceMethod }

type ProtoServiceDefinition = {
    [methodName in string]: MethodDefinition<any, any> & {
    requestType: {
        type: ProtoMessageDefinition
    }
    responseType: {
        type: ProtoMessageDefinition
    }
    }
}

export class ProtoService {
    public fullTypeName: string
    public methods: ProtoServiceMethods = {}

    public extra: ExtraField = {}

    raw: any

    constructor(fullTypeName: string, methods: ProtoServiceMethods, raw: any) {
        this.fullTypeName = fullTypeName
        this.methods = methods
        this.raw = raw
    }

    static fromMessageDefinition(fullTypeName: string, def: ProtoServiceDefinition) {
        const methods: ProtoServiceMethods = {}
        for (let methodName in def) {
            const methodDef = def[methodName]
            methods[methodName] = {
                name: methodName,
                path: methodDef.path,
                request: {
                    isStream: methodDef.requestStream,
                    typeName: methodDef.requestType.type.name,
                    serialize: methodDef.requestSerialize,
                    deserialize: methodDef.requestDeserialize,
                },
                response: {
                    isStream: methodDef.responseStream,
                    typeName: methodDef.responseType.type.name,
                    serialize: methodDef.responseSerialize,
                    deserialize: methodDef.responseDeserialize,
                }
            }
        }
        return new ProtoService(fullTypeName, methods, def)
    }

    setComment(comment: string) {
        this.extra.comment = comment
    }

    setOptions(options: ProtoOption) {
        this.extra.options = options
    }

    setMethodComment(name: string, comment: string) {
        this.methods[name].comment = comment
    }

    setMethodOption(name: string, options: ProtoOption) {
        this.methods[name].options = options
    }
}
