import { describe, expect, it } from "vitest";
import { fillCount, hookFor } from "@/lib/app-story";

describe("número de segredos nas chamadas", () => {
  it("usa o número lido do app", () => {
    expect(hookFor(126)).toBe("126 segredos pra meter o loko");
    expect(fillCount("Seu comparsa: {n} segredos pra meter o loko.", 130)).toBe("Seu comparsa: 130 segredos pra meter o loko.");
  });
  it("sem número, a frase continua de pé", () => {
    expect(hookFor(null)).toBe("Segredos pra meter o loko");
    expect(fillCount("{n} segredos pra meter o loko.", null)).toBe("Segredos pra meter o loko.");
    expect(fillCount("Seu comparsa de bolso: {n} segredos pra meter o loko", null)).toBe("Seu comparsa de bolso: Segredos pra meter o loko");
  });
});
