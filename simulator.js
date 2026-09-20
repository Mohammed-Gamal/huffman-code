"use strict";

const $ = (selector) => document.querySelector(selector);
const els = {
  input: $("#textInput"), charCount: $("#charCount"), play: $("#playBtn"), step: $("#stepBtn"),
  speed: $("#speedRange"), status: $("#status"), unique: $("#uniqueStat"), original: $("#originalStat"),
  encoded: $("#encodedStat"), saving: $("#savingStat"), svg: $("#treeSvg"), treeWrap: $("#treeWrap"),
  heapView: $("#heapView"), heapRow: $("#heapRow"), stepCopy: $("#stepCopy"), codeBody: $("#codeBody"),
  bits: $("#bitOutput"), decoded: $("#decodedOutput"), copy: $("#copyBtn"), treeTab: $("#treeTab"), heapTab: $("#heapTab")
};
let state = null, stepIndex = -1, timer = null, nextId = 0;

function symbolLabel(char) {
  if (char === " ") return "space";
  if (char === "\n") return "\\n";
  if (char === "\t") return "\\t";
  return char;
}

function nodeSummary(n) { return { id: n.id, char: n.char, freq: n.freq }; }

function buildHuffman(text) {
  nextId = 0;
  const frequencies = new Map();
  for (const char of Array.from(text)) frequencies.set(char, (frequencies.get(char) || 0) + 1);
  const sortNodes = (a, b) => a.freq - b.freq || a.order - b.order;
  const entries = [...frequencies.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  let heap = entries.map(([char, freq], order) => ({ id: nextId++, char, freq, order, left: null, right: null }));
  heap.sort(sortNodes);
  const steps = [];
  while (heap.length > 1) {
    const before = heap.map(nodeSummary);
    const left = heap.shift(), right = heap.shift();
    const parent = { id: nextId++, char: null, freq: left.freq + right.freq, order: nextId + 1000, left, right };
    heap.push(parent);
    heap.sort(sortNodes);
    steps.push({ before, picked: [left.id, right.id], after: heap.map(nodeSummary), sum: parent.freq, left: nodeSummary(left), right: nodeSummary(right) });
  }
  const root = heap[0] || null;
  const codes = new Map();
  function walk(node, code) {
    if (!node) return;
    if (node.char !== null) { codes.set(node.char, code || "0"); return; }
    walk(node.left, code + "0"); walk(node.right, code + "1");
  }
  walk(root, "");
  const bits = Array.from(text).map(char => codes.get(char)).join("");
  return { text, frequencies, root, codes, bits, steps };
}

function decode(bits, root) {
  if (!root) return "";
  if (!root.left && !root.right) return root.char.repeat(bits.length);
  let output = "", current = root;
  for (const bit of bits) {
    current = bit === "0" ? current.left : current.right;
    if (!current) throw new Error("Invalid bit sequence");
    if (current.char !== null) { output += current.char; current = root; }
  }
  if (current !== root) throw new Error("Incomplete bit sequence");
  return output;
}

function update(text = els.input.value) {
  stopAnimation();
  state = buildHuffman(text);
  stepIndex = state.steps.length - 1;
  renderAll();
  els.status.textContent = text ? `Tree ready. Press Play merges to replay ${state.steps.length} decision${state.steps.length === 1 ? "" : "s"}.` : "Enter some text to begin.";
}

function renderAll() {
  const codePoints = Array.from(state.text).length;
  const originalBits = new TextEncoder().encode(state.text).length * 8;
  const saving = originalBits ? (1 - state.bits.length / originalBits) * 100 : 0;
  els.charCount.textContent = `${codePoints} character${codePoints === 1 ? "" : "s"}`;
  els.unique.textContent = state.frequencies.size;
  els.original.textContent = `${originalBits} bits`;
  els.encoded.textContent = `${state.bits.length} bits`;
  els.saving.textContent = originalBits ? `${saving.toFixed(1)}%` : "—";
  els.bits.textContent = state.bits || "No bits yet.";
  let roundTrip = "";
  try { roundTrip = decode(state.bits, state.root); } catch (_) { roundTrip = null; }
  els.decoded.textContent = roundTrip === state.text ? "✓ Decoded text matches the input." : "Decoding check failed.";
  renderCodes(); renderTree(); renderStep();
  els.play.disabled = !state.steps.length;
  els.step.disabled = !state.steps.length;
}

function renderCodes() {
  const entries = [...state.codes.entries()].sort((a, b) => state.frequencies.get(b[0]) - state.frequencies.get(a[0]) || a[0].localeCompare(b[0]));
  els.codeBody.innerHTML = entries.length
    ? entries.map(([char, code]) => `<tr><td>${escapeHtml(symbolLabel(char))}</td><td>${state.frequencies.get(char)}</td><td class="mono">${code}</td></tr>`).join("")
    : '<tr><td colspan="3">Enter text to generate codes.</td></tr>';
}

function renderStep() {
  if (!state.steps.length) {
    els.heapRow.innerHTML = state.root ? `<div class="heap-node"><strong>${escapeHtml(symbolLabel(state.root.char))}</strong><br>${state.root.freq}</div>` : "The heap is empty.";
    els.stepCopy.textContent = state.root ? "Only one unique symbol: assign it the code 0." : "Each distinct symbol will start as one heap node.";
    return;
  }
  const i = Math.max(0, Math.min(stepIndex, state.steps.length - 1));
  const step = state.steps[i];
  els.heapRow.innerHTML = step.before.map(n => `<div class="heap-node ${step.picked.includes(n.id) ? "picked" : ""}"><strong>${n.char === null ? "subtree" : escapeHtml(symbolLabel(n.char))}</strong><br>${n.freq}</div>`).join("");
  const leftName = step.left.char === null ? `subtree(${step.left.freq})` : `${symbolLabel(step.left.char)}(${step.left.freq})`;
  const rightName = step.right.char === null ? `subtree(${step.right.freq})` : `${symbolLabel(step.right.char)}(${step.right.freq})`;
  els.stepCopy.textContent = `Step ${i + 1} of ${state.steps.length}: merge ${leftName} and ${rightName} → parent(${step.sum}).`;
}

function treeDepth(node) { return node ? 1 + Math.max(treeDepth(node.left), treeDepth(node.right)) : 0; }
function escapeHtml(value) { return String(value).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[c])); }

