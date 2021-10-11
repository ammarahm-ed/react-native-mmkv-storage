const path = require("./path");
const fs = require("fs");
const { debugn, warnn, errorn, logn, infon } = require("./log");

const javaCodeTemplate = `package <PROJECT_PACKAGE_NAME>;

import com.facebook.react.bridge.JSIModuleSpec;
import com.facebook.react.bridge.JavaScriptContextHolder;
import com.facebook.react.bridge.ReactApplicationContext;

import java.util.List;

import com.swmansion.reanimated.ReanimatedJSIModulePackage;
import com.ammarahmed.mmkv.RNMMKVModule;


public class <MODULE_CLASS_NAME> extends ReanimatedJSIModulePackage {
    @Override
    public List<JSIModuleSpec> getJSIModules(ReactApplicationContext reactApplicationContext, JavaScriptContextHolder jsContext) {
        reactApplicationContext.getNativeModule(RNMMKVModule.class).installLib(
            jsContext,
            reactApplicationContext.getFilesDir().getAbsolutePath() + "/mmkv"
        );

        return super.getJSIModules(reactApplicationContext, jsContext);
    }
}`;

class Reanimated2Linker {
  constructor() {
    this.linkMainApplication = false;
    this.createCustomJSIModulePackage = false;
    this.MODULE_CLASS_NAME = "CustomMMKVJSIModulePackage";
    this.mainApplicationJava = path.mainApplicationJava;
    this.customJSIModulePackageJava = path.mainApplicationJava.replace(
      "MainApplication",
      this.MODULE_CLASS_NAME
    );
  }

  link() {
    if (!this.mainApplicationJava) {
      errorn(
        "MainApplication.java not found! Does the file exist in the correct folder?\n   Please check the manual installation docs:\n   https://rnmmkv.vercel.app/#/gettingstarted?id=android"
      );
      return;
    }

    logn("Linking MainApplication for Reanimated 2...");

    let content = fs.readFileSync(this.mainApplicationJava, "utf8");

    try {
      content = this._createCustomJSIModulePackage(content);
      this.createCustomJSIModulePackage = true;
    } catch (e) {
      errorn("   " + e);
    }

    try {
      content = this._linkMainApplication(content);
      this.linkMainApplication = true;
    } catch (e) {
      errorn("   " + e);
    }

    fs.writeFileSync(this.mainApplicationJava, content);

    if (this.linkMainApplication && this.createCustomJSIModulePackage) {
      infon("MainApplication.java for Reanimated 2 linked successfully!\n");
    } else if (
      !this.linkMainApplication &&
      !this.createCustomJSIModulePackage
    ) {
      errorn(
        "MainApplication.java for Reanimated 2 was not successfully linked! Please check the information above:\n   https://rnmmkv.vercel.app/#/gettingstarted?id=android"
      );
    } else {
      warnn(
        "MainApplication.java for Reanimated 2 was partially linked. Please check the information above and complete the missing steps manually:\n   https://rnmmkv.vercel.app/#/gettingstarted?id=android"
      );
    }
  }

  _createCustomJSIModulePackage(content) {
    const projectPackageName = this._getProjectPackageName(content);

    debugn(
      `   Create ${this.MODULE_CLASS_NAME}.java for "${projectPackageName}" project`
    );

    fs.writeFileSync(
      this.customJSIModulePackageJava,
      javaCodeTemplate
        .replace("<MODULE_CLASS_NAME>", this.MODULE_CLASS_NAME)
        .replace("<PROJECT_PACKAGE_NAME>", projectPackageName)
    );

    return content;
  }

  _getProjectPackageName(content) {
    const match = /^package\s(.*)\;/.exec(content);
    return match[1].trim();
  }

  _addCustomJSIModulePackageImport(content) {
    const projectPackageName = this._getProjectPackageName(content);
    const importStr = `import ${projectPackageName}.${this.MODULE_CLASS_NAME};`;

    if (content.includes(importStr)) {
      warnn(
        `   MainApplication already import ${this.MODULE_CLASS_NAME}, skipping.`
      );
    } else {
      debugn(`   Add import \`${importStr}\` in MainApplication`);

      return content.replace(
        "import com.facebook.react.ReactPackage;",
        `import com.facebook.react.ReactPackage;\nimport com.facebook.react.bridge.JSIModulePackage;\n${importStr}`
      );
    }

    return content;
  }

  _addGetJSIModulePackageMethod(content) {
    if (content.includes(`new ${this.MODULE_CLASS_NAME}()`)) {
      warnn(
        "   MainApplication already has getJSIModulePackage() method, skipping."
      );

      return content;
    }

    if (content.includes("getJSIModulePackage")) {
      debugn(`   Update getJSIModulePackage method in MainApplication`);

      return content.replace(
        /JSIModulePackage\s+getJSIModulePackage([^}]+})/,
        () => {
          debugn(`   Update getJSIModulePackage SUCCESS`);

          return `JSIModulePackage getJSIModulePackage() {   
          return new ${this.MODULE_CLASS_NAME}();   
        }`;
        }
      );
    }

    if (
      !content.includes("getJSIModulePackage") &&
      content.includes("protected List<ReactPackage> getPackages() {")
    ) {
      debugn("   Create getJSIModulePackage(...) method");

      return content.replace(
        "protected List<ReactPackage> getPackages() {",
        `protected JSIModulePackage getJSIModulePackage() {
            return new ${this.MODULE_CLASS_NAME}();
        }

        @Override
        protected List<ReactPackage> getPackages() {`
      );
    }

    throw new Error(
      "There was a problem creating getJSIModulePackage method in your MainApplication file."
    );
  }

  _linkMainApplication(content) {
    content = this._addCustomJSIModulePackageImport(content);
    content = this._addGetJSIModulePackageMethod(content);
    return content;
  }
}

module.exports = Reanimated2Linker;
