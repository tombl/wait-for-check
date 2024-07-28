import { CheckRun, Context, State } from "./shared.ts";

export async function getStateOfCheck(
  { client, owner, repo, ref, appName, checkName }: Context,
): Promise<State> {
  let run: CheckRun | undefined;

  for await (
    const { data } of client.paginate.iterator(
      client.rest.checks.listForRef,
      {
        owner,
        repo,
        ref,
        check_name: checkName,
        filter: "latest",
      },
    )
  ) {
    run = data.check_runs.findLast((r) =>
      appName === null || appName === r.app?.slug
    );
  }

  if (run?.status === "completed") {
    switch (run.conclusion) {
      case null:
        throw new Error(`completed check run ${run.id} has no conclusion`);

      case "success":
      case "skipped":
      case "neutral": // afaict github treats neutral as a success state
        return "success";

      case "failure":
      case "action_required":
      case "cancelled":
      case "timed_out":
        return "failure";

      default:
        return run.conclusion satisfies never;
    }
  }

  return "pending";
}
