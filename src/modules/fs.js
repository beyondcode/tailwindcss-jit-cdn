let i = 0

module.exports = {
  statSync: () => {
    return { mtimeMs: ++i }
  },
  readFileSync: (id) => self[id] || '',
}