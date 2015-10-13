jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore ../bin/my-release-key.keystore CordovaApp-release-unsigned.apk dchs

zipalign -v 4 CordovaApp-release-unsigned.apk DCHS.apk