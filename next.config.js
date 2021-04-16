require("dotenv").config();
// const withCSS = require('@zeit/next-css');
const webpack = require("webpack");

const apiKey = JSON.stringify(process.env.SHOPIFY_API_KEY);

module.exports = {
  webpack: (config) => {
    const env = {
      API_KEY: apiKey,
      firebaseApiKey: JSON.stringify(process.env.FIREBASE_API_KEY),
      firebaseAuthDomain: JSON.stringify(process.env.FIREBASE_AUTH_DOMAIN),
      firebaseDatabaseURL: JSON.stringify(process.env.FIREBASE_DATABASE_URL),
      firebaseProjectId: JSON.stringify(process.env.FIREBASE_PROJECT_ID),
      firebaseStorageBucket: JSON.stringify(
        process.env.FIREBASE_STORAGE_BUCKET
      ),
      firebaseMessagingSenderId: JSON.stringify(
        process.env.FIREBASE_MESSAGING_SENDER_ID
      ),
      firebaseAppId: JSON.stringify(process.env.FIREBASE_APP_ID),
      firebaseMeasurementId: JSON.stringify(
        process.env.FIREBASE_MEASUREMENT_ID
      ),
    };
    config.plugins.push(new webpack.DefinePlugin(env));
    return config;
  },
};
