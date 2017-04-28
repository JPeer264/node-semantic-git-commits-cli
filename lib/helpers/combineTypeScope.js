const combineTypeScope = (type, scope) => {
  let thisType = type;
  let thisScope = scope;

  if (thisScope === undefined) {
    thisScope = '';
  }

  // add scope correctly if ':' is at the end
  if (thisScope.length > 0) {
    if (thisType.charAt(thisType.length - 1) === ':') {
      thisType = thisType.slice(0, thisType.length - 1);
      thisType = `${thisType} ${thisScope}:`;
    } else {
      thisType = `${thisType} ${thisScope}`;
    }
  }

  return thisType;
};

export default combineTypeScope;