#include "MMKVStorageModule.hpp"

#include <MMKVStorageSpec.h>

#include "MMKVInstall.h"

#include <cstdlib>
#include <filesystem>
#include <memory>
#include <string>
#include <system_error>
#include <utility>

namespace {
namespace jsi = facebook::jsi;
using facebook::react::CallInvoker;
using facebook::react::TurboModule;

std::filesystem::path dataDirectory() {
  if (const char* configured = std::getenv("RN_GPUI_APP_DATA_DIR")) {
    return std::filesystem::path(configured) / "MMKV";
  }
#if defined(_WIN32)
  const char* base = std::getenv("APPDATA");
  std::filesystem::path root = base ? base : std::filesystem::temp_directory_path();
#elif defined(__APPLE__)
  const char* home = std::getenv("HOME");
  std::filesystem::path root = home
      ? std::filesystem::path(home) / "Library" / "Application Support"
      : std::filesystem::temp_directory_path();
#else
  const char* data = std::getenv("XDG_DATA_HOME");
  const char* home = std::getenv("HOME");
  std::filesystem::path root = data ? std::filesystem::path(data)
      : home                        ? std::filesystem::path(home) / ".local" / "share"
                                    : std::filesystem::temp_directory_path();
#endif
  return root / "MMKV";
}

class MMKVStorageModule final
    : public facebook::react::NativeMMKVStorageSpec<MMKVStorageModule> {
 public:
  explicit MMKVStorageModule(std::shared_ptr<CallInvoker> jsInvoker)
      : NativeMMKVStorageSpec(std::move(jsInvoker)) {}

  bool install(jsi::Runtime& runtime) {
    if (installed_) return true;
    const auto directory = dataDirectory();
    std::error_code error;
    std::filesystem::create_directories(directory, error);
    if (error) return false;
    installMMKV(runtime, directory.string());
    installed_ = true;
    return true;
  }

 private:
  bool installed_ = false;
};
} // namespace

std::shared_ptr<TurboModule> create_mmkv_storage_module(
    const std::string& name,
    std::shared_ptr<CallInvoker> jsInvoker) {
  return rngpui::provideTurboModule<MMKVStorageModule>(name, std::move(jsInvoker));
}
