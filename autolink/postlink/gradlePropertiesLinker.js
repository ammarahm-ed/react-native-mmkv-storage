const path = require("./path");
const fs = require("fs");
const { warnn, errorn, logn, infon, debugn } = require("./log");

class GradlePropertiesLinker {
  constructor(buildToolsVersion) {
    this.gradleProperties = path.gradleProperties;
    this.setGradleVersion = false;
    this.buildToolsVersion = buildToolsVersion;
    this.distUrlRegex = /distributionUrl=.*\n/;
    this.versionRegex = /\d+(\.\d+)+/;
    this.distUrl = `distributionUrl=https://services.gradle.org/distributions/gradle-`;
  }

  needLinking(content) {
    let distUrl = content.match(this.distUrlRegex)[0];
    let version = distUrl.match(this.versionRegex)[0];
    infon(`Detected gradle version: ${version}`);
    return parseInt(version[0]) < 7;
  }

  link() {
    if (!this.gradleProperties) {
      errorn(
        "android/gradle/wrapper/gradle-wrapper.properties not found! Does the file exist in the correct folder?\n   Please check the manual installation docs."
      );
      return;
    }

    logn("Linking android/gradle/wrapper/gradle-wrapper.properties...");

    let content = fs.readFileSync(this.gradleProperties, "utf8");

    try {
      if (!this.needLinking(content)) {
        infon("gradle.properties linked already.\n");
        return;
      }

      content = this._setGradleVersion(content);
      this.setGradleVersion = true;
    } catch (e) {
      errorn("   " + e);
    }

    fs.writeFileSync(this.gradleProperties, content);

    if (this.setGradleVersion) {
      infon("gradle-wrapper.properties linked successfully!\n");
    } else if (!this.setGradleVersion) {
      errorn(
        "gradle-wrapper.properties link failed. Please review the information above and complete the necessary steps manually by following the instructions on https://rnmmkv.vercel.app/#/gettingstarted?id=android\n"
      );
    } else {
      warnn(
        "gradle-wrapper.properties link partially succeeded. Please review the information above and complete the necessary steps manually by following the instructions on https://rnmmkv.vercel.app/#/gettingstarted?id=android\n"
      );
    }
  }

  _setGradleVersion(content) {
    if (this.buildToolsVersion >= 30) {
      // https://developer.android.com/studio/releases/gradle-plugin#4-2-0
      return this._setGradleDistributionUrl("6.9", content);
    }

    if (this.buildToolsVersion <= 29) {
      // https://developer.android.com/studio/releases/gradle-plugin#4-1-0
      return this._setGradleDistributionUrl("6.7", content);
    }

    return content;
  }

  _setGradleDistributionUrl(version, content) {
    return content.replace(this.distUrlRegex, () => {
      debugn(`   Updating Gradle distributionUrl ${version}`);

      return `distributionUrl=https://services.gradle.org/distributions/gradle-${version}-all.zip\n`;
    });
  }
}

module.exports = GradlePropertiesLinker;
