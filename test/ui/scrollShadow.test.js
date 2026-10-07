import test from "node:test";
import assert from "node:assert/strict";
import { getScrollShadowVisibility } from "../../src/lib/scrollShadow.js";

const state = (position, overrides = {}) =>
  getScrollShadowVisibility({
    position,
    scrollSize: 1000,
    clientSize: 300,
    ...overrides,
  });

test("fades only the edges with more content", () => {
  assert.equal(state(0), "bottom");
  assert.equal(state(200), "both");
  assert.equal(state(700), "top");
});

test("removes fading when content fits or shrinks", () => {
  assert.equal(state(0, { scrollSize: 300 }), "none");
  assert.equal(state(200, { scrollSize: 100 }), "none");
});

test("handles subpixel rounding and elastic overscroll", () => {
  assert.equal(state(699.5), "top");
  assert.equal(state(-30), "bottom");
  assert.equal(state(800), "top");
});

test("respects the offset threshold at both ends", () => {
  assert.equal(state(20, { offset: 20 }), "bottom");
  assert.equal(state(21, { offset: 20 }), "both");
  assert.equal(state(680, { offset: 20 }), "top");
});

test("maps horizontal overflow to physical edges in LTR and RTL", () => {
  assert.equal(state(0, { orientation: "horizontal" }), "right");
  assert.equal(state(700, { orientation: "horizontal" }), "left");
  assert.equal(
    state(0, { orientation: "horizontal", direction: "rtl" }),
    "left",
  );
  assert.equal(
    state(-700, { orientation: "horizontal", direction: "rtl" }),
    "right",
  );
  assert.equal(
    state(-200, { orientation: "horizontal", direction: "rtl" }),
    "both",
  );
});
