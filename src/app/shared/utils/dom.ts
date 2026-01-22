export const qs = <T extends Element>(selector: string, parent: ParentNode = document) =>
  parent.querySelector<T>(selector);

export const qsa = <T extends Element>(selector: string, parent: ParentNode = document) =>
  Array.from(parent.querySelectorAll<T>(selector));
