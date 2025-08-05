const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Universal Yoga Customer App - Setup Verification\n');

const checks = [
  {
    name: 'Node.js',
    command: 'node --version',
    minVersion: 'v16.0.0',
  },
  {
    name: 'npm',
    command: 'npm --version',
    minVersion: '8.0.0',
  },
  {
    name: 'Java (JDK)',
    command: 'java -version',
    contains: 'version',
  },
  {
    name: 'Android Debug Bridge (ADB)',
    command: 'adb --version',
    contains: 'Android Debug Bridge',
  },
];

const environmentVariables = ['JAVA_HOME', 'ANDROID_HOME'];

const requiredFiles = ['android/app/google-services.json'];

console.log('📋 Checking installed software...\n');

// Check software installations
checks.forEach((check) => {
  try {
    const output = execSync(check.command, { encoding: 'utf8', stdio: 'pipe' });

    if (check.minVersion) {
      const version = output.trim();
      console.log(`✅ ${check.name}: ${version}`);
    } else if (check.contains && output.includes(check.contains)) {
      console.log(`✅ ${check.name}: Installed`);
    } else {
      console.log(`✅ ${check.name}: Available`);
    }
  } catch (error) {
    console.log(`❌ ${check.name}: Not found or not in PATH`);

    if (check.name === 'Java (JDK)') {
      console.log(
        '   💡 Install JDK 11 and set JAVA_HOME environment variable'
      );
    } else if (check.name === 'Android Debug Bridge (ADB)') {
      console.log('   💡 Install Android SDK and add to PATH');
    }
  }
});

console.log('\n🌍 Checking environment variables...\n');

// Check environment variables
environmentVariables.forEach((envVar) => {
  const value = process.env[envVar];
  if (value) {
    console.log(`✅ ${envVar}: ${value}`);

    // Check if path exists
    if (fs.existsSync(value)) {
      console.log(`   📁 Path exists`);
    } else {
      console.log(`   ⚠️  Path does not exist`);
    }
  } else {
    console.log(`❌ ${envVar}: Not set`);

    if (envVar === 'JAVA_HOME') {
      console.log(
        '   💡 Set to your JDK installation path (e.g., C:\\Program Files\\Java\\jdk-11.x.x)'
      );
    } else if (envVar === 'ANDROID_HOME') {
      console.log(
        '   💡 Set to your Android SDK path (e.g., C:\\Users\\YourUsername\\AppData\\Local\\Android\\Sdk)'
      );
    }
  }
});

console.log('\n📱 Checking React Native project setup...\n');

// Check package.json
if (fs.existsSync('package.json')) {
  console.log('✅ package.json: Found');

  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

    // Check if it's a React Native project
    if (packageJson.dependencies && packageJson.dependencies['react-native']) {
      console.log(
        `✅ React Native: ${packageJson.dependencies['react-native']}`
      );
    } else {
      console.log('❌ React Native: Not found in dependencies');
    }

    // Check for required dependencies
    const requiredDeps = [
      '@react-native-firebase/app',
      '@react-native-firebase/firestore',
      '@react-navigation/native',
      'react-native-vector-icons',
    ];

    console.log('\n📦 Checking dependencies...');
    requiredDeps.forEach((dep) => {
      if (packageJson.dependencies && packageJson.dependencies[dep]) {
        console.log(`✅ ${dep}: ${packageJson.dependencies[dep]}`);
      } else {
        console.log(`❌ ${dep}: Not installed`);
        console.log(`   💡 Run: npm install ${dep}`);
      }
    });
  } catch (error) {
    console.log('❌ package.json: Invalid JSON format');
  }
} else {
  console.log('❌ package.json: Not found');
  console.log("   💡 Make sure you're in the React Native project directory");
}

console.log('\n🔥 Checking Firebase configuration...\n');

// Check Firebase files
requiredFiles.forEach((file) => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}: Found`);
  } else {
    console.log(`❌ ${file}: Not found`);
    console.log(
      '   💡 Download from Firebase Console and place in android/app/ directory'
    );
  }
});

console.log('\n📂 Checking project structure...\n');

// Check project structure
const expectedDirs = [
  'src',
  'src/components',
  'src/screens',
  'src/services',
  'src/context',
  'src/navigation',
  'android',
  'android/app',
];

expectedDirs.forEach((dir) => {
  if (fs.existsSync(dir)) {
    console.log(`✅ ${dir}/: Exists`);
  } else {
    console.log(`⚠️  ${dir}/: Missing - will be created`);
  }
});

console.log('\n🚀 Next steps:\n');
console.log('1. Fix any ❌ issues shown above');
console.log('2. Run: npx react-native start');
console.log('3. In another terminal: npx react-native run-android');
console.log(
  '4. If you see the React Native welcome screen, setup is complete!'
);
console.log('\n💡 Need help? Check the setup guide or ask for assistance.');

// Check if Android emulator is running
console.log('\n📱 Checking Android emulator...\n');
try {
  const devices = execSync('adb devices', { encoding: 'utf8' });
  const deviceLines = devices
    .split('\n')
    .filter((line) => line.includes('\tdevice'));

  if (deviceLines.length > 0) {
    console.log(`✅ Android devices connected: ${deviceLines.length}`);
    deviceLines.forEach((line) => {
      const deviceId = line.split('\t')[0];
      console.log(`   📱 ${deviceId}`);
    });
  } else {
    console.log('⚠️  No Android devices/emulators detected');
    console.log('   💡 Start an Android Virtual Device from Android Studio');
  }
} catch (error) {
  console.log('❌ Could not check Android devices (ADB not available)');
}
