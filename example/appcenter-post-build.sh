#!/bin/bash
if [ -z "$APPCENTER_BUILD_ID" ]
then
else
    echo "APPCENTER_BUILD_ID is defined"
    brew uninstall cmake
fi