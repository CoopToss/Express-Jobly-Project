const { sqlForPartialUpdate } = require('./sql');

describe("sqlForPartialUpdate", function () {
  test("works: 1 item", function () {
    const result = sqlForPartialUpdate(
      { firstName: 'Aliya' },
      { firstName: 'first_name' }
    );
    expect(result).toEqual({
      setCols: "\"first_name\"=$1",
      values: ['Aliya']
    });
  });

  test("works: 2 items", function () {
    const result = sqlForPartialUpdate(
      { firstName: 'Aliya', age: 32 },
      { firstName: 'first_name', age: 'age' }
    );
    expect(result).toEqual({
      setCols: "\"first_name\"=$1, \"age\"=$2",
      values: ['Aliya', 32]
    });
  });

  test("works: no jsToSql mapping", function () {
    const result = sqlForPartialUpdate(
      { firstName: 'Aliya', age: 32 },
      {}
    );
    expect(result).toEqual({
      setCols: "\"firstName\"=$1, \"age\"=$2",
      values: ['Aliya', 32]
    });
  });

  test("throws error with no data", function () {
    expect(() => {
      sqlForPartialUpdate({}, {});
    }).toThrowError("No data");
  });
});
