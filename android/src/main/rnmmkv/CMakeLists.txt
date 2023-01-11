cmake_minimum_required(VERSION 3.9.0)


set (PACKAGE_NAME "rnmmkv")
project(PACKAGE_NAME)
set (BUILD_DIR ../../../)
set(CMAKE_VERBOSE_MAKEFILE ON)
set(CMAKE_CXX_STANDARD 17)

add_subdirectory(../../../../MMKV/Core core)

include_directories(
        ${PACKAGE_NAME}
        "./"
)

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

find_package(ReactAndroid REQUIRED CONFIG)
find_library(log-lib log)

target_link_libraries(
        ${PACKAGE_NAME}
        core               
        ${log-lib}         
        ReactAndroid::jsi  
        android 
)
