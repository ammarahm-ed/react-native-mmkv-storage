const path = require("./path");
const fs = require("fs");
const { warnn, errorn, logn, infon, debugn } = require("./log");

class RootGradleLinker {
  constructor() {
    this.gradlePath = path.rootGradle;
    this.setNdkVersion = false;
  }

  link(cb) {
    if (!this.gradlePath) {
      errorn(
        "Root build.gradle not found! Does the file exist in the correct folder?\n   Please check the manual installation docs."
      );
      return;
    }

    logn("Linking android/build.gradle...");

    let content = fs.readFileSync(this.gradlePath, "utf8");

    try {
      content = this._setNdkVersion(content);
      content = this._setMinSdkVersion(content);
      this.setNdkVersion = true;
    } catch (e) {
      errorn("   " + e);
    }

    fs.writeFileSync(this.gradlePath, content);

    if (this.setNdkVersion) {
      infon("Root build.gradle linked successfully!\n");
      cb && cb(this._getBuildToolsVersion(content));
    } else if (!this.setNdkVersion) {
      errorn(
        "Root build.gradle link failed. Please review the information above and complete the necessary steps manually by following the instructions on https://rnmmkv.vercel.app/#/gettingstarted?id=android\n"
      );
    } else {
      warnn(
        "Root build.gradle link partially succeeded. Please review the information above and complete the necessary steps manually by following the instructions on https://rnmmkv.vercel.app/#/gettingstarted?id=android\n"
      );
    }
  }

  _getBuildToolsVersion(content) {
    const minSdkVersion = content.match(
      /buildToolsVersion\s{0,}=\s{0,}["']?(\d*)/
    );

    if (minSdkVersion && minSdkVersion[1]) {
      return parseInt(minSdkVersion[1], 10);
    }

    return NaN;
  }

  _setMinSdkVersion(content) {
    let minSdkRegex = /minSdkVersion = ([0-9])\w+/;
    let minSdk = content.match(minSdkRegex)[0];
    if (parseInt(minSdk.match(/([0-9])\w+/)) < 21) {
      return content.replace(minSdk, "minSdkVersion = 21");
    }
    return content;
  }

  _setNdkVersion(content) {
    if (content.includes("ndkVersion")) {
      warnn("   ndkVersion version already declared");
      return content;
    }

    // https://developer.android.com/studio/projects/install-ndk#default-ndk-per-agp
    if (this._getBuildToolsVersion(content) <= 29) {
      return this._setNdkVersionSdk29(content);
    } else if (this._getBuildToolsVersion(content) >= 30) {
      return this._setNdkVersionSdk30(content);
    }

    throw new Error("   Could not add ndkVersion version");
  }

  _changeAndroidGradlePluginVersion(version, content) {
    return content.replace(
      /classpath\s*\(?["']com\.android\.tools\.build:gradle:(\d+\.\d+\.\d+)["']\)?/,
      (all, ver) => {
        debugn(`   Updating AndroidGradlePlugin version ${ver} => ${version}`);

        return all.replace(ver, version);
      }
    );
  }

  _addNdkVersion(version, content) {
    debugn(`   Adding ndkVersion ${version}`);

    return content.replace(
      "targetSdkVersion",
      `ndkVersion = "${version}"\n        targetSdkVersion`
    );
  }

  _setNdkVersionSdk29(content) {
    return this._addNdkVersion(
      "21.1.6352462",
      this._changeAndroidGradlePluginVersion("4.1.0", content)
    );
  }

  _setNdkVersionSdk30(content) {
    return this._addNdkVersion(
      "21.4.7075529",
      this._changeAndroidGradlePluginVersion("4.2.2", content)
    );
  }
}

module.exports = RootGradleLinker;
