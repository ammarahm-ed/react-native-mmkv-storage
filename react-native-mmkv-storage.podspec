require 'json'

package = JSON.parse(File.read(File.join(__dir__, 'package.json')))

Pod::Spec.new do |s|
  s.name          = package["name"]
  s.version       = package["version"]
  s.summary       = package["description"]
  s.homepage      = "https://github.com/ammarahm-ed/react-native-mmkv-storage"
  s.license       = package["license"]
  s.authors       = package["author"]
  # Follow whatever the installed React Native supports (15.1 on RN 0.87),
  # falling back to the old floor for React Native versions that predate the helper.
  s.platform      = :ios, (respond_to?(:min_ios_version_supported, true) ? min_ios_version_supported : "12.4")
  s.source        = { :git => "#{s.homepage}", :tag => "V#{s.version}" }
  s.requires_arc  = true

  # Codegen specs are generated at build time by the app (from ./src),
  # so only the handwritten sources are shipped/compiled here.
  s.source_files = "ios/*.{h,m,mm,cpp}"

  s.dependency 'MMKV', '~> 1.3.14'
  if respond_to?(:install_modules_dependencies, true)
    install_modules_dependencies(s)
  else
    s.dependency "React-Core"

    # Don't install the dependencies when we run `pod install` in the old architecture.
    if ENV['RCT_NEW_ARCH_ENABLED'] == '1' then
      s.compiler_flags = folly_compiler_flags + " -DRCT_NEW_ARCH_ENABLED=1"
      s.pod_target_xcconfig    = {
          "HEADER_SEARCH_PATHS" => "\"$(PODS_ROOT)/boost\"",
          "OTHER_CPLUSPLUSFLAGS" => "-DFOLLY_NO_CONFIG -DFOLLY_MOBILE=1 -DFOLLY_USE_LIBCPP=1",
          "CLANG_CXX_LANGUAGE_STANDARD" => "c++17"
      }
      s.dependency "React-Codegen"
      s.dependency "RCT-Folly"
      s.dependency "RCTRequired"
      s.dependency "RCTTypeSafety"
      s.dependency "ReactCommon/turbomodule/core"
    end
  end
end
