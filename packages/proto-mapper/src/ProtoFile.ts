import {ProtoServices} from "./ProtoService";
import {ExtraField, ProtoOption} from "./ProtoField";
import {ProtoType, ProtoTypes} from "./ProtoType";

export type ProtoFiles = {[filePath in string]: ProtoFile }

type ProtoRawTexts = {[path in string]: string }

export class ProtoFile {
    public filePath: string
    public services: ProtoServices
    public types: ProtoTypes
    public rawTexts: ProtoRawTexts

    public extra: ExtraField = {}

    constructor(filePath: string, services: ProtoServices, types: ProtoTypes, rawTexts: ProtoRawTexts) {
        this.filePath = filePath
        this.services = services
        this.types = types
        this.rawTexts = rawTexts
    }

    setComment(comment: string) {
        this.extra.comment = comment
    }

    setOption(options: ProtoOption) {
        this.extra.options = options
    }

    link() {
        for (let servicesName in this.services) {
            for (let methodsName in this.services[servicesName].methods) {
                const method = this.services[servicesName].methods[methodsName]
                method.request.typeLink = findType(servicesName, method.request.typeName, this.types) ?? undefined
                method.response.typeLink = findType(servicesName, method.response.typeName, this.types) ?? undefined
            }
        }
        for (let typeKey in this.types) {
            for (let fieldName in this.types[typeKey].fields) {
                const field = this.types[typeKey].fields[fieldName]
                if (['TYPE_MESSAGE', 'TYPE_ENUM'].includes(field.type)) {
                    field.typeLink = findType(typeKey, field.typeName, this.types) ?? undefined
                }
            }
        }
    }
}

const findType = (currentName: string, findName: string, types: ProtoTypes): ProtoType | void => {
    for (let key of generateCandidateKey(currentName, findName)) {
        const type = types[key]
        if (type) {
            return type
        }
    }
    console.log('coalbox not found', currentName, findName)
}

const generateCandidateKey = (currentName: string, findName: string): string[] => {
    const candidateKeys = [findName]
    let name = ''
    const splitCurrent = currentName.split('.')
    splitCurrent.forEach(s => {
        name += s + '.'
        candidateKeys.push(name + findName)
    })
    candidateKeys.reverse()
    return candidateKeys
}