import { defineConfig } from "vite";
import preact from "@preact/preset-vite";
import svgr from "vite-plugin-svgr";

// https://vitejs.dev/config/
export default defineConfig({
  base: '/thermo-cyclo-tron/',
  plugins: [
    svgr({
      svgrOptions: {
        jsxRuntime: "classic",
        pragma: "h",
        pragmaFrag: "Fragment",
        template: (variables, { tpl }) => {
          return tpl`
${variables.imports};
${variables.interfaces};
import { h } from 'preact';
const ${variables.componentName} = (${variables.props}) => (
  ${variables.jsx}
);
${variables.exports};
`;
        },
      },
      include: "**/*.svg?react",
    }),
    preact({
      prerender: {
        enabled: true,
        renderTarget: "#app",
      },
    }),
  ],
});
