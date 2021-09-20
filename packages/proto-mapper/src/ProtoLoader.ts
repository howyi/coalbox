import * as protoLoader from "@grpc/proto-loader";
import path from "path";
import fs from "fs";
import * as ProtoParser from "proto-parser";
import {
    EnumDefinition,
    MessageDefinition,
    NamespaceDefinition,
    ProtoRoot,
    ServiceDefinition,
    SyntaxType
} from "proto-parser";
import {ProtoType, ProtoTypes} from "./ProtoType";
import {ProtoService, ProtoServices} from "./ProtoService";
import {ProtoFile} from "./ProtoFile";

export type ProtoLoaderProto = protoLoader.PackageDefinition
export type ProtoParserProto = ProtoParser.ProtoDocument

export const loadFromPath = async (fileName: string, includeDirs: string[]): Promise<ProtoFile> => {
    const packageDefinition =  await protoLoader.load(fileName, {
        includeDirs: [
            ...includeDirs
        ],
        defaults: true,
        longs: String,
        arrays: true,
        keepCase: false // trueにしても正常に動作しない
    });
    const protoTypes: ProtoTypes = {};
    const protoServices: ProtoServices = {};
    recursiveExpandProto(packageDefinition, protoTypes, protoServices)

    const file = fs.readFileSync(fileName, 'utf-8');
    // 別ファイル同一packageの参照が解決できないため、ProtoParserではresolveしない
    const protoDocument = ProtoParser.parse(file, {keepCase: false, resolve: false}) as ProtoParserProto;
    const loadedProtoRawTexts: {[path in string]: string } = {[fileName]: file}
    const loadedProtoDocuments: {[path in string]: ProtoParserProto } = {[fileName]: protoDocument}
    loadImportProtoDocuments(protoDocument, includeDirs, loadedProtoDocuments, loadedProtoRawTexts)
    const protoFile = new ProtoFile(
        fileName,
        protoServices,
        protoTypes,
        loadedProtoRawTexts
    )
    for (let filePath in loadedProtoDocuments) {
        const doc = loadedProtoDocuments[filePath]
        if (doc.syntaxType != SyntaxType.ProtoDocument) {
            continue
        }
        reflectParsedProto(filePath, doc.root, protoFile)
    }

    protoFile.link()
    return protoFile
}

const recursiveExpandProto = (protoLoaderProto: ProtoLoaderProto, expandedProtoDocument: ProtoTypes, expandedServiceDocument: ProtoServices) => {
    Object.keys(protoLoaderProto).forEach((key) => {
        const def = protoLoaderProto[key]
        if ('type' in def) {
            recursiveExpandProtoDef(def.type, expandedProtoDocument, key, true)
        } else {
            expandedServiceDocument[key] = ProtoService.fromMessageDefinition(key, def as any)
        }
    })
}

const recursiveExpandProtoDef = (def: any, expandedProtoDocument: ProtoTypes, keyPrefix: string, isFirst: boolean) => {
    if (def) {
        // @ts-ignore
        const name = isFirst ? keyPrefix : keyPrefix + `.` + def['name'] as string
        // @ts-ignore
        if ('nestedType' in def && def['nestedType'].length > 0) {
            for (let key in def['nestedType']) {
                recursiveExpandProtoDef(def['nestedType'][key], expandedProtoDocument, `${name}`, false)
            }
        }
        // @ts-ignore
        if ('enumType' in def && def['enumType'].length > 0) {
            for (let key in def['enumType']) {
                const enumName = name + '.' + def['enumType'][key].name
                expandedProtoDocument[enumName] = ProtoType.fromMessageDefinition(enumName, def['enumType'][key])
            }
        }

        if ('value' in def) {
            expandedProtoDocument[name] = ProtoType.fromMessageDefinition(name, def)
        } else {
            expandedProtoDocument[name] = ProtoType.fromMessageDefinition(name, def)
        }
    }
}

