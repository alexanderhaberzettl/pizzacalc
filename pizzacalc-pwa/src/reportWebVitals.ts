const reportWebVitals = (onPerfEntry?: (metric: unknown) => void) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then((vitals: any) => {
      vitals.onCLS?.(onPerfEntry);
      vitals.onINP?.(onPerfEntry);
      vitals.onFCP?.(onPerfEntry);
      vitals.onLCP?.(onPerfEntry);
      vitals.onTTFB?.(onPerfEntry);
    });
  }
};

export default reportWebVitals;
