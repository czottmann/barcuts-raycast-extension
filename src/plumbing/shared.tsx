import {
  Action,
  ActionPanel,
  closeMainWindow,
  Icon,
  LaunchProps,
  List,
  showToast,
  Toast,
} from "@raycast/api";
import { createDeeplink, runAppleScript } from "@raycast/utils";
import { useEffect, useState } from "react";
import { exec } from "child_process";
import {
  ListWorkflowItem,
  Workflow,
  WorkflowsPayload,
  WorkflowType,
} from "./types.d";

export function generateCommand(workflowType: WorkflowType) {
  return function (props: LaunchProps<{ arguments: WorkflowsPayload }>) {
    const [items, setItems] = useState<ListWorkflowItem[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
      const args = props.arguments;

      if (typeof args?.list !== "string" || args?.list === "") {
        if (!loading) {
          setLoading(true);
          callBarCuts(workflowType);
        }

        return;
      }

      try {
        const list = JSON.parse(decodeURIComponent(args.list)) as Workflow[];
        setItems(
          list.map((item, idx) => ({
            id: idx,
            title: item[0],
            workflowID: item[1],
          })),
        );
        setLoading(false);
      } catch (error) {
        if (error instanceof Error) {
          showToast({
            style: Toast.Style.Failure,
            title: "Failed to parse list",
            message: error.message,
          });
        }
      }
    }, [props.arguments]);

    if (loading) {
      return <List isLoading={true} />;
    }

    return (
      <List>
        {items.map((item) => (
          <List.Item
            key={item.id}
            title={item.title}
            actions={
              <ActionPanel>
                <Action
                  icon={Icon.Play}
                  title="Run Workflow"
                  onAction={() => {
                    closeMainWindow();
                    runAppleScript(`
                      tell application "Shortcuts Events"
                        ignoring application responses
                          run shortcut id "${item.workflowID}"
                        end ignoring
                      end tell
                    `);
                  }}
                />
                <Action.OpenInBrowser
                  icon={Icon.Pencil}
                  title="Open in Shortcuts Editor"
                  url={`shortcuts://open-shortcut?id=${item.workflowID}`}
                />
              </ActionPanel>
            }
          />
        ))}
      </List>
    );
  };
}

function callBarCuts(type: WorkflowType) {
  const callbackURI = encodeURIComponent(
    createDeeplink({ command: `${type}-workflows` }),
  );
  const barcutsURI = `barcuts://raycast/workflows/${type}` +
    `?x-success=${callbackURI}` +
    `&x-error=${callbackURI}`;
  exec(`open --background '${barcutsURI}'`);
}
