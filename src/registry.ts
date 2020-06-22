import { toProperCase } from "./util";
import { changeGraph } from "./change-graph";
import * as Types from "@babel/types";
import {compileType, CompileType, createStaticType} from "./type-creator";

type RegistryRecord = Record<string, CompileType | CompileType[]>;

interface RegistryState {
  type: string;
  record: RegistryRecord;
}

export interface Registry {
  add: (id: string, record: Record<string, CompileType>) => string;
  compile: () => Types.Program;
}

const getRecordSignature = (record: RegistryRecord) =>
  Buffer.from(Object.keys(record).join()).toString("base64");

const safeNameCreator = (namespace: Set<string>) => {
  const getSafeName = (baseName: string, check = 0): string => {
    const checkName = check === 0 ? baseName : `${baseName}${check}`;
    const safeName = /^[a-zA-Z]/.test(checkName)
      ? checkName
      : `Prop${checkName}`;

    if (namespace.has(safeName))
      return getSafeName(baseName, Number(check) + 1);

    namespace.add(safeName);

    return safeName;
  };

  return getSafeName;
};

const isEqualType = (a: CompileType, b: CompileType) : boolean => {
  if(a.type === "array" && b.type === "array"){
    return isEqualType(a.expr, b.expr)
  }else if(a.type === "tuple" && b.type === "tuple"){
    return a.params.every((exprA, idx) => isEqualType(exprA, b.params[idx]))
  }else if(a.type === "ident" && b.type === "ident"){
    return a.name === b.name;
  }

  return a.type === b.type;
};

const merge = (
  existing: RegistryRecord,
  toMerge: Record<string, CompileType>
) => {
  let didUpdate = false;

  Object.entries(existing).forEach(([k, v]) => {
    const right = toMerge[k];
    if (
      (Array.isArray(v) && !v.some((x) => isEqualType(x, right)))
        || (!Array.isArray(v) && !isEqualType(v, right))
    ) {
      existing[k] = Array.isArray(v) ? [...v, right] : [v, right];
      didUpdate = true;
    }
  });

  return didUpdate;
};

export const createRegistry = (): Registry => {
  const state = new Map<string, RegistryState>();
  const namespace = new Set<string>();
  const getSafeName = safeNameCreator(namespace);
  const changeset = changeGraph();

  const getNewName = (id: string, existingName: string) => {
    const potentialName = toProperCase(id);
    if (potentialName === existingName) return existingName;

    return getSafeName(potentialName + existingName);
  };

  const update = (
    id: string,
    signature: string,
    record: Record<string, CompileType>
  ) => {
    const { type: existingType, record: existingRecord } = state.get(
      signature
    )!;

    if (!merge(existingRecord, record)) return existingType;

    const newName = getNewName(id, existingType);

    if (newName !== existingType) {
      changeset.add(existingType, newName);
      namespace.delete(existingType)
    }

    state.set(signature, {
      type: newName,
      record: existingRecord,
    });

    return newName;
  };

  const insert = (
    id: string,
    signature: string,
    record: Record<string, CompileType>
  ) => {
    const type = getSafeName(toProperCase(id));

    state.set(signature, {
      type,
      record,
    });

    return type;
  };

  const extractUpToDateType = (type: CompileType) : CompileType => {
    if(type.type === "ident"){
      return {
        type: "ident",
        name: changeset.resolve(type.name)
      }
    }else if(type.type === "tuple"){
      return {
        type: "tuple",
        params: type.params.map(extractUpToDateType)
      }
    }else if(type.type === "array"){
      return {
        type: "array",
        expr: extractUpToDateType(type.expr)
      }
    }

    return type;
  };

  const compileRecord = (record: RegistryRecord) =>
    Types.objectExpression(
      Object.entries(record).map(([ident, type]) =>
        Types.objectProperty(
          Types.identifier(ident),
          Array.isArray(type)
            ? Types.callExpression(
                Types.identifier("RT.Union"),
                type.map(extractUpToDateType).map(compileType)
              )
            : compileType(extractUpToDateType(type))
        )
      )
    );

  // const resolve = (type: CompileType) => {
  //   if(type.type === "ident"){
  //     const result = Array.from(state).find(([_, v]) => v.type === type.name);
  //     if(!result) throw("???");
  //
  //     const resolved = resolveRecord(result[1].record);
  //
  //     // state.delete(result[0]);
  //     return resolved;
  //   }
  //
  //   return compileType(type);
  // };
  //
  // const resolveRecord = (record: RegistryRecord) : Types.ObjectExpression => {
  //   return Types.objectExpression(
  //       Object.entries(record).map(([ident, type]) =>
  //           Types.objectProperty(
  //               Types.identifier(ident),
  //               Array.isArray(type)
  //                   ? Types.callExpression(
  //                   Types.identifier("RT.Union"),
  //                   type.map(extractUpToDateType).map(resolve)
  //                   )
  //                   : resolve(extractUpToDateType(type))
  //           )
  //       )
  //   );
  // };

  return {
    add: (id: string, record: Record<string, CompileType>) => {
      const signature = getRecordSignature(record);

      if (state.has(signature)) {
        return update(id, signature, record);
      }

      return insert(id, signature, record);
    },
    compile: () => {
      const program = Types.program([
        Types.importDeclaration(
          [Types.importNamespaceSpecifier(Types.identifier("RT"))],
          Types.stringLiteral("runtypes")
        ),
      ]);

      for (const { type, record } of state.values()) {
        const recordNode = Types.callExpression(Types.identifier("RT.Record"), [
          compileRecord(record),
        ]);

        program.body.push(
          Types.exportNamedDeclaration(
            Types.variableDeclaration("const", [
              Types.variableDeclarator(Types.identifier(type), recordNode),
            ])
          ),
          Types.exportNamedDeclaration(
              createStaticType(type)
          )
        );
      }

      return program;
    },
  };
};
