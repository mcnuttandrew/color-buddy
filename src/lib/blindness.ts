import ColorIO from "colorjs.io";
import { Color } from "./Color";

type Channels = [number, number, number];

// found at https://daltonlens.org/opensource-cvd-simulation/#Why-simulate-color-vision-deficiencies-(CVD)?
// derived from https://github.com/DaltonLens/libDaltonLens/blob/master/libDaltonLens.c

/*
    Brettel 1997 precomputed parameters.

    LMS model
    =========

    These values use the sRGB standard to go from linearRGB to CIE XYZ, and the
    Smith & Pokorny 1975 model for CIE XYZ to LMS. This is the LMS model used by
    Viénot, Brettel and Mollon, but upgraded to use the sRGB standard used by
    modern monitors.

    Projection Planes
    =================

    These were computed using RGB white as the neutral element, not the
    equal-energy E. This option is commonly chosen by the Brettel
    implementations (including Vischeck), and it increases the range of colors
    that project within the sRGB gamut and avoids clipping too much.

    DaltonLens-Python Code to regenerate
    ====================================

    simulator = simulate.Simulator_Brettel1997(convert.LMSModel_sRGB_SmithPokorny75())
    simulator.dumpPrecomputedValues = True
    simulator.simulate_cvd(np.zeros((1,1,3), dtype=np.uint8), simulate.Deficiency.PROTAN, severity=1.0)
    simulator.simulate_cvd(np.zeros((1,1,3), dtype=np.uint8), simulate.Deficiency.DEUTAN, severity=1.0)
    simulator.simulate_cvd(np.zeros((1,1,3), dtype=np.uint8), simulate.Deficiency.TRITAN, severity=1.0)

    Alternative code to get the same output as Vischeck (as implemented in GIMP display filters):
    simulator = simulate.Simulator_Vischeck()
    simulator.dumpPrecomputedValues = True
    simulator.simulate_cvd(np.zeros((1,1,3), dtype=np.uint8), simulate.Deficiency.PROTAN, severity=1.0)
    simulator.simulate_cvd(np.zeros((1,1,3), dtype=np.uint8), simulate.Deficiency.DEUTAN, severity=1.0)
    simulator.simulate_cvd(np.zeros((1,1,3), dtype=np.uint8), simulate.Deficiency.TRITAN, severity=1.0)


    The implementation got simplified to minimize compute (with the
    exact same output), refer to 
    https://daltonlens.org/cvd-simulation-svg-filters/ for more details.
*/

/*
    These parameters combine the full projection pipeline for each half-plane so
    we don't need an explicit transform to the LMS space.

    To check on which plane the LMS point should project we also don't need to
    actually compute the LMS coordinates, and can do it directly in the RGB space.
*/
interface DLBrettel1997Params {
  // Transformation using plane 1 == rgbFromLms . projection1 . lmsFromRgb
  rgbCvdFromRgb_1: number[]; //length 9
  // Full transformation using plane 2 == rgbFromLms . projection2 . lmsFromRgb
  rgbCvdFromRgb_2: number[]; //length 9
  // Normal of the separation plane to pick the right transform, already in the RGB space.
  // == normalInLms . lmsFromRgb
  separationPlaneNormalInRgb: number[]; //length 3
}

const brettel_protan_params: DLBrettel1997Params = {
  rgbCvdFromRgb_1: [
    0.1498, 1.19548, -0.34528, 0.10764, 0.84864, 0.04372, 0.00384, -0.0054,
    1.00156,
  ],
  rgbCvdFromRgb_2: [
    0.1457, 1.16172, -0.30742, 0.10816, 0.85291, 0.03892, 0.00386, -0.00524,
    1.00139,
  ],
  separationPlaneNormalInRgb: [0.00048, 0.00393, -0.00441],
};

