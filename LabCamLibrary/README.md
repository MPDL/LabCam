
# react-native-lab-cam-library

## Getting started

`$ npm install react-native-lab-cam-library --save`

### Mostly automatic installation

`$ react-native link react-native-lab-cam-library`

### Manual installation


#### iOS

1. In XCode, in the project navigator, right click `Libraries` ➜ `Add Files to [your project's name]`
2. Go to `node_modules` ➜ `react-native-lab-cam-library` and add `RNLabCamLibrary.xcodeproj`
3. In XCode, in the project navigator, select your project. Add `libRNLabCamLibrary.a` to your project's `Build Phases` ➜ `Link Binary With Libraries`
4. Run your project (`Cmd+R`)<

#### Android

1. Open up `android/app/src/main/java/[...]/MainActivity.java`
  - Add `import com.reactlibrary.RNLabCamLibraryPackage;` to the imports at the top of the file
  - Add `new RNLabCamLibraryPackage()` to the list returned by the `getPackages()` method
2. Append the following lines to `android/settings.gradle`:
  	```
  	include ':react-native-lab-cam-library'
  	project(':react-native-lab-cam-library').projectDir = new File(rootProject.projectDir, 	'../node_modules/react-native-lab-cam-library/android')
  	```
3. Insert the following lines inside the dependencies block in `android/app/build.gradle`:
  	```
      compile project(':react-native-lab-cam-library')
  	```

#### Windows
[Read it! :D](https://github.com/ReactWindows/react-native)

1. In Visual Studio add the `RNLabCamLibrary.sln` in `node_modules/react-native-lab-cam-library/windows/RNLabCamLibrary.sln` folder to their solution, reference from their app.
2. Open up your `MainPage.cs` app
  - Add `using Lab.Cam.Library.RNLabCamLibrary;` to the usings at the top of the file
  - Add `new RNLabCamLibraryPackage()` to the `List<IReactPackage>` returned by the `Packages` method


## Usage
```javascript
import RNLabCamLibrary from 'react-native-lab-cam-library';

// TODO: What to do with the module?
RNLabCamLibrary;
```
  