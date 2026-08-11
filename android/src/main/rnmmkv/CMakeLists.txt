cmake_minimum_required(VERSION 3.9.0)

set (PACKAGE_NAME "rnmmkv")
project(PACKAGE_NAME)
set (BUILD_DIR ../../../)
set(CMAKE_VERBOSE_MAKEFILE ON)
set(CMAKE_CXX_STANDARD 17)

add_library(
        ${PACKAGE_NAME}
        SHARED
        ./rnmmkv-adapter.cpp
)

set_target_properties(
        ${PACKAGE_NAME} PROPERTIES
        CXX_STANDARD 17
        CXX_EXTENSIONS OFF
        POSITION_INDEPENDENT_CODE ON
)

if(MMKV_FROM_SOURCE)
    add_subdirectory(${CMAKE_CURRENT_SOURCE_DIR}/../../../mmkv mmkv)
else()
    add_library(mmkv SHARED IMPORTED)
    set_target_properties(mmkv PROPERTIES
            IMPORTED_LOCATION ${CMAKE_CURRENT_SOURCE_DIR}/../../../prebuilt/${ANDROID_ABI}/libmmkv.so
            INTERFACE_INCLUDE_DIRECTORIES ${CMAKE_CURRENT_SOURCE_DIR}/../../../../MMKV/Core/include
    )
endif()

find_package(ReactAndroid REQUIRED CONFIG)
find_library(log-lib log)
find_package(fbjni REQUIRED CONFIG)


if(${REACT_NATIVE_MINOR_VERSION} GREATER_EQUAL 76)
    target_link_libraries(
            ${PACKAGE_NAME}
            mmkv
            ${log-lib}
            fbjni::fbjni
            ReactAndroid::jsi
            ReactAndroid::reactnative
            android
    )
else()
    target_link_libraries(
            ${PACKAGE_NAME}
            mmkv
            ${log-lib}
            fbjni::fbjni
            ReactAndroid::jsi
            ReactAndroid::turbomodulejsijni
            ReactAndroid::react_nativemodule_core
            android
    )
endif()
