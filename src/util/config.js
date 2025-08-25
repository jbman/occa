/**
 * Handles all configuration options for the application in a generic way. Contains no domain specific logic or config settings.
 * A config is a flat JSON object. Session storage is used to persist this config object across requests.
 */

// Loads config from session storage, updates config object, populates values to input elements.
function load(defaultConfig) {
  let config = { ...defaultConfig };

  // Try to load config
  let sessionConfig;
  try {
    sessionConfig = window.sessionStorage.getItem("config");
  } catch (error) {
    console.log("Failed loading config from sessionStorage", error);
  }

  if (sessionConfig) {
    try {
      config = JSON.parse(sessionConfig);
      console.log("Config loaded from session storage", config);
    } catch (error) {
      // Remove unparsable config
      window.sessionStorage.removeItem("config");
      console.log("Unparsable config removed from session storage");
    }
  }
  return writeInputElements(config);
}

// Merge config options from URL parameters into provided config. 
// All keys present in provided config object can also be provided as URL parameter.
function readFromUrl(config, urlSearchParamEntries) {
  let mergedConfig = { ...config };  
  console.log("Following config properties can be provided as URL parameters: " + Object.keys(config).join(', '));
  for (const [key, value] of urlSearchParamEntries) {
    if( key in config) {
      console.log(`Config option provided as URL parameter: ${key}=${value}`);
      mergedConfig[key] = value;
    }
  }
  return writeInputElements(mergedConfig);
}

// Populate config object to input elements and return the same unmodified config object.
// This should be done when code (and not user) modified the config object.
function writeInputElements(config) {
  for (const prop in config) {
    const node = document.getElementById(prop);
    if (node) {
      node.value = config[prop];
      /*
      console.log(
        `Element value of '${node.id}' set to config[${prop}] = '${config[prop]}'`
      );
      */
    }
  }
  return config;
}

function readInputElements(config) {
  // Read from input elements
  for (const prop in config) {
    const node = document.getElementById(prop);
    if (node) {
      config[prop] = node.value;
      /*
      console.log(
        `config.${prop} set to value of element '${node.id}' which is '${config[prop]}'`
      );
      */
    }
  }
  return config;
}

// Fills values from input to config object and stores config object in session storage.
// This should be done when the user starts an operation which uses the config.
function storeInputValues(config) {
  config = readInputElements(config);
  window.sessionStorage.setItem("config", JSON.stringify(config));
  console.log("Config stored at session storage", config);
}

function reset(defaultConfig) {
  window.sessionStorage.removeItem("config");
  return load(defaultConfig);
}

export default {
  load,
  readFromUrl,
  writeInputElements,
  readInputElements,
  storeInputValues,
  reset,
};
