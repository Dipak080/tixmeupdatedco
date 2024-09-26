// Import the uuid package
const { v4: uuidv4 } = require('uuid');

// Export a function that generates and returns a new UUID
exports.generateUUID = () => {
  return uuidv4();
};
