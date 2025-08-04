// Test file to reproduce the TS2322 error
import { DeviceDetectorOptions } from './src/device/types';

// Test the type assignment issue
const testOptions: Required<DeviceDetectorOptions> = {
  debug: false,
  timeout: 5000,
  retries: 2,
  cache: true,
  cacheTTL: 5 * 60 * 1000,
  ua: undefined, // This should cause TS2322 error
  tablet: false,
  featureDetect: true,
  enablePerformanceMonitoring: false
};

console.log(testOptions);