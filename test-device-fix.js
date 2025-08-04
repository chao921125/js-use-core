// Quick test to verify the device detector fix
import { DeviceDetector, getDeviceInfo } from './dist/device.js';

async function testDeviceDetector() {
  console.log('Testing DeviceDetector with default options...');
  
  try {
    // Test with default options (should use empty string for ua)
    const detector1 = new DeviceDetector();
    await detector1.initialize();
    const info1 = await detector1.getDeviceInfo();
    console.log('✓ Default options work:', info1.type);
    
    // Test with custom ua string
    const detector2 = new DeviceDetector({ ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)' });
    await detector2.initialize();
    const info2 = await detector2.getDeviceInfo();
    console.log('✓ Custom UA string works:', info2.type);
    
    // Test with empty ua string
    const detector3 = new DeviceDetector({ ua: '' });
    await detector3.initialize();
    const info3 = await detector3.getDeviceInfo();
    console.log('✓ Empty UA string works:', info3.type);
    
    // Test with ua object format
    const detector4 = new DeviceDetector({ 
      ua: { headers: { 'user-agent': 'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X)' } }
    });
    await detector4.initialize();
    const info4 = await detector4.getDeviceInfo();
    console.log('✓ UA object format works:', info4.type);
    
    console.log('\n✅ All device detector tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testDeviceDetector();