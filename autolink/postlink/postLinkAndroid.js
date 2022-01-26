const { infon } = require("./log");
const RootGradleLinker = require("./rootGradleLinker");
const AppGradleLinker = require("./appGradleLinker");
const GradlePropertiesLinker = require("./gradlePropertiesLinker");

module.exports = () => {
  infon("\nRunning Android postlink script.\n");

  new RootGradleLinker().link((buildToolsVersion) => {
    new AppGradleLinker(buildToolsVersion).link();
    new GradlePropertiesLinker(buildToolsVersion).link();
  });
};
