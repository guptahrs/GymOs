let _showFn = null;

export function registerSnackbar(fn) {
  _showFn = fn;
}

export function unregisterSnackbar() {
  _showFn = null;
}

export function showSnackbar(message, type = "info") {
  if (_showFn) _showFn(message, type);
}
