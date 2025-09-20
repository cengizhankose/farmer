
import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const address1 = accounts.get("wallet_1")!;
const adapterContract = Cl.contractPrincipal(deployer, "mock-adapter");
const tokenContract = Cl.contractPrincipal(deployer, "mock-token");

describe("router contract tests", () => {
  it("ensures simnet is well initialised", () => {
    expect(simnet.blockHeight).toBeDefined();
  });

  it("deployer is the initial owner", () => {
    const { result } = simnet.callReadOnlyFn("router", "is-owner", [Cl.principal(deployer)], deployer);
    expect(result).toBeBool(true);
  });

  it("contract starts unpaused", () => {
    const { result } = simnet.callReadOnlyFn("router", "is-paused", [], deployer);
    expect(result).toBeBool(false);
  });

  it("allows owner to pause contract", () => {
    const { result } = simnet.callPublicFn("router", "set-paused", [Cl.bool(true)], deployer);
    expect(result).toBeOk(Cl.bool(true));

    const { result: pausedResult } = simnet.callReadOnlyFn("router", "is-paused", [], deployer);
    expect(pausedResult).toBeBool(true);
  });

  it("rejects non-owner pause attempts", () => {
    const { result } = simnet.callPublicFn("router", "set-paused", [Cl.bool(true)], address1);
    expect(result).toBeErr(Cl.uint(100)); // ERR-NOT-AUTH
  });

  it("allows owner to add protocols", () => {
    const { result } = simnet.callPublicFn(
      "router",
      "allow-protocol",
      [Cl.uint(1), Cl.principal(deployer), adapterContract, tokenContract],
      deployer
    );
    expect(result).toBeOk(Cl.bool(true));

    const { result: allowedResult } = simnet.callReadOnlyFn(
      "router",
      "get-protocol-config",
      [Cl.uint(1)],
      deployer
    );
    expect(allowedResult).toStrictEqual(
      Cl.some(
        Cl.tuple({
          target: Cl.principal(deployer),
          adapter: adapterContract,
          token: tokenContract,
        })
      )
    );

    const { result: tokenResult } = simnet.callReadOnlyFn(
      "router",
      "get-protocol-token",
      [Cl.uint(1)],
      deployer
    );
    expect(tokenResult).toStrictEqual(Cl.some(tokenContract));
  });

  it("successful route deposit to allowed protocol", () => {
    // First allow a protocol
    simnet.callPublicFn("router", "allow-protocol", [Cl.uint(1), Cl.principal(deployer), adapterContract, tokenContract], deployer);
    simnet.callPublicFn("mock-token", "mint", [Cl.principal(address1), Cl.uint(10_000)], deployer);

    // Then route deposit
    const { result } = simnet.callPublicFn(
      "router",
      "route-deposit",
      [tokenContract, Cl.uint(1_000), Cl.uint(1), Cl.uint(950), adapterContract],
      address1
    );
    expect(result).toBeOk(Cl.uint(1_000));
  });

  it("rejects deposit to non-allowed protocol", () => {
    const { result } = simnet.callPublicFn(
      "router",
      "route-deposit",
      [tokenContract, Cl.uint(1_000), Cl.uint(99), Cl.uint(950), adapterContract],
      address1
    );
    expect(result).toBeErr(Cl.uint(101)); // ERR-NOT-ALLOWED
  });

  it("rejects deposit when paused", () => {
    // Allow protocol first
    simnet.callPublicFn("router", "allow-protocol", [Cl.uint(1), Cl.principal(deployer), adapterContract, tokenContract], deployer);
    simnet.callPublicFn("mock-token", "mint", [Cl.principal(address1), Cl.uint(10_000)], deployer);

    // Pause contract
    simnet.callPublicFn("router", "set-paused", [Cl.bool(true)], deployer);

    // Try deposit
    const { result } = simnet.callPublicFn(
      "router",
      "route-deposit",
      [tokenContract, Cl.uint(1_000), Cl.uint(1), Cl.uint(950), adapterContract],
      address1
    );
    expect(result).toBeErr(Cl.uint(200)); // ERR-PAUSED
  });

  it("rejects zero amount deposits", () => {
    simnet.callPublicFn("router", "allow-protocol", [Cl.uint(1), Cl.principal(deployer), adapterContract, tokenContract], deployer);

    const { result } = simnet.callPublicFn(
      "router",
      "route-deposit",
      [tokenContract, Cl.uint(0), Cl.uint(1), Cl.uint(0), adapterContract],
      address1
    );
    expect(result).toBeErr(Cl.uint(201)); // ERR-INVALID-AMOUNT
  });

  it("rejects deposits exceeding cap", () => {
    simnet.callPublicFn("router", "allow-protocol", [Cl.uint(1), Cl.principal(deployer), adapterContract, tokenContract], deployer);

    const { result } = simnet.callPublicFn(
      "router",
      "route-deposit",
      [tokenContract, Cl.uint(200000000), Cl.uint(1), Cl.uint(950), adapterContract], // Exceeds 1e8 cap
      address1
    );
    expect(result).toBeErr(Cl.uint(202)); // ERR-AMOUNT-TOO-HIGH
  });

  it("rejects deposits when adapter or token mismatch", () => {
    simnet.callPublicFn("router", "allow-protocol", [Cl.uint(1), Cl.principal(deployer), adapterContract, tokenContract], deployer);
    simnet.callPublicFn("mock-token", "mint", [Cl.principal(address1), Cl.uint(1_000)], deployer);

    const wrongAdapter = Cl.contractPrincipal(deployer, "mock-stacking");

    const { result: wrongAdapterResult } = simnet.callPublicFn(
      "router",
      "route-deposit",
      [tokenContract, Cl.uint(1_000), Cl.uint(1), Cl.uint(0), wrongAdapter],
      address1
    );
    expect(wrongAdapterResult).toBeErr(Cl.uint(303));

    const wrongToken = Cl.contractPrincipal(deployer, "mock-stacking");

    const { result: wrongTokenResult } = simnet.callPublicFn(
      "router",
      "route-deposit",
      [wrongToken, Cl.uint(1_000), Cl.uint(1), Cl.uint(0), adapterContract],
      address1
    );
    expect(wrongTokenResult).toBeErr(Cl.uint(303));
  });

  it("bubbles adapter error codes", () => {
    simnet.callPublicFn("router", "allow-protocol", [Cl.uint(1), Cl.principal(deployer), adapterContract, tokenContract], deployer);
    simnet.callPublicFn("mock-token", "mint", [Cl.principal(address1), Cl.uint(1_000)], deployer);

    simnet.callPublicFn("mock-adapter", "set-failure", [Cl.bool(true)], deployer);

    const { result } = simnet.callPublicFn(
      "router",
      "route-deposit",
      [tokenContract, Cl.uint(1_000), Cl.uint(1), Cl.uint(0), adapterContract],
      address1
    );

    expect(result).toBeErr(Cl.uint(301));

    simnet.callPublicFn("mock-adapter", "set-failure", [Cl.bool(false)], deployer);
  });

  it("enforces min-out", () => {
    simnet.callPublicFn("router", "allow-protocol", [Cl.uint(1), Cl.principal(deployer), adapterContract, tokenContract], deployer);
    simnet.callPublicFn("mock-token", "mint", [Cl.principal(address1), Cl.uint(1_000)], deployer);
    simnet.callPublicFn("mock-adapter", "set-skim-ratio", [Cl.uint(10)], deployer); // 10%

    const { result } = simnet.callPublicFn(
      "router",
      "route-deposit",
      [tokenContract, Cl.uint(1_000), Cl.uint(1), Cl.uint(950), adapterContract],
      address1
    );

    expect(result).toBeErr(Cl.uint(302));

    // reset state
    simnet.callPublicFn("mock-adapter", "set-skim-ratio", [Cl.uint(0)], deployer);
  });
});
