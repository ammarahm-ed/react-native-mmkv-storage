get_filename_component(_mmkv_root "${CMAKE_CURRENT_LIST_DIR}/.." ABSOLUTE)
set(_core "${_mmkv_root}/MMKV/Core")

set(_mmkv_core_sources
  ${_core}/MMKV.cpp
  ${_core}/MMKV_IO.cpp
  ${_core}/MMKVLog.cpp
  ${_core}/CodedInputData.cpp
  ${_core}/CodedInputDataCrypt.cpp
  ${_core}/CodedOutputData.cpp
  ${_core}/KeyValueHolder.cpp
  ${_core}/PBUtility.cpp
  ${_core}/MiniPBCoder.cpp
  ${_core}/MMBuffer.cpp
  ${_core}/InterProcessLock.cpp
  ${_core}/MemoryFile.cpp
  ${_core}/ThreadLock.cpp
  ${_core}/aes/AESCrypt.cpp
  ${_core}/aes/openssl/openssl_aes_core.cpp
  ${_core}/aes/openssl/openssl_cfb128.cpp
  ${_core}/aes/openssl/openssl_md5_dgst.cpp
  ${_core}/aes/openssl/openssl_md5_one.cpp
  ${_core}/crc32/crc32_armv8.cpp
  ${_core}/crc32/zlib/crc32.cpp)
if(WIN32)
  list(APPEND _mmkv_core_sources
    ${_core}/MMKV_OSX.cpp
    ${_core}/InterProcessLock_Win32.cpp
    ${_core}/MemoryFile_Win32.cpp
    ${_core}/ThreadLock_Win32.cpp)
elseif(APPLE)
  list(APPEND _mmkv_core_sources
    ${_core}/MMKV_OSX.cpp
    ${_core}/MemoryFile_OSX.cpp)
else()
  list(APPEND _mmkv_core_sources
    ${_core}/MMKV_OSX.cpp
    ${_core}/MemoryFile_Linux.cpp)
endif()
if(APPLE AND CMAKE_SYSTEM_PROCESSOR MATCHES "arm64|aarch64")
  set(_mmkv_aes_arm "${CMAKE_CURRENT_BINARY_DIR}/mmkv-aes-arm.s")
  execute_process(
    COMMAND ${CMAKE_CXX_COMPILER} -E -P -x assembler-with-cpp
      -I${_core}/aes/openssl
      ${_core}/aes/openssl/openssl_aesv8-armx.S
      -o ${_mmkv_aes_arm}
    COMMAND_ERROR_IS_FATAL ANY)
  list(APPEND _mmkv_core_sources "${CMAKE_CURRENT_LIST_DIR}/cpp/aes-arm.cpp")
  set_property(GLOBAL APPEND PROPERTY RN_GPUI_APP_CPP_DEFINITIONS
    "MMKV_AES_ARM_ASM=\"${_mmkv_aes_arm}\"")
endif()
list(APPEND _mmkv_core_sources
  ${_core}/CodedInputData_OSX.cpp
  ${_core}/CodedInputDataCrypt_OSX.cpp
  ${_core}/MiniPBCoder_OSX.cpp)

set_property(GLOBAL APPEND PROPERTY RN_GPUI_APP_CPP_SOURCES
  ${_mmkv_core_sources}
  "${CMAKE_CURRENT_LIST_DIR}/cpp/mmkv-adapter.cpp"
  "${CMAKE_CURRENT_LIST_DIR}/cpp/MMKVStorageModule.cpp")
set_property(GLOBAL APPEND PROPERTY RN_GPUI_APP_CPP_INCLUDE_DIRS
  "${_core}"
  "${_core}/include"
  "${CMAKE_CURRENT_LIST_DIR}/cpp")
set_property(GLOBAL APPEND PROPERTY RN_GPUI_APP_CPP_DEFINITIONS
  MMKV_EMBED_ZLIB=1)
if(APPLE)
  set_property(GLOBAL APPEND PROPERTY RN_GPUI_APP_CPP_DEFINITIONS FORCE_POSIX)
endif()
if(WIN32)
  set_property(GLOBAL APPEND PROPERTY RN_GPUI_APP_CPP_DEFINITIONS UNICODE _UNICODE)
endif()