const brettel_deutan_params: DLBrettel1997Params = {
  rgbCvdFromRgb_1: [
    0.36477, 0.86381, -0.22858, 0.26294, 0.64245, 0.09462, -0.02006, 0.02728,
    0.99278,
  ],
  rgbCvdFromRgb_2: [
    0.37298, 0.88166, -0.25464, 0.25954, 0.63506, 0.1054, -0.0198, 0.02784,
    0.99196,
  ],
  separationPlaneNormalInRgb: [-0.00281, -0.00611, 0.00892],
};
const brettel_tritan_params: DLBrettel1997Params = {
  rgbCvdFromRgb_1: [
    1.01277, 0.13548, -0.14826, -0.01243, 0.86812, 0.14431, 0.07589, 0.805,
    0.11911,
  ],
  rgbCvdFromRgb_2: [
    0.93678, 0.18979, -0.12657, 0.06154, 0.81526, 0.1232, -0.37562, 1.12767,
    0.24796,
  ],
  separationPlaneNormalInRgb: [0.03901, -0.02788, -0.01113],
};

type DLDeficiency = "deuteranopia" | "protanopia" | "tritanopia";
const deficiencyToMapBrettel = {
  deuteranopia: brettel_protan_params,
  protanopia: brettel_deutan_params,
  tritanopia: brettel_tritan_params,
};
function dl_simulate_cvd_brettel1997(
  deficiency: DLDeficiency,
  severity: number,
  color: Channels
) {
  let params: DLBrettel1997Params = deficiencyToMapBrettel[deficiency];

  const rgb = [...color];

  // Check on which plane we should project by comparing wih the separation plane normal.
  const n = params.separationPlaneNormalInRgb;
  const dotWithSepPlane = rgb[0] * n[0] + rgb[1] * n[1] + rgb[2] * n[2];
  const rgbCvdFromRgb =
    dotWithSepPlane >= 0 ? params.rgbCvdFromRgb_1 : params.rgbCvdFromRgb_2;

  const rgb_cvd = [
    rgbCvdFromRgb[0] * rgb[0] +
      rgbCvdFromRgb[1] * rgb[1] +
      rgbCvdFromRgb[2] * rgb[2],
    rgbCvdFromRgb[3] * rgb[0] +
      rgbCvdFromRgb[4] * rgb[1] +
      rgbCvdFromRgb[5] * rgb[2],
    rgbCvdFromRgb[6] * rgb[0] +
      rgbCvdFromRgb[7] * rgb[1] +
      rgbCvdFromRgb[8] * rgb[2],
  ];

  // Apply the severity factor as a linear interpolation.
  // It's the same to do it in the RGB space or in the LMS
  // space since it's a linear transform.
  rgb_cvd[0] = rgb_cvd[0] * severity + rgb[0] * (1 - severity);
  rgb_cvd[1] = rgb_cvd[1] * severity + rgb[1] * (1 - severity);
  rgb_cvd[2] = rgb_cvd[2] * severity + rgb[2] * (1 - severity);
  return rgb_cvd;
}

/*
    Viénot 1999 precomputed parameters.

    This follows the paper exactly, but using the modern sRGB standard to decode
    the input RGB values.

    Since there is only one projection plane, the entire pipeline can be reduced
    to a single 3x3 matrix multiplication in the linearRGB space.

    DaltonLens-Python Code to regenerate
    ====================================

    simulator =
    simulate.Simulator_Vienot1999(convert.LMSModel_sRGB_SmithPokorny75())
    simulator.dumpPrecomputedValues = True
    simulator.simulate_cvd(np.zeros((1,1,3), dtype=np.uint8), simulate.Deficiency.PROTAN, severity=1.0)
    simulator.simulate_cvd(np.zeros((1,1,3), dtype=np.uint8), simulate.Deficiency.DEUTAN, severity=1.0)
    simulator.simulate_cvd(np.zeros((1,1,3), dtype=np.uint8), simulate.Deficiency.TRITAN, severity=1.0)
*/

