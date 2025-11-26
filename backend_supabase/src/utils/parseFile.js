const xlsx = require('xlsx');

function parseBufferToJson(buffer, filename) {
  const ext = filename.split('.').pop().toLowerCase();
  if(ext === 'csv') {
    const str = buffer.toString('utf8');
    const lines = str.split(/\r?\n/).filter(Boolean);
    const headers = lines[0].split(',');
    const rows = lines.slice(1).map(line=> {
      const cols = line.split(',');
      const obj = {};
      headers.forEach((h,i)=> obj[h.trim()] = cols[i] ? cols[i].trim() : '');
      return obj;
    });
    return rows;
  } else {
    const workbook = xlsx.read(buffer, {type: 'buffer'});
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const json = xlsx.utils.sheet_to_json(worksheet, {defval: ''});
    return json;
  }
}

module.exports = { parseBufferToJson };
