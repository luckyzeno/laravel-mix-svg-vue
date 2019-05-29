let mix = require('laravel-mix');

class SvgVue {

    name() {
        return 'svgVue';
    }

    dependencies() {
        return ['img-loader', 'imagemin-svgo', 'raw-loader', 'fs', 'svg-vue'];
    }

    register(options) {
        this.options = Object.assign({
            extract: false,
            path: './resources/svg/',
            svgoSettings: [
                { removeTitle: true },
                { removeViewBox: false },
                { removeDimensions: true }
            ]
        }, options);
    }

    boot() {
        Mix.listen('configReady', config => {
            let search = [
                /(\.(png|jpe?g|gif|webp)$|^((?!font).)*\.svg$)/.toString(),
                /(\.(woff2?|ttf|eot|otf)$|font.*\.svg$)/.toString()
            ];

            config.module.rules.map(r => {
                if (search.includes(r.test.toString())) r.exclude = /\.svg$/;
            });
        });
    }

    webpackRules() {
        return {
            test: /\.svg$/,
            loaders: [
                {
                    loader: 'raw-loader'
                },

                {
                    loader: 'img-loader',
                    options: {
                        plugins: [
                            require('imagemin-svgo')({ plugins: this.options.svgoSettings })
                        ]
                    }
                }
            ]
        }
    }

    webpackConfig(webpackConfig) {
        let fs = require('fs');
        let svgPath = path.resolve(__dirname, process.cwd() + '/' + this.options.path);

        fs.mkdir(svgPath, error => {
            if (error && error.code === 'EEXIST') return null;
        });

        webpackConfig.resolve.alias['svg-files-path'] = svgPath;

        if (this.options.extract) {
            let svgAssetsObj = {
                test: svgPath,
                name: '/js/svg',
                chunks: 'all',
                enforce: true
            }

            if (webpackConfig.optimization.hasOwnProperty('splitChunks')) {
                webpackConfig.optimization.splitChunks.cacheGroups['svgAssets'] = svgAssetsObj;
            } else {
                webpackConfig.optimization = {
                    splitChunks: {
                        cacheGroups: {
                            svgAssets: svgAssetsObj
                        }
                    }
                }
            }
        }
    }

}

mix.extend('svgVue', new SvgVue());
