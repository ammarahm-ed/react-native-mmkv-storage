const { infon } = require("./log");
const ApplicationLinker = require("./applicationLinker");
const Reanimated2Linker = require("./reanimated2Linker");
const RootGradleLinker = require("./rootGradleLinker");
const AppGradleLinker = require("./appGradleLinker");
const GradlePropertiesLinker = require("./gradlePropertiesLinker");

function hasReanimated2() {
  try {
    return require("react-native-reanimated/package.json").version[0] === "2";
  } catch (err) {
    return false;
  }
}

module.exports = () => {
  infon("\nRunning Android postlink script.\n");

  if (hasReanimated2()) {
    new Reanimated2Linker().link();
  } else {
    new ApplicationLinker().link();
  }

  new RootGradleLinker().link((buildToolsVersion) => {
    new AppGradleLinker(buildToolsVersion).link();
    new GradlePropertiesLinker(buildToolsVersion).link();
  });
};
