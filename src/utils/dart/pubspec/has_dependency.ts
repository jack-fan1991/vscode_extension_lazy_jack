import * as _ from "lodash";
import { getPubspecAsMap } from "./pubspec_utils";


export async function hasDependency(dependency: string) {
  const pubspec = await getPubspecAsMap();
  const dependencies = _.get(pubspec, "dependencies", {});
  return _.has(dependencies, dependency);
}
