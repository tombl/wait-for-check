import * as core from "@actions/core";
import * as github from "@actions/github";
import { delay as sleep } from "@std/async/delay";
import { getStateOfCheck } from "./checks.ts";
import { getStateOfCommit } from "./commit.ts";
import { parseDuration } from "./duration.ts";
import { Context, State } from "./shared.ts";

const STATE_SYMBOLS: Record<State, string> = {
  success: "✅",
  failure: "❌",
  pending: "⏳",
};

try {
  const token = core.getInput("token", { required: true });
  const delay = parseDuration(core.getInput("delay", { required: true }));
  const timeout = parseDuration(core.getInput("timeout", { required: true }));
  const checks = core.getInput("checks", { required: true })
    .split(",")
    .map((check) => check.trim());

  const outputs: Record<string, State> = Object.fromEntries(
    checks.map((check) => [check, "pending"]),
  );

  const client = github.getOctokit(token);

  const start = performance.now(); // used instead of Date.now() because it's monotonic

  let allCompleted: boolean;
  do {
    await sleep(delay);

    allCompleted = true;

    for (const check of checks) {
      const slashIdx = check.indexOf("/");

      const context: Context = {
        client,
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        ref: github.context.ref,
        appName: slashIdx === -1 ? null : check.slice(0, slashIdx),
        checkName: slashIdx === -1 ? check : check.slice(slashIdx + 1),
      };

      const state = await getStateOfCheck(context) ??
        await getStateOfCommit(context);

      allCompleted &&= state !== "pending";

      outputs[check] = state;
    }

    for (
      const [state, theseOutputs] of Object.entries(
        Object.groupBy(Object.entries(outputs), ([, s]) => s),
      )
    ) {
      core.info(
        `${STATE_SYMBOLS[state as State]} ${state}: ${
          theseOutputs.map(([o]) => o).join(" ")
        }`,
      );
    }
  } while (!allCompleted && (performance.now() - start) < timeout);

  core.setOutput("statuses", outputs);

  if (!allCompleted) core.warning("timed out waiting for checks to complete");

  if (!Object.values(outputs).every((state) => state === "success")) {
    core.setFailed("some checks didn't succeed");
  }
} catch (error) {
  if (error instanceof Error) core.setFailed(error.message);
}
