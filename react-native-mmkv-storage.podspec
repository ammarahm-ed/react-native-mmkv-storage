require 'json'

package = JSON.parse(File.read(File.join(__dir__, 'package.json')))

Pod::Spec.new do |s|
  s.name          = package["name"]
  s.version       = package["version"]
  s.summary       = package["description"]
  s.homepage      = "https://github.com/ammarahm-ed/react-native-mmkv-storage"
  s.license       = package["license"]
  s.authors       = package["author"]
  s.platform      = :ios, "12.4"
  s.source        = { :git => "#{s.homepage}", :tag => "V#{s.version}" }
  s.source_files  = "ios/**/*.{h,m,mm,cpp}"
  s.requires_arc  = true
  s.dependency 'React'
  s.dependency 'React-Core'
  s.dependency 'MMKV', '~> 1.3.9'
end
