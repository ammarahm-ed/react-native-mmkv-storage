const fs = require("fs");
const path = require("path");

const folder = process.argv[2];
const PROJECT_FOLDER = path.join(process.cwd(), folder);

const MainApplicationFile = path.join(
  PROJECT_FOLDER,
  `android/app/src/main/java/com/${folder}/MainApplication.java`
);
const AndroidBuildGradleFile = path.join(
  PROJECT_FOLDER,
  `android/build.gradle`
);
const AndroidAppBuildGradleFile = path.join(
  PROJECT_FOLDER,
  `android/app/build.gradle`
);
const LocalPropertiesFile = path.join(
  PROJECT_FOLDER,
  `android/local.properties`
);
const GradleWrapperFile = path.join(
  PROJECT_FOLDER,
  `android/gradle/wrapper/gradle-wrapper.properties`
);

function pathFile(file, cb) {
  fs.writeFileSync(file, cb(fs.readFileSync(file).toString()));
}

function linkMainApplication(javaCode) {
  if (!javaCode.includes("com.ammarahmed.mmkv.RNMMKVJSIModulePackage")) {
    javaCode = javaCode.replace(
      "import com.facebook.react.ReactPackage;",
      `import com.facebook.react.ReactPackage;\nimport com.ammarahmed.mmkv.RNMMKVJSIModulePackage;\nimport com.facebook.react.bridge.JSIModulePackage;`
    );
  }

  if (!javaCode.includes("getJSIModulePackage")) {
    javaCode = javaCode.replace(
      "protected List<ReactPackage> getPackages() {",
      `protected JSIModulePackage getJSIModulePackage() {
            return new RNMMKVJSIModulePackage();
        }

        @Override
        protected List<ReactPackage> getPackages() {`
    );
  }

  return javaCode;
}

function linkAndroidBuildGradle(gradleCode) {
  /**
   * Error: "No toolchains found in the NDK toolchains folder for ABI with prefix: arm-linux-androideabi"
   * Versions: 0.62.x, 0.63.x
   */

  if (!gradleCode.includes("ndkVersion")) {
    gradleCode = gradleCode.replace(
      "targetSdkVersion",
      `ndkVersion = "21.4.7075529"\n        targetSdkVersion`
    );
  }

  [
    // RN@0.62.x
    'classpath("com.android.tools.build:gradle:3.5.2")',
    // RN@0.63.x
    'classpath("com.android.tools.build:gradle:3.5.3")',
  ].forEach((ver) => {
    gradleCode = gradleCode.replace(
      ver,
      `classpath("com.android.tools.build:gradle:4.1.0")`
    );
  });

  return gradleCode;
}

function pathAndroid_App_BuildGradle(gradleCode) {
  // add ndkVersion for react-native@0.63 and below
  if (!gradleCode.includes("rootProject.ext.ndkVersion")) {
    gradleCode = gradleCode.replace(
      "android {",
      "android {\n    ndkVersion rootProject.ext.ndkVersion"
    );
  }

  return gradleCode;
}

function pathGradleWrapperFile(fileText) {
  /**
   * Error: "Minimum supported Gradle version is 6.5. Current version is 6.2. If using the gradle wrapper, try editing the distributionUrl in gradle-wrapper.properties to gradle-6.5-all.zip"
   * Versions: 0.62.x, 0.63.x
   */

  // RN@0.63.x
  if (fileText.includes("gradle-6.2-all")) {
    fileText = fileText.replace("gradle-6.2-all", "gradle-6.5-all");
  }

  // RN@0.62.x
  if (fileText.includes("gradle-6.0.1-all")) {
    fileText = fileText.replace("gradle-6.0.1-all", "gradle-6.5-all");
  }

  return fileText;
}

function defineCmake() {
  /**
   * Error: "CMake 3.9.0 or higher is required.  You are running version 3.6.0-rc2"
   * Versions: > 0.63.x
   */
  fs.writeFileSync(
    LocalPropertiesFile,
    `cmake.dir=/usr/local/lib/android/sdk/cmake/3.10.2.4988404`
  );
}

defineCmake();
pathFile(GradleWrapperFile, pathGradleWrapperFile);
pathFile(MainApplicationFile, linkMainApplication);
pathFile(AndroidBuildGradleFile, linkAndroidBuildGradle);
pathFile(AndroidAppBuildGradleFile, pathAndroid_App_BuildGradle);
