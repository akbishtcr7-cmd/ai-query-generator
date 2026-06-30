const { getGeminiModel } = require('../config/gemini');

// ─── Dummy data generators ───────────────────────────────────────────────────
const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randDate = (yearsBack = 2) => {
  const d = new Date();
  d.setFullYear(d.getFullYear() - Math.random() * yearsBack);
  return d.toISOString().split('T')[0];
};

const NAMES   = ['Aarav','Priya','Ravi','Sneha','Arjun','Meera','Vikram','Kavita','Amit','Pooja','Rohit','Anita','Suresh','Divya','Rahul'];
const CITIES  = ['Mumbai','Delhi','Bangalore','Hyderabad','Pune','Chennai','Kolkata','Jaipur','Surat','Lucknow'];
const PRODUCTS= ['Laptop','Smartphone','Tablet','Headphones','Keyboard','Mouse','Monitor','Webcam','Speaker','Charger'];
const EMAILS  = (name) => `${name.toLowerCase()}${randInt(10,99)}@gmail.com`;
const STATUSES= ['active','inactive','pending','completed','cancelled'];
const DEPTS   = ['Engineering','Marketing','Sales','HR','Finance','Operations','Design'];

/**
 * Generate dummy rows for a given table based on column definitions
 */
const generateDummyRows = (tableName, columns, count = 10) => {
  const rows = [];
  for (let i = 1; i <= count; i++) {
    const row = {};
    columns.forEach(col => {
      const c = col.name.toLowerCase();
      const t = (col.type || '').toUpperCase();

      if (col.isPrimary || c === 'id' || c.endsWith('_id') && i === 1) {
        row[col.name] = i;
      } else if (c.includes('name') && !c.includes('user')) {
        row[col.name] = rand(NAMES);
      } else if (c === 'username' || c.includes('user_name')) {
        const n = rand(NAMES); row[col.name] = n.toLowerCase() + randInt(1,99);
      } else if (c.includes('email')) {
        row[col.name] = EMAILS(rand(NAMES));
      } else if (c.includes('phone') || c.includes('mobile')) {
        row[col.name] = `+91 ${randInt(7000000000,9999999999)}`;
      } else if (c.includes('city') || c.includes('location')) {
        row[col.name] = rand(CITIES);
      } else if (c.includes('product') || c.includes('item')) {
        row[col.name] = rand(PRODUCTS);
      } else if (c.includes('price') || c.includes('amount') || c.includes('cost') || c.includes('salary')) {
        row[col.name] = randInt(500, 50000);
      } else if (c.includes('qty') || c.includes('quantity') || c.includes('count') || c.includes('stock')) {
        row[col.name] = randInt(1, 500);
      } else if (c.includes('status')) {
        row[col.name] = rand(STATUSES);
      } else if (c.includes('dept') || c.includes('department')) {
        row[col.name] = rand(DEPTS);
      } else if (c.includes('date') || c.includes('_at') || c.includes('time')) {
        row[col.name] = randDate();
      } else if (c.includes('age')) {
        row[col.name] = randInt(18, 60);
      } else if (c.includes('score') || c.includes('rating')) {
        row[col.name] = parseFloat((Math.random() * 5).toFixed(1));
      } else if (c.includes('address')) {
        row[col.name] = `${randInt(1,999)}, ${rand(CITIES)} Street`;
      } else if (c.includes('description') || c.includes('notes') || c.includes('comment')) {
        row[col.name] = `Sample ${tableName} description ${i}`;
      } else if (t.includes('INT') || t.includes('NUM') || t.includes('FLOAT') || t.includes('DOUBLE')) {
        row[col.name] = randInt(1, 1000);
      } else if (t.includes('BOOL')) {
        row[col.name] = Math.random() > 0.5;
      } else {
        row[col.name] = `${col.name}_value_${i}`;
      }
    });
    rows.push(row);
  }
  return rows;
};

/**
 * Use Gemini to infer schema from user's DB description
 */
const inferSchemaFromDescription = async (description, databaseType) => {
  const model = getGeminiModel();
  const prompt = `You are a database schema expert.
The user described their database: "${description}"
Database type: ${databaseType}

Infer the tables and columns. Return ONLY valid JSON like:
{
  "tables": [
    {
      "tableName": "users",
      "columns": [
        { "name": "id", "type": "INT", "isPrimary": true, "isNullable": false },
        { "name": "name", "type": "VARCHAR", "isPrimary": false, "isNullable": false },
        { "name": "email", "type": "VARCHAR", "isPrimary": false, "isNullable": false }
      ],
      "rowCount": 10
    }
  ]
}
Infer 2-5 tables with 3-8 columns each based on the description. No markdown, only JSON.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().replace(/```json|```/g, '').trim();
  return JSON.parse(text);
};

/**
 * Simulate query execution on virtual data
 * Returns modified virtual snapshot — never touches real DB
 */
const simulateQueryOnVirtualData = async (query, virtualData, tables, databaseType) => {
  const model = getGeminiModel();

  // Build a compact schema + sample data summary for Gemini
  const schemaSummary = tables.map(t => {
    const cols = t.columns.map(c => c.name).join(', ');
    const sample = (virtualData[t.tableName] || []).slice(0, 3);
    return `Table "${t.tableName}" (${cols})\nSample rows: ${JSON.stringify(sample)}`;
  }).join('\n\n');

  const prompt = `You are a database sandbox simulator. You NEVER execute real queries.
Your job: simulate what this ${databaseType} query would do on the virtual data below and return the result.

VIRTUAL SCHEMA & SAMPLE DATA:
${schemaSummary}

QUERY TO SIMULATE:
${query}

Rules:
- For SELECT: return matching rows from virtual data
- For INSERT: show the new row that would be added
- For UPDATE: show which rows would be changed and what they'd look like after
- For DELETE: show which rows would be removed
- For CREATE TABLE: describe the new table structure
- For ALTER: describe what would change
- NEVER say "I cannot execute" — always simulate a realistic result

Return ONLY valid JSON:
{
  "simulationType": "SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER|OTHER",
  "affectedTable": "table_name",
  "resultRows": [...],
  "rowsAffected": 0,
  "message": "Human-readable description of what happened",
  "beforeSnapshot": [...],
  "afterSnapshot": [...],
  "columns": ["col1", "col2"]
}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().replace(/```json|```/g, '').trim();
  try {
    return JSON.parse(text);
  } catch {
    return {
      simulationType: 'OTHER',
      affectedTable: '',
      resultRows: [],
      rowsAffected: 0,
      message: result.response.text(),
      columns: [],
    };
  }
};

/**
 * Check if query requires sandbox password (GRANT, REVOKE, DROP, etc.)
 */
const requiresSandboxPassword = (query) => {
  const upper = query.toUpperCase().trim();
  const sensitiveOps = [
    'GRANT', 'REVOKE', 'DROP DATABASE', 'DROP SCHEMA',
    'CREATE USER', 'ALTER USER', 'DROP USER',
    'TRUNCATE', 'DROP TABLE',
  ];
  return sensitiveOps.some(op => upper.includes(op));
};

module.exports = {
  generateDummyRows,
  inferSchemaFromDescription,
  simulateQueryOnVirtualData,
  requiresSandboxPassword,
};
