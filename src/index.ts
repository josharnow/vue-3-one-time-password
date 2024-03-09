// extends esm default export - import all from file
import component, * as namedExports from './index.esm';

// Attach named exports directly to component, only expose one global var, with named exports exposed as properties of that global var
Object.entries(namedExports).forEach(([exportName, exported]) => {
    if (exportName !== 'default') component[exportName] = exported;
});

export default component as typeof component & Exclude<typeof namedExports, 'default'>;
