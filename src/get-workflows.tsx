import {
  Action,
  ActionPanel,
  closeMainWindow,
  Icon,
  List,
  PopToRootType,
  showToast,
  Toast,
} from "@raycast/api";
import { runAppleScript, useExec } from "@raycast/utils";
import { useMemo } from "react";
import { execSync } from "child_process";
import { CLIOutput } from "./types.d";

let appPath: string | undefined;
try {
  appPath = execSync(
    `/usr/bin/mdfind "kMDItemCFBundleIdentifier == 'co.zottmann.BarCuts'"`,
    { encoding: "utf8" },
  )
    .trim();

  if (!appPath) {
    console.warn("BarCuts CLI not found via mdfind.");
    appPath = undefined;
  }
} catch (error) {
  console.error("Error finding BarCuts CLI:", error);
  appPath = undefined;
}

export default function Command() {
  if (!appPath) {
    showToast({
      style: Toast.Style.Failure,
      title: "Could not find BarCuts in /Applications, exiting!",
    });

    return (
      <List searchBarPlaceholder="BarCuts not found …">
        <List.EmptyView
          title="BarCuts Is Not Installed"
          icon={Icon.ExclamationMark}
        />
      </List>
    );
  }

  // Fetch data from BarCuts
  const { isLoading, data } = useExec(`${appPath}/Contents/MacOS/barcuts-cli`);

  // Parse BarCuts data
  const bcData = useMemo<CLIOutput>(() => {
    try {
      return JSON.parse(data || "{}") || {};
    } catch (e) {
      console.error("Failed to parse workflows:", e);
      showToast({
        style: Toast.Style.Failure,
        title: "Failed to load workflows",
        message: "Could not parse data from BarCuts CLI.",
      });
      return {};
    }
  }, [data]);

  if (isLoading) {
    return (
      <List isLoading={true} searchBarPlaceholder="Loading workflows..." />
    );
  }

  // If there are no workflows to display, say so
  if (!bcData.activeWorkflows?.length && !bcData.globalWorkflows?.length) {
    return (
      <List searchBarPlaceholder="Search workflows…">
        <List.EmptyView
          title="No Workflows Found"
          description={`Could not find any active workflows.`}
        />
      </List>
    );
  }

  // Display active & global workflows
  return (
    <List searchBarPlaceholder="Search workflows...">
      {bcData.activeWorkflows?.map((wf) => (
        <List.Item
          key={wf.workflowID}
          title={wf.fullTitle}
          actions={
            <ActionPanel>
              <Action
                icon={Icon.Play}
                title="Run Workflow"
                onAction={() => {
                  runAppleScript(`
                        tell application "Shortcuts Events"
                          ignoring application responses
                            run shortcut id "${wf.workflowID}"
                          end ignoring
                        end tell
                        `);
                  disappearWindow();
                }}
              />
              <Action.OpenInBrowser
                icon={Icon.Pencil}
                title="Open in Shortcuts Editor"
                url={`shortcuts://open-shortcut?id=${wf.workflowID}`}
                onOpen={() => disappearWindow()}
              />
            </ActionPanel>
          }
        />
      ))}
      {bcData.globalWorkflows?.map((wf) => (
        <List.Item
          key={wf.workflowID}
          title={wf.fullTitle}
          icon={Icon.Globe}
          actions={
            <ActionPanel>
              <Action
                icon={Icon.Play}
                title="Run Workflow"
                onAction={() => {
                  runAppleScript(`
                        tell application "Shortcuts Events"
                          ignoring application responses
                            run shortcut id "${wf.workflowID}"
                          end ignoring
                        end tell
                        `);
                  disappearWindow();
                }}
              />
              <Action.OpenInBrowser
                icon={Icon.Pencil}
                title="Open in Shortcuts Editor"
                url={`shortcuts://open-shortcut?id=${wf.workflowID}`}
                onOpen={() => disappearWindow()}
              />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}

function disappearWindow() {
  closeMainWindow({ popToRootType: PopToRootType.Immediate });
}
