import { LaunchProps, List, showToast, Toast } from "@raycast/api";
import { useEffect, useState } from "react";
import { exec } from "child_process";
import { WorkflowsPayload, WorkflowType } from "./types.d";

export function generateCommand(workflowType: WorkflowType) {
  return function (props: LaunchProps<{ arguments: WorkflowsPayload }>) {
    const [items, setItems] = useState<{ id: number; title: string }[]>([]);
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
        const list = JSON.parse(decodeURIComponent(args.list)) as string[];
        setItems(list.map((item, index) => ({ id: index, title: item })));
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
        {items.map((item) => <List.Item key={item.id} title={item.title} />)}
      </List>
    );
  };
}

function callBarCuts(type: WorkflowType) {
  const callbackURI = encodeURIComponent(
    `raycast://extensions/czottmann/barcuts-companion/${type}-workflows`,
  );
  const barcutsURI = `barcuts://raycast/workflows/${type}` +
    `?x-success=${callbackURI}` +
    `&x-error=${callbackURI}`;
  exec(`open --background '${barcutsURI}'`);
}