const dl_vienot_protan_rgbCvd_from_rgb: number[] = [
  0.11238, 0.88762, 0.0, 0.11238, 0.88762, -0.0, 0.00401, -0.00401, 1.0,
];

const dl_vienot_deutan_rgbCvd_from_rgb: number[] = [
  0.29275, 0.70725, 0.0, 0.29275, 0.70725, -0.0, -0.02234, 0.02234, 1.0,
];

// WARNING: Viénot 1999 is not accurate for tritanopia. Use Brettel 1997 instead.
const dl_vienot_tritan_rgbCvd_from_rgb: number[] = [
  1.0, 0.14461, -0.14461, 0.0, 0.85924, 0.14076, -0.0, 0.85924, 0.14076,
];

const deficiencyToMap = {
  deuteranopia: dl_vienot_protan_rgbCvd_from_rgb,
  protanopia: dl_vienot_deutan_rgbCvd_from_rgb,
  tritanopia: dl_vienot_tritan_rgbCvd_from_rgb,
};

function dl_simulate_cvd_vienot1999(
  deficiency: DLDeficiency,
  severity: number,
  color: Channels
) {
  let rgbCvd_from_rgb: number[] = deficiencyToMap[deficiency];

  const rgb = [...color];

  // rgb_cvd = rgbCvd_from_rgb * rgb
  let rgb_cvd = [
    rgbCvd_from_rgb[0] * rgb[0] +
      rgbCvd_from_rgb[1] * rgb[1] +
      rgbCvd_from_rgb[2] * rgb[2],
    rgbCvd_from_rgb[3] * rgb[0] +
      rgbCvd_from_rgb[4] * rgb[1] +
      rgbCvd_from_rgb[5] * rgb[2],
    rgbCvd_from_rgb[6] * rgb[0] +
      rgbCvd_from_rgb[7] * rgb[1] +
      rgbCvd_from_rgb[8] * rgb[2],
  ];

  // Implement the severity factor as a linear interpolation.
  if (severity < 0.999) {
    rgb_cvd[0] = severity * rgb_cvd[0] + (1 - severity) * rgb[0];
    rgb_cvd[1] = severity * rgb_cvd[1] + (1 - severity) * rgb[1];
    rgb_cvd[2] = severity * rgb_cvd[2] + (1 - severity) * rgb[2];
  }
  return rgb_cvd;
}

function blackAndWhite(color: Channels): Channels {
  const [r, g, b] = color;
  // https://stackoverflow.com/questions/687261/converting-rgb-to-grayscale-intensity
  const y = 0.2126 * r + 0.7152 * g + 0.0722 * b;

  return [y, y, y];
}

function dl_simulate_cvd(
  deficiency: DLDeficiency | "black-and-white",
  severity: number,
  color: Channels
): Channels {
  // Viénot 1999 is not accurate for tritanopia, so use Brettel in that case.
  // Otherwise use Viénot 1999 because it's a bit faster.
  if (deficiency == "black-and-white") {
    return blackAndWhite(color);
  }
  if (deficiency == "tritanopia") {
    return dl_simulate_cvd_brettel1997(deficiency, severity, color) as [
      number,
      number,
      number
    ];
  } else {
    return dl_simulate_cvd_vienot1999(deficiency, severity, color) as [
      number,
      number,
      number
    ];
  }
}

export default function simulate_cvd(
  deficiency: DLDeficiency,
  color: Color,
  severity: number = 1
): Color {
  const colorIOcolor = color.toColorIO();
  const transformedColor = colorIOcolor.to("srgb");
  const coords = transformedColor.coords;
  const newCoords = dl_simulate_cvd(deficiency, severity, coords);
  const newColorIO = new ColorIO("srgb", newCoords).to(color.spaceName);
  const newColor = color.fromChannels(newColorIO.coords);
  return newColor;
}
