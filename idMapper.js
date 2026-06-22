const uuidToIntMap = new Map();
const intToUuidMap = new Map();
let nextIntId = 1; // counter for generating new integer IDs

// Registers a persistent ID mapping from the database on startup
export const registerId = (uuid, intId) => {
    if (!uuid || !intId) return;
    uuidToIntMap.set(uuid, intId);
    intToUuidMap.set(Number(intId), uuid);
    if (Number(intId) >= nextIntId) {
        nextIntId = Number(intId) + 1;
    }
};

// number (int) to string (UUID) mapping
export const getIntId = (uuid) => {
    if (!uuid) return null;
    
    // check if we already have a mapping for this UUID, if so return the existing integer ID 
    if (uuidToIntMap.has(uuid)) {
      return uuidToIntMap.get(uuid);
    }
    
    // if this is a new UUID, assign it a new integer ID
    const currentId = nextIntId++;
    uuidToIntMap.set(uuid, currentId);
    intToUuidMap.set(currentId, uuid);
    
    return currentId;
};

// number (int) to string (UUID) mapping
export const getUuid = (intId) => {
    return intToUuidMap.get(Number(intId)) || null;
};