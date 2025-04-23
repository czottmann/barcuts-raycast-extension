export type CLIOutput = {
  activeWorkflows: WorkflowItem[];
  globalWorkflows: WorkflowItem[];
  activeAppID: string;
};

type WorkflowItem = {
  fullTitle: string;
  workflowID: string;
};
