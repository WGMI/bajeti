/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        Poppins: ["Poppins-Regular", "sans-serif"],
        PoppinsBlack: ["Poppins-Black", "sans-serif"],
        PoppinsBlackItalic: ["Poppins-BlackItalic", "sans-serif"],
        PoppinsBold: ["Poppins-Bold", "sans-serif"],
        PoppinsBoldItalic: ["Poppins-BoldItalic", "sans-serif"],
        PoppinsExtraBold: ["Poppins-ExtraBold", "sans-serif"],
        PoppinsExtraBoldItalic: ["Poppins-ExtraBoldItalic", "sans-serif"],
        PoppinsExtraLight: ["Poppins-ExtraLight", "sans-serif"],
        PoppinsExtraLightItalic: ["Poppins-ExtraLightItalic", "sans-serif"],
        PoppinsItalic: ["Poppins-Italic", "sans-serif"],
        PoppinsLight: ["Poppins-Light", "sans-serif"],
        PoppinsLightItalic: ["Poppins-LightItalic", "sans-serif"],
        PoppinsMedium: ["Poppins-Medium", "sans-serif"],
        PoppinsMediumItalic: ["Poppins-MediumItalic", "sans-serif"],
        PoppinsSemiBold: ["Poppins-SemiBold", "sans-serif"],
        PoppinsSemiBoldItalic: ["Poppins-SemiBoldItalic", "sans-serif"],
        PoppinsThin: ["Poppins-Thin", "sans-serif"],
        PoppinsThinItalic: ["Poppins-ThinItalic", "sans-serif"],
      }
    },
  },
  plugins: [],
}

