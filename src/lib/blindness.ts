import ColorIO from "colorjs.io";
import { Color } from "./Color";

type Channels = [number, number, number];

// Code adapted from libDaltonLens https://daltonlens.org (public domain)
// then adapted to color-pal-builder from https://github.com/MaPePeR/jsColorblindSimulator

const brettelFunctions: Record<string, (v: Channels) => Channels> = {
  normal: (v) => v,
  protanopia: (v) => brettel(v, "protan", 1.0),
  protanomaly: (v) => brettel(v, "protan", 0.6),
  deuteranopia: (v) => brettel(v, "deutan", 1.0),
  deuteranomaly: (v) => brettel(v, "deutan", 0.6),
  tritanopia: (v) => brettel(v, "tritan", 1.0),
  tritanomaly: (v) => brettel(v, "tritan", 0.6),
  achromatopsia: (v) => monochrome_with_severity(v, 1.0),
  achromatomaly: (v) => monochrome_with_severity(v, 0.6),
};
type DLDeficiency = keyof typeof brettelFunctions;

const brettel_params = {
  protan: {
    rgbCvdFromRgb_1: [
      0.1451, 1.20165, -0.34675, 0.10447, 0.85316, 0.04237, 0.00429, -0.00603,
      1.00174,
    ],
    rgbCvdFromRgb_2: [
      0.14115, 1.16782, -0.30897, 0.10495, 0.8573, 0.03776, 0.00431, -0.00586,
      1.00155,
    ],
    separationPlaneNormal: [0.00048, 0.00416, -0.00464],
  },

  deutan: {
    rgbCvdFromRgb_1: [
      0.36198, 0.86755, -0.22953, 0.26099, 0.64512, 0.09389, -0.01975, 0.02686,
      0.99289,
    ],
    rgbCvdFromRgb_2: [
      0.37009, 0.8854, -0.25549, 0.25767, 0.63782, 0.10451, -0.0195, 0.02741,
      0.99209,
    ],
    separationPlaneNormal: [-0.00293, -0.00645, 0.00938],
  },

  tritan: {
    rgbCvdFromRgb_1: [
      1.01354, 0.14268, -0.15622, -0.01181, 0.87561, 0.13619, 0.07707, 0.81208,
      0.11085,
    ],
    rgbCvdFromRgb_2: [
      0.93337, 0.19999, -0.13336, 0.05809, 0.82565, 0.11626, -0.37923, 1.13825,
      0.24098,
    ],
    separationPlaneNormal: [0.0396, -0.02831, -0.01129],
  },
};

// accepts only 3 element arrays
const dot = (a: number[], b: number[]) =>
  a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const lerp = (a: Channels, b: Channels, t: number): Channels =>
  a.map((v, i) => v * (1 - t) + b[i] * t) as Channels;

// accepts linear rgb first
function brettel(
  rgb: Channels,
  t: keyof typeof brettel_params,
  severity: number
): Channels {
  const { separationPlaneNormal, rgbCvdFromRgb_1, rgbCvdFromRgb_2 } =
    brettel_params[t];
  // Check on which plane we should project by comparing wih the separation plane normal.
  var dotWithSepPlane = dot(rgb, separationPlaneNormal as Channels);
  var rgbCvdFromRgb = dotWithSepPlane >= 0 ? rgbCvdFromRgb_1 : rgbCvdFromRgb_2;

  // Transform to the full dichromat projection plane.
  var rgb_cvd = Array(3) as Channels;
  rgb_cvd[0] = dot(rgbCvdFromRgb.slice(0, 3), rgb);
  rgb_cvd[1] = dot(rgbCvdFromRgb.slice(3, 6), rgb);
  rgb_cvd[2] = dot(rgbCvdFromRgb.slice(6, 9), rgb);

  // Apply the severity factor as a linear interpolation.
  // It's the same to do it in the RGB space or in the LMS
  // space since it's a linear transform.
  return lerp(rgb, rgb_cvd, severity);
}

// Adjusted from the hcirn code
function monochrome_with_severity(srgb: Channels, severity: number): Channels {
  const z = Math.round(srgb[0] * 0.299 + srgb[1] * 0.587 + srgb[2] * 0.114);
  return lerp(srgb, [z, z, z], severity);
}

function blackAndWhite(color: Channels): Channels {
  const [r, g, b] = color;
  // https://stackoverflow.com/questions/687261/converting-rgb-to-grayscale-intensity
  const y = 0.2126 * r + 0.7152 * g + 0.0722 * b;

  return [y, y, y];
}

function dl_simulate_cvd(
  deficiency: DLDeficiency | "grayscale",
  color: Channels
): Channels {
  if (deficiency == "grayscale") {
    return blackAndWhite(color);
  }
  return brettelFunctions[deficiency](color);
}

export default function simulate_cvd(
  deficiency: DLDeficiency,
  color: Color
): Color {
  const colorIOcolor = color.toColorIO();
  const isachroma =
    deficiency == "achromatopsia" || deficiency == "achromatomaly";
  const spaceName = isachroma ? "srgb" : "srgb-linear";
  const transformedColor = colorIOcolor.to(spaceName);
  const coords = transformedColor.coords;
  const newCoords = dl_simulate_cvd(deficiency, coords);
  const newColorIO = new ColorIO(spaceName, newCoords).to(color.spaceName);

  return color.fromChannels(newColorIO.coords);
}
