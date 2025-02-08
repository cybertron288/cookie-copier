// Mock CSS imports for Jest
module.exports = {
  process() {
    return {
      code: 'module.exports = {};',
    };
  },
  getCacheKey() {
    return 'css-transform';
  },
};