#!/usr/bin/env node

const { infon, warnn } = require("./log");
const postLinkAndroid = require("./postLinkAndroid");

postLinkAndroid();
//postLinkIOS();

infon(
  "\nreact-native-mmkv-storage link is completed. Check the logs above for more information.\n"
);
warnn(
  "   If any of the steps failed, check the installation docs and go through the necessary steps manually:"
);
warnn("   https://rnmmkv.vercel.app/#/gettingstarted\n");
infon(
  "When you're done, don't forget to update the index.js file as mentioned in docs!\n"
);
infon("Thank you for using react-native-mmkv-storage!\n\n");
