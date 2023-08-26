cmake_minimum_required(VERSION 3.9.0)

set (PACKAGE_NAME "rnmmkv")
project(PACKAGE_NAME)
set (BUILD_DIR ../../../)
set(CMAKE_VERBOSE_MAKEFILE ON)
set(CMAKE_CXX_STANDARD 17)

add_subdirectory(../../../../MMKV/Core core)

add_library(
        ${PACKAGE_NAME}
        SHARED
        ./rnmmkv-adapter.cpp
        ./ThreadPool.cpp
)

set_target_properties(
        ${PACKAGE_NAME} PROPERTIES
        CXX_STANDARD 17
        CXX_EXTENSIONS OFF
        POSITION_INDEPENDENT_CODE ON
)

find_package(ReactAndroid REQUIRED CONFIG)
find_library(log-lib log)
find_package(fbjni REQUIRED CONFIG)

#if(${USE_HERMES})
#  set(JSEXECUTOR_LIB ReactAndroid::hermes_executor)
#else()
#  set(JSEXECUTOR_LIB ReactAndroid::jscexecutor)
#endif()

target_link_libraries(
        ${PACKAGE_NAME}
        core               
        ${log-lib}
        fbjni::fbjni
        ReactAndroid::jsi
        ReactAndroid::turbomodulejsijni
        ReactAndroid::react_nativemodule_core
#        ${JSEXECUTOR_LIB}
        android
)
