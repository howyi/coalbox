import {loadFromPath} from "./ProtoLoader";
import {ProtoFiles} from "./ProtoFile";

export class ProtoSet {
    public fileNames: string[]
    public includeDirs: string[]

    public files: ProtoFiles

    constructor(fileNames: string[], includeDirs: string[], files: ProtoFiles) {
        this.fileNames = fileNames
        this.includeDirs = includeDirs
        this.files = files
    }

    async reload(): Promise<void> {
        const protoFiles: ProtoFiles = {}
        for (const f of this.fileNames) {
            protoFiles[f] = await loadFromPath(f, this.includeDirs)
        }
        this.files = protoFiles
    }

    static async loadFromPaths(fileNames: string[], includeDirs: string[]): Promise<ProtoSet> {
        const protoFiles: ProtoFiles = {}
        for (const f of fileNames) {
            protoFiles[f] = await loadFromPath(f, includeDirs)
        }
        return new ProtoSet(fileNames, includeDirs, protoFiles)
    }
}
