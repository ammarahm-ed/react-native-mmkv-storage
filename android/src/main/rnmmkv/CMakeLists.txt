cmake_minimum_required(VERSION 3.9.0)

add_subdirectory(../../../../MMKV/Core Core)

include_directories(
        ../../../../../react-native/React
        ../../../../../react-native/React/Base
        ../../../../../react-native/ReactCommon/jsi
)

add_library(rnmmkv
        SHARED

        ../../../../../react-native/ReactCommon/jsi/jsi/jsi.cpp
        ./rnmmkv-adapter.cpp
)

set_target_properties(
        rnmmkv PROPERTIES
        CXX_STANDARD 17
        CXX_EXTENSIONS OFF
        POSITION_INDEPENDENT_CODE ON
)


find_library(
        log-lib 
        log

)

target_link_libraries(
        rnmmkv
        ${log-lib}
        core
        android
)

