require 'json'

package = JSON.parse(File.read(File.join(__dir__, 'package.json')))

Pod::Spec.new do |s|
  s.name          = package["name"]
  s.version       = package["version"]
  s.summary       = package["description"]
  s.homepage      = "https://github.com/ammarahm-ed/react-native-mmkv-storage"
  s.license       = package["license"]
  s.authors       = package["author"]
  s.platform      = :ios, "9.0"
  s.source        = { :git => "#{s.homepage}", :tag => "V#{s.version}" }
  s.source_files  = "ios/**/*.{h,m}"
  s.requires_arc  = true
  s.dependency 'React'
  s.dependency 'MMKV', '1.2.5'
end