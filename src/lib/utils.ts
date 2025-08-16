export function jsonToString(json: {}) {

    return JSON.stringify(json, (_, v) =>
        typeof v === "bigint" ? v.toString() : v
    );
}