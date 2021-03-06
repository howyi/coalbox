export type ProtoOption = {[key in string]: string | number}

export type ExtraField = {
    comment?: string
    options?: ProtoOption
    filePath?: string
}

// TODO descriptor.protoから自動生成したい
export type MessageFieldType = 'TYPE_DOUBLE' |
    'TYPE_FLOAT' |
    'TYPE_INT64' |
    'TYPE_UINT64' |
    'TYPE_INT32' |
    'TYPE_FIXED64' |
    'TYPE_FIXED32' |
    'TYPE_BOOL' |
    'TYPE_STRING' |
    'TYPE_GROUP' |
    'TYPE_MESSAGE' |
    'TYPE_BYTES' |
    'TYPE_UINT32' |
    'TYPE_ENUM' |
    'TYPE_SFIXED32' |
    'TYPE_SFIXED64' |
    'TYPE_SINT32' |
    'TYPE_SINT64'
