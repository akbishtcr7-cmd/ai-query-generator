const formatQuery = (query, dbType) => {
  if (!query) return query;
  
  const keywords = [
    'SELECT', 'FROM', 'WHERE', 'JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN',
    'ON', 'AND', 'OR', 'ORDER BY', 'GROUP BY', 'HAVING', 'LIMIT', 'OFFSET',
    'INSERT INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE FROM', 'CREATE TABLE',
    'ALTER TABLE', 'DROP TABLE', 'INDEX', 'DISTINCT', 'COUNT', 'SUM', 'AVG',
    'MAX', 'MIN', 'AS', 'IN', 'NOT IN', 'BETWEEN', 'LIKE', 'IS NULL', 'IS NOT NULL',
    'UNION', 'INTERSECT', 'EXCEPT', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END',
    'WITH', 'RETURNING', 'EXPLAIN',
  ];

  let formatted = query.trim();
  
  // Add newlines before major clauses
  const majorClauses = ['SELECT', 'FROM', 'WHERE', 'JOIN', 'LEFT JOIN', 'RIGHT JOIN',
    'INNER JOIN', 'ORDER BY', 'GROUP BY', 'HAVING', 'LIMIT', 'UNION'];
  
  majorClauses.forEach(clause => {
    const regex = new RegExp(`\\b${clause}\\b`, 'gi');
    formatted = formatted.replace(regex, `\n${clause}`);
  });

  // Add newline before AND/OR in WHERE
  formatted = formatted.replace(/\bAND\b/gi, '\n  AND');
  formatted = formatted.replace(/\bOR\b/gi, '\n  OR');

  return formatted.trim();
};

const minifyQuery = (query) => {
  if (!query) return query;
  return query.replace(/\s+/g, ' ').trim();
};

const analyzeQueryStats = (query) => {
  if (!query) return {};
  const upper = query.toUpperCase();
  
  const joinCount = (upper.match(/\bJOIN\b/g) || []).length;
  const subqueryCount = (upper.match(/\bSELECT\b/g) || []).length - 1;
  const queryLength = query.length;
  
  let complexity = 'Low';
  if (joinCount > 3 || subqueryCount > 2 || queryLength > 500) complexity = 'High';
  else if (joinCount > 1 || subqueryCount > 0 || queryLength > 200) complexity = 'Medium';

  return {
    queryLength,
    numberOfJoins: joinCount,
    numberOfSubqueries: Math.max(0, subqueryCount),
    complexity,
    hasGroupBy: upper.includes('GROUP BY'),
    hasOrderBy: upper.includes('ORDER BY'),
    hasHaving: upper.includes('HAVING'),
    hasDistinct: upper.includes('DISTINCT'),
  };
};

module.exports = { formatQuery, minifyQuery, analyzeQueryStats };
