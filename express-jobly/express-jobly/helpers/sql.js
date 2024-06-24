const { BadRequestError } = require("../expressError");

/**
 * Generates a SQL statement for partially updating a record.
 *
 * @param {Object} dataToUpdate - The data to update in key-value pairs.
 * @param {Object} jsToSql - An object that maps JavaScript-style data fields to SQL column names.
 *
 * @returns {Object} - An object containing:
 *   - {String} setCols - A string of the column names and their new values, formatted for a SQL UPDATE statement.
 *   - {Array} values - An array of the values to be updated.
 *
 * @throws {Error} - If no data is provided to update.
 *
 * @example
 * const { setCols, values } = sqlForPartialUpdate(
 *   { firstName: 'Aliya', age: 32 },
 *   { firstName: "first_name", age: "age" }
 * );
 * // setCols: '"first_name"=$1, "age"=$2'
 * // values: ['Aliya', 32]
 */

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
