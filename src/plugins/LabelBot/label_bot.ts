import { ParsedPath } from "../../util/parse_path";
import { getPullRequestFilesFromContext } from "../../util/pull_request";

// Convert a list of file paths to labels to set

import componentAndPlatform from "./strategies/componentAndPlatform";
import newIntegrationOrPlatform from "./strategies/newIntegrationOrPlatform";
import removePlatform from "./strategies/removePlatform";
import warnOnMergeToMaster from "./strategies/warnOnMergeToMaster";
import markCore from "./strategies/markCore";
import smallPR from "./strategies/smallPR";
import hasTests from "./strategies/hasTests";
import { PRContext } from "../../types";

const STRATEGIES = [
  componentAndPlatform,
  newIntegrationOrPlatform,
  removePlatform,
  warnOnMergeToMaster,
  markCore,
  smallPR,
  hasTests,
];

export const LabelBotPlugin = async (context: PRContext) => {
  const files = await getPullRequestFilesFromContext(context);
  const parsed = files.map((file) => new ParsedPath(file));
  const labelSet = new Set();

  STRATEGIES.forEach((strategy) => {
    for (let label of strategy(context, parsed)) {
      labelSet.add(label);
    }
  });

  const labels = Array.from(labelSet);

  if (labels.length === 0 || labels.length > 9) {
    console.debug(
      `Not setting ${labels.length} labels because out of range of what we allow`
    );
    return;
  }

  await context.github.issues.addLabels(
    context.issue({
      labels,
    })
  );
};
