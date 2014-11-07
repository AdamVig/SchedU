#App Update Process

1. Increment version code in config.xml
2. `cordova plugin rm org.apache.cordova.console`

##Android

1. `cordova build --release android`
2. `jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore schedu.keystore platforms/android/ant-build/SchedU-release-unsigned.apk schedu`
3. `zipalign -v 4 platforms/android/ant-build/SchedU-release-unsigned.apk SchedU.apk`
4. [Google Play Developer Console](https://play.google.com/apps/publish/) → SchedU → APK → Upload new APK to production
5. Update screenshots and description.

##iOS
1. `cordova build --release ios`
2. Open Xcode project.  
3. Make sure 'iOS Device' is selected as the simulator target.  
4. Product → Archive
5. Popup (Window → Organizer) → Validate → Submit
6. Update screenshots and description on iTunes Connect.