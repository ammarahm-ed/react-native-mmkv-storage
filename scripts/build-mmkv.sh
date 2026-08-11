#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
source "$ROOT/scripts/mmkv.env"

if [ ! -f "$ROOT/MMKV/Core/MMKV.cpp" ]; then
  echo "MMKV source is missing. Run scripts/update-mmkv.sh first." >&2
  exit 1
fi

SDK="${ANDROID_HOME:-${ANDROID_SDK_ROOT:-$HOME/Library/Android/sdk}}"
NDK="$SDK/ndk/$MMKV_NDK_VERSION"
TOOLCHAIN="$NDK/build/cmake/android.toolchain.cmake"

if [ ! -f "$TOOLCHAIN" ]; then
  echo "NDK $MMKV_NDK_VERSION not found at $NDK" >&2
  echo "Install it with: sdkmanager \"ndk;$MMKV_NDK_VERSION\"" >&2
  exit 1
fi

OUT="$ROOT/android/prebuilt"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

rm -rf "$OUT"

for abi in $MMKV_ABIS; do
  echo "building libmmkv.so for $abi"
  cmake -S "$ROOT/android/mmkv" -B "$WORK/$abi" -G Ninja \
    -DCMAKE_TOOLCHAIN_FILE="$TOOLCHAIN" \
    -DANDROID_ABI="$abi" \
    -DANDROID_PLATFORM="android-$MMKV_MIN_SDK" \
    -DANDROID_STL=c++_shared \
    -DANDROID_SUPPORT_FLEXIBLE_PAGE_SIZES=ON \
    -DCMAKE_BUILD_TYPE=Release \
    > /dev/null
  cmake --build "$WORK/$abi" --target mmkv > /dev/null

  mkdir -p "$OUT/$abi"
  "$NDK/toolchains/llvm/prebuilt/darwin-x86_64/bin/llvm-strip" \
    --strip-unneeded "$WORK/$abi/libmmkv.so" -o "$OUT/$abi/libmmkv.so"
done

echo "prebuilt libraries written to android/prebuilt"
for abi in $MMKV_ABIS; do
  printf '  %-12s %8s bytes\n' "$abi" "$(wc -c < "$OUT/$abi/libmmkv.so" | tr -d ' ')"
done
