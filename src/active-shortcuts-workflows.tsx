import { LaunchProps, List, open, showToast, Toast } from "@raycast/api";
import { useEffect, useState } from "react";
import { exec } from "child_process";

const commandUri =
  "raycast://extensions/czottmann/barcuts-companion/active-shortcuts-workflows";

type Arguments = {
  list: string;
};

export default function Command(props: LaunchProps<{ arguments: Arguments }>) {
  const [items, setItems] = useState<{ id: number; title: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!props.arguments?.list || props.arguments?.list === "") {
      console.log("No list provided, calling BarCuts");

      // TODO: Call BarCuts but **ONLY** when it returns the correct format, e.g.
      // `?arguments=%7B%22list%22%3A%22%5B%5D%22%7D`
      const barcutsUri = `barcuts-dev://raycast/workflows/active` +
        `?x-success=${encodeURIComponent(commandUri)}` +
        `&x-error=${encodeURIComponent(commandUri)}`;
      exec(`open --background '${barcutsUri}'`);
    }
  }, [props.arguments]);

  useEffect(() => {
    if (
      typeof props.arguments?.list === "string" &&
      props.arguments?.list !== ""
    ) {
      console.log("List received");

      try {
        const list = JSON.parse(
          decodeURIComponent(props.arguments.list),
        ) as string[];
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
}
