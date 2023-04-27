import * as _ from "lodash";
import { getPubspec } from "./pubspec_utils";


export async function hasDependency(dependency: string) {
  const pubspec = await getPubspec();
  const dependencies = _.get(pubspec, "dependencies", {});
  return _.has(dependencies, dependency);
}
