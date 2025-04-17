import { exec } from "child_process";

type WorkflowType = "active" | "tagged" | "global";

export function callBarCuts(type: WorkflowType) {
  const callbackURI = encodeURIComponent(
    "raycast://extensions/czottmann/barcuts-companion/select",
  );
  const barcutsURI = `barcuts://raycast/workflows/${type}` +
    `?x-success=${callbackURI}` +
    `&x-error=${callbackURI}`;
  exec(`open --background '${barcutsURI}'`);
}
