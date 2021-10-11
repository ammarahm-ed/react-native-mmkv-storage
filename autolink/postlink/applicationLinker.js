const path = require("./path");
const fs = require("fs");
const { warnn, logn, infon, debugn, errorn } = require("./log");

class ApplicationLinker {
  constructor() {
    this.applicationPath = path.mainApplicationJava;
    this.getJSIModulePackageSuccess = false;
    this.importRNMMKVJSIModulePackageSuccess = false;
  }

  link() {
    if (!this.applicationPath) {
      errorn(
        "MainApplication.java not found! Does the file exist in the correct folder?\n   Please check the manual installation docs:\n   https://rnmmkv.vercel.app/#/gettingstarted?id=android"
      );
      return;
    }

    logn("Linking MainApplication...");

    let content = fs.readFileSync(this.applicationPath, "utf8");

    try {
      content = this._createRNMMKVJSIModulePackage(content);
      this.getJSIModulePackageSuccess = true;

      content = this._importRNMMKVJSIModulePackage(content);
      this.importRNMMKVJSIModulePackageSuccess = true;
    } catch (e) {
      errorn("   " + e);
    }

    fs.writeFileSync(this.applicationPath, content);

    if (
      this.importRNMMKVJSIModulePackageSuccess &&
      this.getJSIModulePackageSuccess
    ) {
      infon("MainApplication.java linked successfully!\n");
    } else if (
      !this.importRNMMKVJSIModulePackageSuccess &&
      !this.getJSIModulePackageSuccess
    ) {
      errorn(
        "MainApplication.java was not successfully linked! Please check the information above:\n   https://rnmmkv.vercel.app/#/gettingstarted?id=android"
      );
    } else {
      warnn(
        "MainApplication.java was partially linked. Please check the information above and complete the missing steps manually:\n   https://rnmmkv.vercel.app/#/gettingstarted?id=android"
      );
    }
  }

  _importRNMMKVJSIModulePackage(content) {
    if (content.includes("com.ammarahmed.mmkv.RNMMKVJSIModulePackage")) {
      warnn(
        "   MainApplication already import RNMMKVJSIModulePackage, skipping."
      );
      return content;
    }

    if (content.includes("import com.facebook.react.ReactPackage;")) {
      debugn("   Add RNMMKVJSIModulePackage import");
      return content.replace(
        "import com.facebook.react.ReactPackage;",
        `import com.facebook.react.ReactPackage;\nimport com.ammarahmed.mmkv.RNMMKVJSIModulePackage;\nimport com.facebook.react.bridge.JSIModulePackage;`
      );
    }

    throw new Error(
      "There was a problem importing RNMMKVJSIModulePackage in your MainApplication file."
    );
  }

  _createRNMMKVJSIModulePackage(content) {
    if (content.includes("new RNMMKVJSIModulePackage()")) {
      warnn(
        "   MainApplication already has getJSIModulePackage() method, skipping."
      );

      return content;
    }

    if (content.includes("getJSIModulePackage")) {
      throw new Error(
        "Seems already create getJSIModulePackage(...) method with own implementation"
      );
    } else if (
      content.includes("protected List<ReactPackage> getPackages() {")
    ) {
      debugn("   Create getJSIModulePackage(...) method");

      return content.replace(
        "protected List<ReactPackage> getPackages() {",
        `protected JSIModulePackage getJSIModulePackage() {
            return new RNMMKVJSIModulePackage();
        }

        @Override
        protected List<ReactPackage> getPackages() {`
      );
    }

    throw new Error(
      "There was a problem creating getJSIModulePackage method in your MainApplication file."
    );
  }
}

module.exports = ApplicationLinker;
