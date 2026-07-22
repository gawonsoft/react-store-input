type ResetBatch = (callback: () => void) => unknown;

type ResetCoordinator = {
  groups: Map<ResetBatch, Set<() => void>>;
  handleReset: () => void;
};

const resettingForms = new WeakSet<HTMLFormElement>();
const resetCoordinators = new WeakMap<HTMLFormElement, ResetCoordinator>();

export function isFormResetting(form: HTMLFormElement) {
  return resettingForms.has(form);
}

export function registerResetBinding(
  form: HTMLFormElement,
  batch: ResetBatch,
  reset: () => void,
) {
  let coordinator = resetCoordinators.get(form);

  if (!coordinator) {
    const groups = new Map<ResetBatch, Set<() => void>>();
    const handleReset = () => {
      resettingForms.add(form);

      // React reset handlers may render and re-register bindings before the
      // browser completes the native reset default action.
      const groupSnapshots = Array.from(groups, ([groupBatch, bindings]) => [
        groupBatch,
        [...bindings],
      ] as const);

      setTimeout(() => {
        try {
          for (const [groupBatch, bindings] of groupSnapshots) {
            groupBatch(() => {
              for (const binding of bindings) {
                binding();
              }
            });
          }
        } finally {
          setTimeout(() => resettingForms.delete(form), 0);
        }
      }, 0);
    };

    coordinator = { groups, handleReset };
    resetCoordinators.set(form, coordinator);
    form.addEventListener("reset", handleReset);
  }

  let bindings = coordinator.groups.get(batch);

  if (!bindings) {
    bindings = new Set();
    coordinator.groups.set(batch, bindings);
  }

  bindings.add(reset);

  return () => {
    const currentCoordinator = resetCoordinators.get(form);

    if (!currentCoordinator) {
      return;
    }

    const currentBindings = currentCoordinator.groups.get(batch);
    currentBindings?.delete(reset);

    if (currentBindings?.size === 0) {
      currentCoordinator.groups.delete(batch);
    }

    if (currentCoordinator.groups.size === 0) {
      form.removeEventListener("reset", currentCoordinator.handleReset);
      resetCoordinators.delete(form);
    }
  };
}
