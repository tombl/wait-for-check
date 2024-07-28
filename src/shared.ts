export type Octokit = ReturnType<typeof import("@actions/github").getOctokit>;

export interface Context {
  client: Octokit;

  owner: string;
  repo: string;
  ref: string;

  appName: string | null;
  checkName: string;
}

export type CheckRun =
  import("npm:@octokit/openapi-types").components["schemas"]["check-run"];

export type CommitStatusState =
  import("npm:@octokit/openapi-types").operations["repos/create-commit-status"][
    "requestBody"
  ]["content"]["application/json"]["state"];

type NotNull<T> = T extends null ? never : T;

export type State = "pending" | "success" | "failure";
