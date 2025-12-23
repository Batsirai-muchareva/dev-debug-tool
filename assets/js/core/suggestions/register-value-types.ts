import { createValueTypeRegistry } from "@app/suggestions/create-value-type-registry";

const { registerValueType, resolveValueType, getValueTypes } = createValueTypeRegistry();

const registerSuggestionValueTypes = () => {
    registerValueType( {
        type: "object",
        match: ( value ) => typeof value === "object" && value !== null && ! Array.isArray( value ),
        format: ( value ) => `Object with ( ${ Object.keys( value as object ).length } properties)`,
        isEmpty: (v) => Object.keys(v).length === 0,
        meta: { name: "Objects", icon: "📦", label: "Object" }
    } );

    registerValueType( {
        type: "array",
        match: Array.isArray,
        format: ( value ) => `Array (${ ( value as unknown[] ).length } items)`,
        isEmpty: ( value) => value.length === 0,
        meta: { name: "Arrays", icon: "📚", label: "Array" }
    } );
    // registerType({
    //     type: "object",
    //     match: (v) => typeof v === "object" && v !== null && !Array.isArray(v),
    //     format: (v) => `Object (${Object.keys(v).length} props)`,
    //     meta: { name: "Objects", icon: "📦", label: "Object" }
    // });
}

export {
    registerSuggestionValueTypes,
    resolveValueType,
    getValueTypes,
}