const loadImportProtoDocuments = (
    protoDocument: ProtoParserProto,
    includeDirs: string[],
    loadedDocuments: {[path in string]: ProtoParserProto },
    loadedRawTexts: {[path in string]: string }
) => {
    protoDocument.imports?.forEach((importPath) => {
        let found = false
        includeDirs.forEach((dir) => {
            const realPath = path.join(dir, importPath)
            if (fs.existsSync(realPath)) {
                const file = fs.readFileSync(realPath, 'utf-8');
                const resolvedProtoDocument = ProtoParser.parse(file, {keepCase: false, resolve: false}) as ProtoParserProto;
                loadedDocuments[realPath] = resolvedProtoDocument
                loadedRawTexts[realPath] = file
                loadImportProtoDocuments(resolvedProtoDocument, includeDirs, loadedDocuments, loadedRawTexts)
                found = true
            }
        })
        if (!found) {
            // https://github.com/grpc/grpc-node/pull/1299/files#diff-9c15c8f57dc187f3e6cc257a0bbef014f68a534801cee46899d2232e2cc1e6caR305
            // 本来はprotoLoader.loadでのemitWarningを拾いたいが、例外化できないのでこちらでresolveエラーを出す
            throw new Error(`${importPath} not found in any of the include paths`)
        }
    })
}

type Def =  NamespaceDefinition | MessageDefinition | ProtoRoot | ServiceDefinition | EnumDefinition

const reflectParsedProto = (
    filePath: string,
    doc: Def,
    protoFile: ProtoFile,
    namespace: string = '',
) => {
    const fullName = namespace + doc.name
    switch (doc.syntaxType) {
        case SyntaxType.ProtoRoot:
        case SyntaxType.NamespaceDefinition:
            if (protoFile.filePath == filePath) {
                protoFile.extra.comment = doc.comment ?? protoFile.extra.comment
                protoFile.extra.options = {
                    ...protoFile.extra.options,
                    ...doc.options
                }
                protoFile.extra.filePath = filePath
            }
            if (doc.name != '') {
                namespace += doc.name + '.'
            }
            break
        case SyntaxType.ServiceDefinition:
            const key = namespace + doc.name
            const pService = protoFile.services[key]
            if (pService instanceof ProtoService) {
                if (protoFile.filePath != filePath) {
                    delete protoFile.services[key]
                    break
                }
                for (let methodsKey in doc.methods) {
                    const m = doc.methods[methodsKey]
                    pService.methods[methodsKey].comment = m.comment
                    pService.methods[methodsKey].options = m.options
                    pService.methods[methodsKey].request.typeName = m.requestType.value
                    pService.methods[methodsKey].response.typeName = m.responseType.value
                }
                pService.setComment(doc.comment ?? '')
                pService.setOptions(doc.options ?? {})
                pService.extra.filePath = filePath
            } else {
                console.warn('coalbox: service not found', fullName)
            }
            break
        case SyntaxType.MessageDefinition:
        case SyntaxType.EnumDefinition:
            const pMessage = protoFile.types[fullName]
            if (pMessage instanceof ProtoType) {
                namespace += doc.name + '.'
                pMessage.setComment(doc.comment ?? '')
                pMessage.setOptions(doc.options ?? {})
                pMessage.extra.filePath = filePath
                if (doc.syntaxType == SyntaxType.MessageDefinition) {
                    for (let oneofsKey in doc.oneofs) {
                        const oneof = doc.oneofs[oneofsKey]
                        pMessage.addOneOfKeys(oneofsKey, {
                            keys: oneof.oneof,
                            comment: oneof.comment,
                            options: oneof.options,
                            filePath: filePath
                        })
                    }
                    for (let key in pMessage.fields) {
                        const parsedField = doc.fields[key]
                        if (parsedField) {
                            pMessage.fields[key].comment = parsedField.comment
                            pMessage.fields[key].options = parsedField.options
                        } else if (!pMessage.fields[key].isExtended && !pMessage.fields[key].extendee) {
                            console.warn('coalbox: message field not found', doc.fields, pMessage , fullName, key, filePath)
                        }
                        pMessage.fields[key].filePath = filePath
                    }
                }
            } else {
                console.warn('coalbox: message not found', fullName)
            }
            break
    }
    // console.log('coalbox', fullName, doc)
    for (let nestedKey in doc.nested) {
        reflectParsedProto(filePath, doc.nested[nestedKey] as Def, protoFile, namespace)
    }
}