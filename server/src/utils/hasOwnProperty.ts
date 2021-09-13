export const hasOwnProperty = (object: any, property: any): boolean => {
    return (
        Object.prototype.hasOwnProperty.call(object, property) &&
        object[property] != null &&
        object[property] !== undefined
    )
}