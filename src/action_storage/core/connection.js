// connection 负责与服务端同步
class Connection {
  async getEntriesByPrefixes (prefixes) {
    // input ['a', 'b:c:d']
    // output [[[key,val],[key,val]], ...]
    return []
  }
  async syncEntries (entries) {
  }
}
export default Connection
