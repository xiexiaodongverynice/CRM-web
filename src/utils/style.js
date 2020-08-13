export const checkPx = (value) => {
  const val = `${value}`;
  if(/px$/.test(value)) {
    return value;
  }else {
    return `${value}px`;
  }
}