#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
source "$ROOT/scripts/mmkv.env"

usage() {
  cat <<EOF
update-mmkv.sh — refresh the vendored MMKV source tree.

  This is a maintainer tool. It is never run during npm install, during a
  consumer's Gradle build, or from any lifecycle script. Wiring it into
  prepare/postinstall would make every consumer's build depend on the network.

  Version and checksum are pinned in scripts/mmkv.env. To move to a new MMKV
  release, edit MMKV_VERSION there, run this script, and commit the resulting
  diff along with the regenerated prebuilt libraries.

Usage:
  scripts/update-mmkv.sh              fetch source and rebuild prebuilt libmmkv.so
  scripts/update-mmkv.sh --no-build   fetch source only
  scripts/update-mmkv.sh --check      verify the vendored tree matches the pin
EOF
}

BUILD=1
CHECK=0
for arg in "$@"; do
  case "$arg" in
    --no-build) BUILD=0 ;;
    --check) CHECK=1; BUILD=0 ;;
    -h|--help) usage; exit 0 ;;
    *) echo "unknown argument: $arg" >&2; usage >&2; exit 2 ;;
  esac
done

WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

TARBALL="$WORK/mmkv-$MMKV_VERSION.tar.gz"
URL="https://github.com/Tencent/MMKV/archive/refs/tags/v$MMKV_VERSION.tar.gz"

echo "fetching MMKV $MMKV_VERSION"
curl -sSL --fail -o "$TARBALL" "$URL"

ACTUAL="$(shasum -a 256 "$TARBALL" | cut -d' ' -f1)"
if [ "$ACTUAL" != "$MMKV_SHA256" ]; then
  echo "checksum mismatch for $URL" >&2
  echo "  expected $MMKV_SHA256" >&2
  echo "  actual   $ACTUAL" >&2
  echo "GitHub regenerates release tarballs on occasion. If the extracted tree" >&2
  echo "produces no diff, update MMKV_SHA256 in scripts/mmkv.env." >&2
  exit 1
fi

tar xzf "$TARBALL" -C "$WORK"
SRC="$WORK/MMKV-$MMKV_VERSION"

DEST="$ROOT/MMKV"
STAGE="$WORK/staged"

mkdir -p "$STAGE/Core" "$STAGE/Android/cpp" "$STAGE/Android/java"

cp -R "$SRC/Core/." "$STAGE/Core/"
rm -rf "$STAGE/Core/Core.xcodeproj" "$STAGE/Core/.gitignore" "$STAGE/Core/include"

cp "$SRC/Android/MMKV/mmkv/src/main/cpp/native-bridge.cpp" "$STAGE/Android/cpp/"
cp -R "$SRC/Android/MMKV/mmkv/src/main/java/." "$STAGE/Android/java/"
cp "$SRC/LICENSE.TXT" "$STAGE/LICENSE.TXT"

mkdir -p "$STAGE/Core/include/MMKV"
for header in MMKV.h MMKVPredef.h MMBuffer.h MiniPBCoder.h MemoryFile.h MMKVLog.h; do
  cp "$STAGE/Core/$header" "$STAGE/Core/include/MMKV/"
done

echo "$MMKV_VERSION" > "$STAGE/VERSION"

if [ "$CHECK" = "1" ]; then
  if diff -rq "$STAGE" "$DEST" > /dev/null 2>&1; then
    echo "vendored tree matches MMKV $MMKV_VERSION"
    exit 0
  fi
  echo "vendored tree does not match MMKV $MMKV_VERSION" >&2
  diff -rq "$STAGE" "$DEST" >&2 || true
  exit 1
fi

rm -rf "$DEST"
mv "$STAGE" "$DEST"
echo "vendored MMKV $MMKV_VERSION into MMKV/"

if [ "$BUILD" = "1" ]; then
  "$ROOT/scripts/build-mmkv.sh"
fi
