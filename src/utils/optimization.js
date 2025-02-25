
export const debounce = (fn, delay) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn(...args), delay);
    };
  };
  
  export const memoize = (fn) => {
    const cache = new Map();
    return (...args) => {
      const key = JSON.stringify(args);
      return cache.has(key) ? cache.get(key) : (cache.set(key, fn(...args)) && cache.get(key));
    };
  };