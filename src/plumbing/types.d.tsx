export type Workflow = [string, string];

export type WorkflowsPayload = {
  list: Workflow[];
};

export type WorkflowType = "active" | "tagged" | "global";

export type ListWorkflowItem = {
  id: number;
  title: string;
  workflowID: string;
};
