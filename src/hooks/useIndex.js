import { useCallback, useEffect, useState } from "react";
import { methods } from "./constants";

export const useIndex = (keys, type, storage) => {
    const [values, setValues] = useState(
      storage.getMultipleItems(keys || [], type),
    );
  
    const onChange = useCallback(key => {
        setValues(values => {
          let index = values.findIndex(v => v[0] === key);
          let value = storage[methods[type]["get"]](key);
          if (value){
              if (index !== -1) {
              values[index][1] = value;
              } else {
                setValues(storage.getMultipleItems(keys || [], type),)
              }
          } else {
              values.splice(index)
          }
          return [...values];
        })
      },[]) 
  
    useEffect(() => {
      let names = keys.map(v => `${v}:onwrite`);
      storage.ev.subscribeMulti(
        names,
        onChange,
      );

      return () => {
        names.forEach(name => {
            storage.ev.unsubscribe(name,onChange);
        })
      }
      
    }, [keys,type]);

    const update = (key,value) => {
        storage[methods[type]["set"]](key,value);
    }
    
    const remove = (key) => {
        storage.removeItem(key);
    }
  
    return [values.map(v => v[1]),update,remove]
  };