const path = require('path');

module.exports = {
  mode: 'production',
  
  resolve: {
    extensions: ['', '.js', '.jsx']
  },

  module: {
    rules: [
        {
            test: /\.js$/,
            exclude: /node_modules/,
            loader: 'babel-loader',
            options: {
                presets: [
                  "@babel/react",
                  "@babel/preset-env"
                ],
            },
        },
    ]
  }
};