function renderTree() {
  els.svg.innerHTML = "";
  if (!state.root) {
    els.svg.setAttribute("viewBox", "0 0 760 410");
    els.svg.innerHTML = '<text x="380" y="205" text-anchor="middle" fill="#607078">Your Huffman tree will appear here.</text>';
    return;
  }
  const leaves = Math.max(1, state.frequencies.size);
  const width = Math.max(760, leaves * 105);
  const depth = treeDepth(state.root);
  const height = Math.max(410, depth * 105 + 70);
  els.svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  els.svg.style.height = `${height}px`;
  let leafIndex = 0;
  function place(node, level) {
    if (!node.left && !node.right) node._x = (leafIndex++ + .5) * (width / leaves);
    else {
      if (node.left) place(node.left, level + 1);
      if (node.right) place(node.right, level + 1);
      node._x = ((node.left?._x ?? node.right._x) + (node.right?._x ?? node.left._x)) / 2;
    }
    node._y = 48 + level * 102;
  }
  place(state.root, 0);
  function drawEdges(node) {
    for (const [child, bit] of [[node.left, "0"], [node.right, "1"]]) if (child) {
      els.svg.insertAdjacentHTML("beforeend", `<line class="tree-edge" x1="${node._x}" y1="${node._y}" x2="${child._x}" y2="${child._y}"></line><text class="tree-bit" x="${(node._x + child._x) / 2}" y="${(node._y + child._y) / 2 - 7}">${bit}</text>`);
      drawEdges(child);
    }
  }
  function drawNodes(node) {
    const leaf = node.char !== null;
    const label = leaf ? escapeHtml(symbolLabel(node.char)) : "Σ";
    els.svg.insertAdjacentHTML("beforeend", `<g class="tree-node ${leaf ? "leaf" : ""}" transform="translate(${node._x} ${node._y})"><circle r="28"></circle><text y="-5">${label}</text><text class="freq" y="13">${node.freq}</text></g>`);
    if (node.left) drawNodes(node.left);
    if (node.right) drawNodes(node.right);
  }
  drawEdges(state.root); drawNodes(state.root);
}

function showTab(name) {
  const tree = name === "tree";
  els.treeWrap.classList.toggle("hidden", !tree); els.heapView.classList.toggle("active", !tree);
  els.treeTab.classList.toggle("active", tree); els.heapTab.classList.toggle("active", !tree);
  els.treeTab.setAttribute("aria-selected", String(tree)); els.heapTab.setAttribute("aria-selected", String(!tree));
}

function stopAnimation() {
  if (timer) clearTimeout(timer);
  timer = null;
  els.play.textContent = "▶ Play merges";
}
function advance() {
  if (!state.steps.length) return;
  stepIndex = (stepIndex + 1) % state.steps.length;
  renderStep(); showTab("heap");
  els.status.textContent = els.stepCopy.textContent;
}
function play() {
  if (timer) { stopAnimation(); els.status.textContent = "Animation paused."; return; }
  stepIndex = -1; els.play.textContent = "Pause"; showTab("heap");
  const tick = () => {
    advance();
    if (stepIndex < state.steps.length - 1) timer = setTimeout(tick, Number(els.speed.value));
    else { timer = null; els.play.textContent = "↻ Replay merges"; els.status.textContent = "Construction complete. The final tree and codes are ready."; }
  };
  tick();
}

let debounce;
els.input.addEventListener("input", () => { clearTimeout(debounce); debounce = setTimeout(() => update(), 120); });
document.querySelectorAll("[data-sample]").forEach(btn => btn.addEventListener("click", () => { els.input.value = btn.dataset.sample; update(); }));
els.play.addEventListener("click", play);
els.step.addEventListener("click", () => { stopAnimation(); advance(); });
els.treeTab.addEventListener("click", () => showTab("tree"));
els.heapTab.addEventListener("click", () => showTab("heap"));
els.copy.addEventListener("click", async () => {
  try { await navigator.clipboard.writeText(state.bits); els.copy.textContent = "Copied"; setTimeout(() => els.copy.textContent = "Copy bits", 1000); }
  catch (_) { els.copy.textContent = "Select manually"; }
});

function registerWebMCP() {
  const context = document.modelContext;
  if (!context?.registerTool) return;
  const controller = new AbortController();
  try {
    Promise.resolve(context.registerTool({
      name: "simulate_huffman_coding",
      title: "Simulate Huffman coding",
      description: "Set the simulator input, build the Huffman tree, and return its generated symbol codes and encoded payload.",
      inputSchema: { type: "object", properties: { text: { type: "string", maxLength: 500 } }, required: ["text"], additionalProperties: false },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute(input) {
        if (!input || typeof input.text !== "string" || Array.from(input.text).length > 500) throw new Error("text must be a string of at most 500 characters");
        els.input.value = input.text; update(input.text);
        return { uniqueSymbols: state.frequencies.size, codes: Object.fromEntries(state.codes), encodedBits: state.bits, roundTripMatches: decode(state.bits, state.root) === state.text };
      }
    }, { signal: controller.signal })).catch(() => {});
  } catch (_) {}
}

update();
registerWebMCP();
