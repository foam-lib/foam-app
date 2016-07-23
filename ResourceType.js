/**
 * Resource type representation.
 * @readonly
 * @enum {string}
 * @property {string} TEXT - Text resource
 * @property {string} IMAGE - Image resource
 * @property {string} VIDEO - Video resource
 * @property {string} JSON - JSON resource
 * @property {string} ARRAY_BUFFER - ArrayBuffer resource
 */
const ResourceType = Object.freeze({
    TEXT : 'text',
    IMAGE : 'image',
    VIDEO : 'video',
    JSON : 'json',
    ARRAY_BUFFER : 'arraybuffer'
});

export default ResourceType;