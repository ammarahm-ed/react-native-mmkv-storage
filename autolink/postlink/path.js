const glob = require("glob");
const ignoreFolders = {
  ignore: [
    "node_modules/**",
    "**/build/**",
    "**/Build/**",
    "**/DerivedData/**",
    "**/*-tvOS*/**",
  ],
};

exports.mainApplicationJava = glob.sync(
  "**/MainApplication.java",
  ignoreFolders
)[0];

exports.rootGradle = exports.mainApplicationJava.replace(
  /android\/app\/.*\.java/,
  "android/build.gradle"
);

exports.appGradle = exports.mainApplicationJava.replace(
  /android\/app\/.*\.java/,
  "android/app/build.gradle"
);

exports.gradleProperties = exports.mainApplicationJava.replace(
  /android\/app\/.*\.java/,
  "android/gradle/wrapper/gradle-wrapper.properties"
);
