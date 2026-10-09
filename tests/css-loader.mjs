// CSS side effects are handled by Vite in the app, not the Node render tests.
export async function load(url, context, nextLoad) {
  if (url.endsWith(".css")) {
    return { format: "module", source: "export {};", shortCircuit: true };
  }
  return nextLoad(url, context);
}
