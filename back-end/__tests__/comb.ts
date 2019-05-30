import comb from "../comb";

describe("util strict()", () => {
  it("can deal with object within multi string", () => {
    const dft = {
      username: "",
      password: ""
    };
    let strictBody = comb(undefined, dft);
    expect(strictBody);
    expect(strictBody.username).toBe("");
    expect(strictBody.password).toBe("");

    strictBody = comb({}, dft);
    expect(strictBody);
    expect(strictBody.username).toBe("");
    expect(strictBody.password).toBe("");

    strictBody = comb({ username: "me" }, dft);
    expect(strictBody);
    expect(strictBody.username).toBe("me");
    expect(strictBody.password).toBe("");

    strictBody = comb({ username: "me", password: "123456" }, dft);
    expect(strictBody);
    expect(strictBody.username).toBe("me");
    expect(strictBody.password).toBe("123456");

    strictBody = comb({ username: "me", password: "123456", useless: "" }, dft);
    expect(strictBody);
    expect(strictBody.username).toBe("me");
    expect(strictBody.password).toBe("123456");
  });

  it("can deal with string and number in object", () => {
    const dft = {
      sort: "UP_VOTE",
      skip: 5,
      pageSize: 5
    };

    let strictBody = comb(undefined, dft);
    expect(strictBody);
    expect(strictBody.sort).toBe("UP_VOTE");
    expect(strictBody.skip).toBe(5);
    expect(strictBody.pageSize).toBe(5);

    strictBody = comb({}, dft);
    expect(strictBody);
    expect(strictBody.sort).toBe("UP_VOTE");
    expect(strictBody.skip).toBe(5);
    expect(strictBody.pageSize).toBe(5);

    strictBody = comb({ sort: "TIME" }, dft);
    expect(strictBody);
    expect(strictBody.sort).toBe("TIME");
    expect(strictBody.skip).toBe(5);
    expect(strictBody.pageSize).toBe(5);

    strictBody = comb({ sort: "TIME", skip: 10, pageSize: 5 }, dft);
    expect(strictBody);
    expect(strictBody.sort).toBe("TIME");
    expect(strictBody.skip).toBe(10);
    expect(strictBody.pageSize).toBe(5);

    strictBody = comb({ skip: "10", pageSize: "5" }, dft);
    expect(strictBody);
    expect(strictBody.sort).toBe("UP_VOTE");
    expect(strictBody.skip).toBe(10);
    expect(strictBody.pageSize).toBe(5);

    strictBody = comb({ skip: "0" }, dft);
    expect(strictBody);
    expect(strictBody.skip).toBe(0);

    strictBody = comb({ skip: "" }, dft);
    expect(strictBody);
    expect(strictBody.skip).toBeNaN();

    strictBody = comb({ skip: "some_string" }, dft);
    expect(strictBody);
    expect(strictBody.skip).toBeNaN();
  });

  it("can deal with object in object", () => {
    const dft = {
      complex: {}
    };

    let strictBody = comb(undefined, dft);
    expect(strictBody);
    expect(strictBody.complex).toMatchObject({});

    strictBody = comb({}, dft);
    expect(strictBody);
    expect(strictBody.complex).toMatchObject({});

    strictBody = comb({ a: 1 }, dft);
    expect(strictBody);
    expect(strictBody.complex).toMatchObject({});

    strictBody = comb({ complex: {} }, dft);
    expect(strictBody);
    expect(strictBody.complex).toMatchObject({});

    strictBody = comb({ complex: { a: 1 } }, dft);
    expect(strictBody);
    expect(strictBody.complex).toMatchObject({ a: 1 });

    strictBody = comb({ complex: undefined }, dft);
    expect(strictBody);
    expect(strictBody.complex).toMatchObject({});

    strictBody = comb({ complex: null }, dft);
    expect(strictBody);
    expect(strictBody.complex).toMatchObject({});

    strictBody = comb({ complex: "" }, dft);
    expect(strictBody);
    expect(strictBody.complex).toMatchObject({});

    strictBody = comb({ complex: 0 }, dft);
    expect(strictBody);
    expect(strictBody.complex).toMatchObject({});

    strictBody = comb({ complex: 0 }, dft);
    expect(strictBody);
    expect(strictBody.complex).toMatchObject({});
  });

  it("show shallow copy default object", () => {
    const dft = {
      complex: {}
    };

    let strictBody = comb({}, dft);
    expect(strictBody);
    expect(strictBody.complex).not.toBe(dft.complex);
  });

  it("can handle boolean", () => {
    const dft = {
      bool: false
    };

    const _dft = {
      bool: true
    };

    let strictBody = comb({}, dft);
    expect(strictBody);
    expect(strictBody.bool).toBe(false);

    strictBody = comb({ bool: false }, dft);
    expect(strictBody);
    expect(strictBody.bool).toBe(false);

    strictBody = comb({ bool: true }, dft);
    expect(strictBody);
    expect(strictBody.bool).toBe(true);

    strictBody = comb({ bool: "TRUE" }, dft);
    expect(strictBody);
    expect(strictBody.bool).toBe(true);
    strictBody = comb({ bool: "True" }, dft);
    expect(strictBody);
    expect(strictBody.bool).toBe(true);
    strictBody = comb({ bool: "true" }, dft);
    expect(strictBody);
    expect(strictBody.bool).toBe(true);
    strictBody = comb({ bool: "FALSE" }, dft);
    expect(strictBody);
    expect(strictBody.bool).toBe(false);
    strictBody = comb({ bool: "False" }, dft);
    expect(strictBody);
    expect(strictBody.bool).toBe(false);
    strictBody = comb({ bool: "false" }, dft);
    expect(strictBody);
    expect(strictBody.bool).toBe(false);

    strictBody = comb({ bool: "some_else" }, dft);
    expect(strictBody);
    expect(strictBody.bool).toBe(false);

    strictBody = comb({ bool: "some_else" }, _dft);
    expect(strictBody);
    expect(strictBody.bool).toBe(true);
  });
});
