import { warning } from "@actions/core";
import { CommitStatusState, Context, State } from "./shared.ts";

export async function getStateOfCommit(
  { client, owner, repo, ref, appName, checkName }: Context,
): Promise<State> {
  // commit statuses are in reverse chronological order
  // so the most recent one is the first one
  for await (
    const { data } of client.paginate.iterator(
      client.rest.repos.listCommitStatusesForRef,
      { owner, repo, ref },
    )
  ) {
    const run = data.find((s) =>
      (appName === null || s.creator?.login === appName) &&
      s.context === checkName
    );
    if (!run) continue;
    const state = run.state as CommitStatusState;
    switch (state) {
      case "success":
        return "success";
      case "pending":
        return "pending";
      case "error":
      case "failure":
        return "failure";
      default:
        warning(`unknown commit status state: ${state}`);
        return state satisfies never;
    }
  }

  return "pending";
}
