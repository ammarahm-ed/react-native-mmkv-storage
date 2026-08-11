#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
source "$ROOT/scripts/mmkv.env"

fail() {
  echo "$1" >&2
  echo "Run scripts/update-mmkv.sh and commit the result before publishing." >&2
  exit 1
}

[ -f "$ROOT/MMKV/Core/MMKV.cpp" ] || fail "MMKV source is missing from MMKV/Core"
[ -f "$ROOT/MMKV/Android/cpp/native-bridge.cpp" ] || fail "MMKV JNI bridge is missing"
[ -f "$ROOT/MMKV/Android/java/com/tencent/mmkv/MMKV.java" ] || fail "MMKV Java sources are missing"
[ -f "$ROOT/MMKV/Core/include/MMKV/MMKV.h" ] || fail "MMKV public headers are missing"

VENDORED="$(cat "$ROOT/MMKV/VERSION" 2>/dev/null || echo none)"
[ "$VENDORED" = "$MMKV_VERSION" ] || fail "vendored MMKV is $VENDORED but scripts/mmkv.env pins $MMKV_VERSION"

for abi in $MMKV_ABIS; do
  [ -f "$ROOT/android/prebuilt/$abi/libmmkv.so" ] || fail "prebuilt libmmkv.so is missing for $abi"
done

echo "MMKV $MMKV_VERSION source and prebuilt libraries are present"
