const path = require("./path");
const fs = require("fs");
const { warnn, errorn, logn, infon } = require("./log");

class AppGradleLinker {
  constructor() {
    this.gradlePath = path.appGradle;
    this.setNdkVersion = false;
  }

  link() {
    if (!this.gradlePath) {
      errorn(
        "android/app/build.gradle not found! Does the file exist in the correct folder?\n   Please check the manual installation docs."
      );
      return;
    }

    logn("Linking android/app/build.gradle...");

    let content = fs.readFileSync(this.gradlePath, "utf8");

    try {
      content = this._setNdkVersion(content);
      this.setNdkVersion = true;
    } catch (e) {
      errorn("   " + e);
    }

    fs.writeFileSync(this.gradlePath, content);

    if (this.setNdkVersion) {
      infon("android/app/build.gradle linked successfully!\n");
    } else if (!this.setNdkVersion) {
      errorn(
        "android/app/build.gradle link failed. Please review the information above and complete the necessary steps manually by following the instructions on https://rnmmkv.vercel.app/#/gettingstarted?id=android\n"
      );
    } else {
      warnn(
        "android/app/build.gradle link partially succeeded. Please review the information above and complete the necessary steps manually by following the instructions on https://rnmmkv.vercel.app/#/gettingstarted?id=android\n"
      );
    }
  }

  _setNdkVersion(content) {
    if (content.includes("rootProject.ext.ndkVersion")) {
      warnn("   app/build.gradle already has ndkVersion");
      return content;
    }

    if (content.includes("android {")) {
      return content.replace(
        "android {",
        "android {\n    ndkVersion rootProject.ext.ndkVersion"
      );
    }

    throw new Error("   Could not add ndkVersion version");
  }
}

module.exports = AppGradleLinker;
