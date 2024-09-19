// export const buttonStyle = ` mr-2";
// export const buttonStyle =
//   "text-sm h-5 px-2 text-indigo-700 transition-colors duration-150 border border-indigo-500 rounded-lg focus:shadow-outline hover:bg-indigo-500 hover:text-indigo-100 mr-2";

// const baseButtonStyle =
//   "text-sm h-5 px-2 transition-colors duration-150 border rounded-lg border-0 text-white mr-2 whitespace-nowrap";
// export const buttonStyle = `${baseButtonStyle} bg-stone-600`;

// const baseButtonStyle =
//   "text-sm h-5 px-2 transition-colors duration-150 border  mr-2 whitespace-nowrap border-0 font-bold opacity-50 hover:opacity-100";
const baseButtonStyle =
  "px-2 rounded-md  border border-stone-400 bg-white  mr-2 whitespace-nowrap bg-stone-200 hover:opacity-50 transition-opacity duration-150";
export const buttonStyle = `${baseButtonStyle}`;

export const linkStyle = "text-cyan-800";

export const denseButtonStyle = buttonStyle
  .replace("p-2", "p-1")
  .replace("px-2", "p-0")
  .replace("mr-2", "mr-0");

export const simpleTooltipRowStyle =
  "text-left px-2 hover:bg-stone-300 cursor-pointer";

export const controlButtonStyle =
  "border border-stone-400 rounded mr-2 h-8 w-8 flex justify-center items-center";
