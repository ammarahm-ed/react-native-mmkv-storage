cmake_minimum_required(VERSION 3.10.0)

project(mmkv)

set(MMKV_SOURCE_DIR ${CMAKE_CURRENT_SOURCE_DIR}/../../MMKV)

add_subdirectory(${MMKV_SOURCE_DIR}/Core core)

add_library(mmkv SHARED ${MMKV_SOURCE_DIR}/Android/cpp/native-bridge.cpp)

set_target_properties(mmkv PROPERTIES
        CXX_STANDARD 20
        CXX_EXTENSIONS OFF
        POSITION_INDEPENDENT_CODE ON
)

target_compile_definitions(mmkv PRIVATE MMKV_STL_SHARED=1 MMKV_DISABLE_FLUTTER)

find_library(log-lib log)

target_link_libraries(mmkv core ${log-lib})
