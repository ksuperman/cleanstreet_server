var config_file;
if(process.env && process.env.env_type === "server") {
    config_file = require('./server_config.json');
} else {
    config_file = require('./dev_config.json.json');
}
module.exports = config_file;