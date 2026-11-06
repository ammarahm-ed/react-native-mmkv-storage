use std::ffi::{c_char, CStr};

use keyring::Entry;

const SERVICE: &str = "react-native-mmkv-storage";

fn entry(alias: *const c_char) -> Option<Entry> {
    let alias = unsafe { alias.as_ref() }?;
    let alias = unsafe { CStr::from_ptr(alias) }.to_str().ok()?;
    Entry::new(SERVICE, alias).ok()
}

#[no_mangle]
pub extern "C" fn mmkv_secure_get(alias: *const c_char, out: *mut c_char, capacity: usize) -> isize {
    let Some(Ok(value)) = entry(alias).map(|e| e.get_password()) else {
        return -1;
    };
    if value.len() > capacity {
        return -1;
    }
    unsafe { std::ptr::copy_nonoverlapping(value.as_ptr(), out.cast(), value.len()) };
    value.len() as isize
}

#[no_mangle]
pub extern "C" fn mmkv_secure_set(alias: *const c_char, value: *const c_char) -> bool {
    let Some(entry) = entry(alias) else {
        return false;
    };
    let Some(value) = (unsafe { value.as_ref() })
        .and_then(|v| unsafe { CStr::from_ptr(v) }.to_str().ok())
    else {
        return false;
    };
    entry.set_password(value).is_ok()
}

#[no_mangle]
pub extern "C" fn mmkv_secure_exists(alias: *const c_char) -> bool {
    entry(alias).is_some_and(|e| e.get_password().is_ok())
}

#[no_mangle]
pub extern "C" fn mmkv_secure_remove(alias: *const c_char) -> bool {
    entry(alias).is_some_and(|e| matches!(e.delete_credential(), Ok(()) | Err(keyring::Error::NoEntry)))
}

pub fn rn_gpui_register() {
    std::hint::black_box([
        mmkv_secure_get as usize,
        mmkv_secure_set as usize,
        mmkv_secure_exists as usize,
        mmkv_secure_remove as usize,
    ]);
}
