
import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const address1 = accounts.get("wallet_1")!;

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
      [Cl.uint(1), Cl.principal(deployer)],
      deployer
    );
    expect(result).toBeOk(Cl.bool(true));

    const { result: allowedResult } = simnet.callReadOnlyFn(
      "router",
      "is-protocol-allowed",
      [Cl.uint(1)],
      deployer
    );
    expect(allowedResult).toBeBool(true);
  });

  it("successful route deposit to allowed protocol", () => {
    // First allow a protocol
    simnet.callPublicFn("router", "allow-protocol", [Cl.uint(1), Cl.principal(deployer)], deployer);

    // Then route deposit
    const { result } = simnet.callPublicFn(
      "router",
      "route-deposit",
      [Cl.principal(deployer), Cl.uint(1000), Cl.uint(1), Cl.uint(950)],
      address1
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("rejects deposit to non-allowed protocol", () => {
    const { result } = simnet.callPublicFn(
      "router",
      "route-deposit",
      [Cl.principal(deployer), Cl.uint(1000), Cl.uint(99), Cl.uint(950)],
      address1
    );
    expect(result).toBeErr(Cl.uint(101)); // ERR-NOT-ALLOWED
  });

  it("rejects deposit when paused", () => {
    // Allow protocol first
    simnet.callPublicFn("router", "allow-protocol", [Cl.uint(1), Cl.principal(deployer)], deployer);

    // Pause contract
    simnet.callPublicFn("router", "set-paused", [Cl.bool(true)], deployer);

    // Try deposit
    const { result } = simnet.callPublicFn(
      "router",
      "route-deposit",
      [Cl.principal(deployer), Cl.uint(1000), Cl.uint(1), Cl.uint(950)],
      address1
    );
    expect(result).toBeErr(Cl.uint(200)); // ERR-PAUSED
  });

  it("rejects zero amount deposits", () => {
    simnet.callPublicFn("router", "allow-protocol", [Cl.uint(1), Cl.principal(deployer)], deployer);

    const { result } = simnet.callPublicFn(
      "router",
      "route-deposit",
      [Cl.principal(deployer), Cl.uint(0), Cl.uint(1), Cl.uint(0)],
      address1
    );
    expect(result).toBeErr(Cl.uint(201)); // ERR-INVALID-AMOUNT
  });

  it("rejects deposits exceeding cap", () => {
    simnet.callPublicFn("router", "allow-protocol", [Cl.uint(1), Cl.principal(deployer)], deployer);

    const { result } = simnet.callPublicFn(
      "router",
      "route-deposit",
      [Cl.principal(deployer), Cl.uint(200000000), Cl.uint(1), Cl.uint(950)], // Exceeds 1e8 cap
      address1
    );
    expect(result).toBeErr(Cl.uint(202)); // ERR-AMOUNT-TOO-HIGH
  });
});
