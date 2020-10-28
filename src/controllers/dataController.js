import searchEngine from "../services/search";

/**
 * Prepare data from data source
 *
 * @param {Promise} request - The fetched data promise
 * @param {Function} callback - The callback function
 */
const prepareData = (request, callback) => {
  // Resolve the incoming data promise
  Promise.resolve(request).then((data) => {
    // Pass the data value to the callback function
    callback(data);
  });
};

/**
 * Gets the input search value "query"
 *
 * @param {Element} inputField - autoCompleteJS input field or textarea element
 */
const getInputValue = (inputField) => {
  return inputField instanceof HTMLInputElement || inputField instanceof HTMLTextAreaElement
    ? inputField.value.toLowerCase()
    : inputField.innerHTML.toLowerCase();
};

/**
 * Intercept query value
 *
 * @param {Element} inputField - autoCompleteJS input field
 * @param {String} query - User's search query value
 *
 * @return queryValue
 */
const prepareQueryValue = (inputValue, query) => {
  return query && query.manipulate ? query.manipulate(inputValue) : inputValue;
};

/**
 * App triggering condition
 *
 * @param {Object} trigger - Trigger Object with the condition function
 * @param {String} queryValue - User's search query value string after manipulation
 * @param {Number} threshold - The threshold value number
 *
 * @return triggerCondition
 */
const checkTriggerCondition = (trigger, queryValue, threshold) => {
  return trigger.condition
    ? trigger.condition(queryValue)
    : queryValue.length >= threshold && queryValue.replace(/ /g, "").length;
};

/**
 * List search matching results
 *
 * @param {String} query - User's search query string
 * @param {Object} data - The available data object
 * @param {Object} config - The search engine configurations
 *
 * @return {Array} - The matching results list array
 */
const listMatchingResults = (query, data, config) => {
  // Final highlighted results list
  const resList = [];
  // Checks input has matches in data source
  for (let index = 0; index < data.length; index++) {
    const record = data[index];
    // Search/Matching function
    const search = (key) => {
      // This Record value
      const recordValue = key ? record[key] : record;
      // Check if record does exist before search
      if (recordValue) {
        // Holds match value
        const match =
          typeof config.searchEngine === "function"
            ? config.searchEngine(query, recordValue)
            : searchEngine(query, recordValue, config);
        // Push match to results list with key if set
        if (match && key) {
          resList.push({
            key,
            index,
            match,
            value: record,
          });
          // Push match to results list without key if not set
        } else if (match && !key) {
          resList.push({
            index,
            match,
            value: record,
          });
        }
      }
    };
    // If no data key not set
    if (config.key) {
      // If data key is set
      // Iterates over all set data keys
      for (const key of config.key) {
        search(key);
      }
    } else {
      search();
    }
  }
  // Sorting / Slicing final results list
  const list = config.sort
    ? resList.sort(config.sort).slice(0, config.maxResults)
    : resList.slice(0, config.maxResults);
  // Returns rendered list
  return list;
};

export { prepareData, getInputValue, prepareQueryValue, checkTriggerCondition, listMatchingResults };