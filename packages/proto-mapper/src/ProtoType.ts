import {ExtraField, MessageFieldType, ProtoOption} from "./ProtoField";

type MessageField = {
    number: number
    type: MessageFieldType // descriptor.proto FieldDescriptorProto.Type
    typeName: string
    typeLink?: ProtoType
    isOptional: boolean
    isRepeated: boolean
    isExtended: boolean
    extendee?: string
} & ExtraField

type MessageFields = {[name in string]: MessageField}

type OneOfKey = {
    keys: string[]
} & ExtraField

type OneOfKeys = {[name in string]: OneOfKey}
type ReservedFields = {
    names?: string[],
    ranges?: {
      start: number
      end: number
    }[]
}

type ProtoFieldDefinition = {
    name: string,
    number: number,
    type: string,
    extendee?: string,
    typeName: string,
    label: 'LABEL_OPTIONAL' | 'LABEL_REQUIRED' | 'LABEL_REPEATED'
}

export type ProtoMessageDefinition = {
    field?: ProtoFieldDefinition[]
    name: string
    options?: {
        mapEntry?: boolean
    },
    reservedName: string[],
    reservedRange: {
        start: number,
        end: number,
    }[],
    value?: {
        name: string,
        number: number,
        options?: {
        },
    }[]
}

type ProtoEnumValue = {
    number: number
} & ExtraField

type ProtoEnumValues =  {[name in string]: ProtoEnumValue}

export type ProtoTypes = {
    [fullName in string]: ProtoType
}

export class ProtoType {
    public fullTypeName: string
    public fields: MessageFields = {}
    public reservedFields: ReservedFields = {}

    public oneOfKeys: OneOfKeys = {}
    public extra: ExtraField = {}

    public isMap: boolean = false
    public mapKeyType: string = '' // descriptor.proto FieldDescriptorProto.Type

    public isEnum: boolean = false
    public enumValues: ProtoEnumValues = {} // descriptor.proto FieldDescriptorProto.Type

    raw: any

    constructor(
        fullTypeName: string,
        fields: MessageFields,
        isMap: boolean,
        mapKeyType: string,
        raw: any,
        reservedFields: ReservedFields,
        isEnum: boolean,
        enumValues: ProtoEnumValues,
    ) {
        this.fullTypeName = fullTypeName
        this.fields = fields
        this.isMap = isMap
        this.mapKeyType = mapKeyType
        this.raw = raw
        this.reservedFields = reservedFields
        this.isEnum = isEnum
        this.enumValues = enumValues
    }

    static fromMessageDefinition(fullTypeName: string, def: ProtoMessageDefinition) {
        const fields: MessageFields = {}
        const reservedFields: ReservedFields = {}
        let isMap = false
        let isEnum = false
        let enumValues: ProtoEnumValues = {}
        let mapKeyType = ''
        if (def?.options?.mapEntry) {
            isMap = true
            def.field?.forEach((f) => {
                switch (f.name) {
                    case 'key':
                        mapKeyType = f.type
                        break;
                    case 'value':
                        fields['value'] = ProtoType.defToField(f)
                        break;
                }
            })
        } else if (def.value) {
            isEnum = true
            def.value?.forEach((v) => {
                enumValues[v.name] = {number: v.number}
            })
        } else {
            def.field?.forEach((f) => {
                fields[f.name] = ProtoType.defToField(f)
            })
        }
        if (def.reservedName) {
            reservedFields.names = def.reservedName
        }
        if (def.reservedRange) {
            reservedFields.ranges = def.reservedRange
        }
        return new ProtoType(fullTypeName, fields, isMap, mapKeyType, def, reservedFields, isEnum, enumValues)
    }

    static defToField(f: ProtoFieldDefinition): MessageField {
        return {
            number: f.number,
            type: f.type as MessageFieldType,
            typeName: f.typeName,
            isOptional: f.label === "LABEL_OPTIONAL",
            isRepeated: f.label === "LABEL_REPEATED",
            isExtended: f.name.startsWith('.'),
            extendee: f.extendee ?? undefined,
        }
    }

    addOneOfKeys(name: string, oneOfKey: OneOfKey) {
        this.oneOfKeys[name] = oneOfKey
    }

    setComment(comment: string) {
        this.extra.comment = comment
    }

    setOptions(options: ProtoOption) {
        this.extra.options = options
    }

    setFieldComment(key: string, comment: string) {
        this.fields[key].comment = comment
    }

    setFieldOption(key: string, options: ProtoOption) {
        this.fields[key].options = options
    }
}
