import {toProperCase} from "./util";
import {changeGraph} from "./change-graph";
import * as Types from "@babel/types";

type RegistryRecord = Record<string, string|string[]>

interface RegistryState{
    type: string;
    record: RegistryRecord;
}

export interface Registry {
    add: (id: string, record: Record<string, string>) => string,
    compile: () => Types.Program
}

const getRecordSignature = (record: RegistryRecord) =>
    Buffer.from(Object.keys(record).join()).toString('base64');

const safeNameCreator = (namespace: Set<string>) => {
    const getSafeName = (baseName: string, check = 0) : string => {
        const checkName = check === 0 ? baseName : `${baseName}${check}`;
        const safeName = /^[a-zA-Z]/.test(checkName) ? checkName : `Prop${checkName}`;

        if (namespace.has(safeName))
            return getSafeName(baseName, Number(check) + 1);

        namespace.add(safeName);

        return safeName;
    };

    return getSafeName;
};

const merge = (existing: RegistryRecord, toMerge: Record<string, string>) => {
    let didUpdate = false;

    Object.entries(existing).forEach(([k, v]) => {
        const right = toMerge[k];
        if(
            (Array.isArray(v) && !v.includes(right))
            || v !== right
        ){
            existing[k] = Array.isArray(v) ? [...v, right] : [v, right];
            didUpdate = true;
        }
    });

    return didUpdate;
};

export const registry = (): Registry => {
    const state = new Map<string, RegistryState>();
    const namespace = new Set<string>();
    const getSafeName = safeNameCreator(namespace);
    const changeset = changeGraph();

    const getNewName = (id: string, existingName: string) => {
        const potentialName = toProperCase(id);
        if(potentialName === existingName) return existingName;

        return getSafeName(potentialName+existingName);
    };

    const update = (id: string, signature: string, record: Record<string, string>) => {
        const {type: existingType, record: existingRecord} = state.get(signature)!;

        if(!merge(existingRecord, record)) return existingType;

        const newName = getNewName(id, existingType);

        if(newName === existingType){
            changeset.add(existingType, newName);
        }

        state.set(signature, {
            type: newName,
            record: existingRecord
        });

        return newName;
    };

    const insert = (id: string, signature: string, record: Record<string, string>) => {
        const type = getSafeName(toProperCase(id));

        state.set(signature, {
            type,
            record
        });

        return type;
    };

    return {
        add: (id: string, record: Record<string, string>) => {
            const signature = getRecordSignature(record);

            if(state.has(signature)){
                return update(id, signature, record);
            }

            return insert(id, signature, record);
        },
        compile: () => {
            const program = Types.program([
               Types.importDeclaration(
                   [
                       Types.importNamespaceSpecifier(
                           Types.identifier("RT")
                       )
                   ],
                   Types.stringLiteral("runTypes")
               )
            ]);

            //compile registry

            return program;
        },
    }
};